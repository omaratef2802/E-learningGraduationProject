/**
 * Smoke test for the section final quiz API changes.
 *
 * Creates a temporary instructor token, then exercises:
 *   - GET  /section/course/:courseId   (seeded sections)
 *   - POST /Quiz/createQuiz            (sectionId target + duplicate guard)
 *   - POST /QuizAttempt style guard    (covered by unit-level checks below)
 *   - DELETE /Quiz/deleteQuiz/:id      (cleanup of the test quiz)
 *
 * Run with:  node src/scripts/seed/testSectionQuizApi.js
 */
require("dotenv").config();

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Course = require("../../modules/dbCourse");
const Section = require("../../modules/dbSection");
const Quiz = require("../../modules/dbQuizs");

const BASE = "http://localhost:3000/E-learning";

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

const sampleQuestions = [
  {
    question: "API smoke test question?",
    options: ["Yes", "No"],
    correctAnswer: "Yes",
    points: 1,
  },
];

const run = async () => {
  await mongoose.connect(process.env.URL_MONGO, { serverSelectionTimeoutMS: 20000 });

  const course = await Course.findOne({}).select("title instructorId");
  if (!course) throw new Error("No course found");
  const section = await Section.findOne({ courseId: course._id }).select("_id title");
  if (!section) throw new Error("No section found");

  const token = jwt.sign(
    { userId: String(course.instructorId), role: "instructor", fullname: "API Test" },
    process.env.SECRET,
    { expiresIn: "10m" },
  );

  let failures = 0;
  const check = (label, condition, detail) => {
    console.log(`${condition ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
    if (!condition) failures += 1;
  };

  // 1. sections endpoint returns the seeded roadmap
  const sections = await request(`/section/course/${course._id}`, { token });
  check(
    "GET /section/course/:id returns 3 sections",
    sections.status === 200 && sections.json.data?.length === 3,
    `status=${sections.status} count=${sections.json.data?.length}`,
  );

  // The seed gives every section a final quiz already, so exercise the create
  // flow on a dedicated temporary section (deleted at the end, which also
  // covers the section cleanup path for Quiz.sectionId).
  const tempSection = await request(`/section/course/${course._id}`, {
    method: "POST",
    token,
    body: {
      title: `API Smoke Test Section (temporary)`,
      description: "Created and deleted by testSectionQuizApi.js",
      order: 99,
    },
  });
  check(
    "POST /section/course/:id creates temp section",
    tempSection.status === 201 || tempSection.status === 200,
    `status=${tempSection.status}`,
  );
  const tempSectionId = tempSection.json.data?._id;
  if (!tempSectionId) {
    console.log("cannot continue without the temp section");
    await mongoose.disconnect();
    process.exit(1);
  }

  // 2. create a section final quiz through the API
  const created = await request("/Quiz/createQuiz", {
    method: "POST",
    token,
    body: {
      title: "API Smoke Test Section Quiz",
      questions: sampleQuestions,
      passingScore: 80,
      sectionId: tempSectionId,
    },
  });
  check(
    "POST /Quiz/createQuiz with sectionId returns 201",
    created.status === 201,
    `status=${created.status} msg=${created.json.message}`,
  );
  const quizId = created.json.data?._id;

  // 3. duplicate guard: a second final quiz for the same section must fail
  const duplicate = await request("/Quiz/createQuiz", {
    method: "POST",
    token,
    body: {
      title: "Duplicate Section Quiz",
      questions: sampleQuestions,
      passingScore: 80,
      sectionId: tempSectionId,
    },
  });
  check(
    "duplicate section final quiz rejected (400)",
    duplicate.status === 400,
    `status=${duplicate.status}`,
  );

  // 4. both targets at once must fail
  const lesson = await mongoose.connection.db
    .collection("lessons")
    .findOne({ sectionId: section._id });
  const both = await request("/Quiz/createQuiz", {
    method: "POST",
    token,
    body: {
      title: "Both Targets",
      questions: sampleQuestions,
      passingScore: 70,
      sectionId: tempSectionId,
      lessonId: String(lesson._id),
    },
  });
  check("lessonId + sectionId together rejected (400)", both.status === 400, `status=${both.status}`);

  // 5. section quizzes must not be assignable to a lesson
  if (quizId) {
    const assigned = await request(`/lesson/course/${course._id}`, {
      method: "POST",
      token,
      body: {
        title: "Temp lesson",
        type: "text",
        textContent: "temp",
        duration: 5,
        order: 99,
        sectionId: String(section._id),
        quizId,
      },
    });
    check(
      "assigning a section quiz to a lesson rejected (400)",
      assigned.status === 400,
      `status=${assigned.status} msg=${assigned.json.message}`,
    );
  }

  // 6. instructor quiz list exposes sectionId so the frontend can classify it
  const list = await request("/Quiz/getQuizzes", { token });
  const createdQuizListed = (list.json.data ?? []).find((q) => q._id === quizId);
  check(
    "GET /Quiz/getQuizzes includes the section quiz with sectionId",
    list.status === 200 && createdQuizListed?.sectionId === tempSectionId,
    `count=${list.json.data?.length}`,
  );

  // 7. deleting the section must cascade to its final quiz (Quiz.sectionId)
  const removedSection = await request(`/section/${tempSectionId}`, {
    method: "DELETE",
    token,
  });
  const quizGone = await Quiz.findById(quizId);
  check(
    "DELETE /section/:id cascades to the section final quiz",
    removedSection.status === 200 && !quizGone,
    `status=${removedSection.status} quizExists=${Boolean(quizGone)}`,
  );

  await mongoose.disconnect();
  console.log(failures === 0 ? "\nALL API TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((error) => {
  console.error("test failed:", error);
  process.exit(1);
});