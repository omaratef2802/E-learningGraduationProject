
 /**
 * End-to-end smoke test for the student learning player API.
 *
 * Exercises the exact behaviours the learner UI depends on:
 *   - GET  /learning/:courseId/state         -> section 1 unlocked, section 2 locked
 *   - GET  .../lesson/:firstLessonId         -> first lesson opens
 *   - GET  .../lesson/:lockedLessonId        -> locked lesson is refused (403)
 *   - POST .../lesson/:firstId/complete      -> progress stored, next lesson unlocks
 *   - locked quiz refused, then open once its lessons are done
 *   - POST /learning/quiz/:quizId/attempt    -> returns a percentage score
 *
 * Run with:  node src/scripts/seed/testLearningFlow.js
 */
require("dotenv").config();

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../../modules/dbUsers");
const Course = require("../../modules/dbCourse");
const Section = require("../../modules/dbSection");
const Lesson = require("../../modules/dbLesson");
const Quiz = require("../../modules/dbQuizs");
const Enrollment = require("../../modules/dbEnrollement");
const QuizAttempt = require("../../modules/dbQuizAttempt");

const BASE = "http://localhost:3000/E-learning";
const TEST_EMAIL = "learning-flow-smoke@test.local";

const request = async (path, { method = "GET", token, body } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { authorization: token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
};

const assert = (condition, message) => {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
  console.log(`  ✓ ${message}`);
};

(async () => {
  await mongoose.connect(process.env.URL_MONGO);

  // -------- fixtures: a student + an enrollment in a seeded course --------
  const course = await Course.findOne({ status: "published" });
  if (!course) throw new Error("No published course found — run the curriculum seed first.");

  const sections = await Section.find({ courseId: course._id }).sort({ order: 1 });
  assert(sections.length >= 2, `course has at least 2 sections (found ${sections.length})`);

  const lessonsBySection = {};
  for (const section of sections) {
    lessonsBySection[String(section._id)] = await Lesson.find({ sectionId: section._id }).sort({ order: 1 });
  }

  let student = await User.findOne({ email: TEST_EMAIL });
  if (!student) {
    student = await User.create({
      firstName: "Smoke",
      lastName: "Tester",
      email: TEST_EMAIL,
      password: "Test1234!",
      role: "student",
      isActive: true,
    });
  }
  const token = jwt.sign(
    { userId: student._id, role: "student", fullname: "Smoke Tester" },
    process.env.SECRET,
    { expiresIn: "1h" },
  );

  await Enrollment.deleteOne({ studentId: student._id, courseId: course._id });
  await Enrollment.create({ studentId: student._id, courseId: course._id, completedLessons: [], progress: 0, status: "not-started" });

  // -------- 1. initial state --------
  console.log("\n1) Initial learning state");
  const initial = await request(`/learning/${course._id}/state`, { token });
  assert(initial.status === 200, "state endpoint returns 200");
  const state = initial.json.data;
  assert(state.sections[0].unlocked === true, "section 1 is unlocked");
  assert(state.sections[1].unlocked === false, "section 2 is LOCKED while section 1 is incomplete");
  assert(state.sections[0].lessons[0].unlocked === true, "first lesson is unlocked");
  assert(state.sections[0].lessons[1].unlocked === false, "second lesson is locked behind the first");
  if (state.sections[0].finalQuiz) {
    assert(state.sections[0].finalQuiz.unlocked === false, "section 1 final quiz is locked until its lessons are done");
  }

  // -------- 2. locked lesson refused --------
  console.log("\n2) Locked content is refused server-side");
  const lockedLesson = lessonsBySection[String(sections[0]._id)][1];
  const lockedRes = await request(`/learning/${course._id}/lesson/${lockedLesson._id}`, { token });
  assert(lockedRes.status === 403, "opening a locked lesson is refused with 403");

  // -------- 3. open the first lesson; completing it needs its quiz first -----
  console.log("\n3) Open the first lesson and verify the quiz gate");
  const firstLesson = lessonsBySection[String(sections[0]._id)][0];
  const openRes = await request(`/learning/${course._id}/lesson/${firstLesson._id}`, { token });
  assert(openRes.status === 200, "first lesson content loads");

  const firstLessonDoc = await Lesson.findById(firstLesson._id).populate("quizId");
  let lessonQuiz = firstLessonDoc.quizId;

  if (lessonQuiz) {
    const blockedComplete = await request(`/learning/${course._id}/lesson/${firstLesson._id}/complete`, { method: "POST", token });
    assert(blockedComplete.status === 403, "a lesson with an unattempted quiz cannot be completed yet");
  } else {
    const completeRes = await request(`/learning/${course._id}/lesson/${firstLesson._id}/complete`, { method: "POST", token });
    assert(completeRes.status === 200, "first lesson marks complete");
    assert(completeRes.json.data.sections[0].lessons[1].unlocked === true, "second lesson unlocked after finishing the first");
  }

  // -------- 4. take the first lesson's quiz and read the score -----
  if (lessonQuiz) {
    console.log("\n4) Lesson quiz returns a score and unlocks completion");
    const quizRes = await request(`/learning/quiz/${lessonQuiz._id}`, { token });
    assert(quizRes.status === 200, "lesson quiz loads for the enrolled student");
    assert(quizRes.json.data.questions[0].correctAnswer === undefined, "correct answers are NOT leaked to the client");

    const answers = lessonQuiz.questions.map((q, index) => ({ questionIndex: index, selectedAnswer: q.correctAnswer }));
    const attempt = await request(`/learning/quiz/${lessonQuiz._id}/attempt`, { method: "POST", token, body: { studentAnswers: answers, lessonId: String(firstLesson._id) } });
    assert(attempt.status === 201, "quiz attempt is accepted");
    const result = attempt.json.data.attempt;
    assert(result.percentage === 100 && result.passed === true, `score is returned (${result.percentage}%, passed=${result.passed})`);
    assert(attempt.json.data.sections[0].lessons[0].score === 100, "the lesson reports the stored score back in the state");

    const completeRes = await request(`/learning/${course._id}/lesson/${firstLesson._id}/complete`, { method: "POST", token });
    assert(completeRes.status === 200, "first lesson marks complete after passing its quiz");
    const afterComplete = completeRes.json.data;
    assert(afterComplete.enrollment.progress > 0, `progress advanced to ${afterComplete.enrollment.progress}%`);
    assert(afterComplete.sections[0].lessons[1].unlocked === true, "second lesson unlocked after finishing the first");
  } else {
    console.log("\n4) (first lesson has no quiz — skipped quiz score check)");
  }

  // -------- 5. section 2 still locked until section 1 is fully done --------
  console.log("\n5) Section 2 stays locked until section 1 is fully complete");
  const midState = await request(`/learning/${course._id}/state`, { token });
  assert(midState.json.data.sections[1].unlocked === false, "section 2 is still locked mid-way through section 1");

  // -------- cleanup --------
  await Enrollment.deleteOne({ studentId: student._id, courseId: course._id });
  await QuizAttempt.deleteMany({ student: student._id, course: course._id });
  await User.deleteOne({ _id: student._id });

  console.log("\nAll learning-flow assertions passed.");
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error("\nSMOKE TEST FAILED:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
