/**
 * Seeds the curriculum roadmap for every course in the database.
 *
 * For each course it creates:
 *   - 3 sections (roadmap steps)
 *   - 3-4 lessons per section (video/text mix)
 *   - one quiz per lesson (linked through Lesson.quizId)
 *   - one section final quiz (linked through Quiz.sectionId)
 *
 * Before seeding it wipes the previous curriculum data: the old rows are
 * either orphaned (their courses were deleted) or leftover test data, and
 * re-running the script must stay idempotent, so a full wipe of sections,
 * lessons, quizzes and quiz attempts is the only safe starting point.
 * Enrollment lesson references are cleared because the lessons they point to
 * are recreated with new ids.
 *
 * Run with:  node src/scripts/seed/curriculum.js
 */
require("dotenv").config();

const mongoose = require("mongoose");

const Course = require("../../modules/dbCourse");
const Section = require("../../modules/dbSection");
const Lesson = require("../../modules/dbLesson");
const Quiz = require("../../modules/dbQuizs");
const QuizAttempt = require("../../modules/dbQuizAttempt");
const Enrollment = require("../../modules/dbEnrollement");

const {
  SECTION_BLUEPRINTS,
  pickVideo,
  lessonText,
  lessonQuizQuestions,
  sectionQuizQuestions,
} = require("./curriculumContent");

const LESSON_QUIZ_PASSING_SCORE = 70;
const SECTION_QUIZ_PASSING_SCORE = 80;

const wipeExistingCurriculum = async () => {
  const [sections, lessons, quizzes, attempts] = await Promise.all([
    Section.deleteMany({}),
    Lesson.deleteMany({}),
    Quiz.deleteMany({}),
    QuizAttempt.deleteMany({}),
  ]);

  // Lessons get brand-new ids, so drop the stale references instead of
  // leaving dangling ObjectIds in enrollment progress.
  const enrollments = await Enrollment.updateMany(
    {},
    { $set: { completedLessons: [], lastLesson: null } },
  );

  console.log(
    `wiped: ${sections.deletedCount} sections, ${lessons.deletedCount} lessons, ` +
      `${quizzes.deletedCount} quizzes, ${attempts.deletedCount} quiz attempts, ` +
      `${enrollments.modifiedCount} enrollments reset`,
  );
};

const seedCourse = async (course, stats) => {
  const title = course.title;

  // ------------------------------------------------------------ sections
  const sections = await Section.insertMany(
    SECTION_BLUEPRINTS.map((blueprint, index) => ({
      title: `${title}: ${blueprint.suffix}`,
      description: blueprint.description(title),
      courseId: course._id,
      order: index + 1,
    })),
  );

  // ------------------------------------------------- lesson quizzes + lessons
  const lessonQuizDocs = [];
  const lessonDocs = [];

  sections.forEach((section, sectionIndex) => {
    const blueprint = SECTION_BLUEPRINTS[sectionIndex];

    blueprint.lessons.forEach((lessonPlan, lessonIndex) => {
      lessonQuizDocs.push({
        title: `${lessonPlan.title} Quiz`,
        instructorId: course.instructorId,
        courseId: course._id,
        questions: lessonQuizQuestions(title, lessonPlan.title),
        passingScore: LESSON_QUIZ_PASSING_SCORE,
      });

      lessonDocs.push({
        title: lessonPlan.title,
        duration: lessonPlan.duration,
        type: lessonPlan.type,
        videoUrl: lessonPlan.type === "video" ? pickVideo(stats.lessonCounter) : null,
        videoPublicId: null,
        textContent:
          lessonPlan.type === "text" ? lessonText(title, lessonPlan.title) : null,
        courseId: course._id,
        sectionId: section._id,
        order: lessonIndex + 1,
        // Placeholder filled in after the quizzes are inserted.
        quizId: null,
        isPreview: sectionIndex === 0 && lessonIndex === 0,
      });

      stats.lessonCounter += 1;
    });
  });

  const lessonQuizzes = await Quiz.insertMany(lessonQuizDocs);
  lessonDocs.forEach((lesson, index) => {
    lesson.quizId = lessonQuizzes[index]._id;
  });
  const lessons = await Lesson.insertMany(lessonDocs);

  // -------------------------------------------------- section final quizzes
  const sectionQuizzes = await Quiz.insertMany(
    sections.map((section, index) => ({
      title: `${SECTION_BLUEPRINTS[index].suffix} — Final Quiz`,
      instructorId: course.instructorId,
      courseId: course._id,
      sectionId: section._id,
      questions: sectionQuizQuestions(title),
      passingScore: SECTION_QUIZ_PASSING_SCORE,
    })),
  );

  stats.sections += sections.length;
  stats.lessons += lessons.length;
  stats.quizzes += lessonQuizzes.length + sectionQuizzes.length;
};

const run = async () => {
  await mongoose.connect(process.env.URL_MONGO, { serverSelectionTimeoutMS: 20000 });
  console.log("connected");

  await wipeExistingCurriculum();

  const courses = await Course.find({}).select("title instructorId").sort({ createdAt: 1 });
  console.log(`seeding ${courses.length} courses...`);

  const stats = { sections: 0, lessons: 0, quizzes: 0, lessonCounter: 0 };
  for (const course of courses) {
    await seedCourse(course, stats);
    console.log(`  ✓ ${course.title}`);
  }

  console.log(
    `done: ${courses.length} courses, ${stats.sections} sections, ` +
      `${stats.lessons} lessons, ${stats.quizzes} quizzes ` +
      `(${stats.quizzes - stats.sections} lesson quizzes + ${stats.sections} section final quizzes)`,
  );

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("seed failed:", error);
  process.exit(1);
});