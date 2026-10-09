/**
 * One-off data migration for the Atlas database.
 *
 * The seeded documents were written against an older shape of the Mongoose
 * schemas, so they do not match what the API reads today:
 *
 *   - the `Category` collection is empty, which leaves the catalog pages blank
 *   - `tracks` use `name` / `category` (string) instead of `title` /
 *     `categoryId` (ObjectId)
 *   - `courses` have no `status`, and `getAllCourses` only returns
 *     `status: "published"`, so nothing is listed publicly
 *
 * This script normalises the existing rows instead of dropping them, so ids
 * (and any references from carts, orders, reviews) stay valid.
 *
 * Run with:  node src/scripts/migrateData.js
 */
require("dotenv").config();

const mongoose = require("mongoose");

const connect = async () => {
  const uri = process.env.URL_MONGO;
  if (!uri) throw new Error("URL_MONGO is missing from .env");
  await mongoose.connect(uri);
  return mongoose.connection.db;
};

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CATEGORIES = require("./seed/categories");
const TRACKS = require("./seed/tracks");
const LEVELS = ["beginner", "intermediate", "advanced"];
const pick = (list, index) => list[index % list.length];

const run = async () => {
  const db = await connect();

  // ---------------------------------------------------------------- categories
  const categoryCollection = db.collection("Category");
  const categoryIdsBySlug = new Map();

  for (const category of CATEGORIES) {
    const existing = await categoryCollection
      .findOne({ slug: category.slug });

    if (existing) {
      categoryIdsBySlug.set(category.slug, existing._id);
      continue;
    }

    const inserted = await categoryCollection.insertOne({
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    categoryIdsBySlug.set(category.slug, inserted.insertedId);
  }

  console.log(`categories ready: ${categoryIdsBySlug.size}`);

  const categoryIds = [...categoryIdsBySlug.values()];
  const fallbackCategoryId = categoryIds[0];

  // -------------------------------------------------------------------- tracks
  const trackCollection = db.collection("tracks");
  const trackIdsBySlug = new Map();

  for (const track of TRACKS) {
    const existing = await trackCollection.findOne({
      slug: track.slug,
    });

    if (existing) {
      // Older rows store `name` and a plain `category` string.
      const updates = {};

      if (!existing.title && existing.name) updates.title = existing.name;
      if (!existing.categoryId && typeof existing.category === "string") {
        const slug = slugify(existing.category);
        updates.categoryId =
          categoryIdsBySlug.get(slug) ?? fallbackCategoryId;
      }
      if (!existing.title || !existing.categoryId) {
        await trackCollection.updateOne({ _id: existing._id }, { $set: updates });
      }

      trackIdsBySlug.set(track.slug, existing._id);
      continue;
    }

    const inserted = await trackCollection.insertOne({
      title: track.title,
      slug: track.slug,
      description: track.description,
      categoryId:
        categoryIdsBySlug.get(track.category) ?? fallbackCategoryId,
      requiredSkills: track.requiredSkills,
      relatedCourses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

trackIdsBySlug.set(track.slug, inserted.insertedId);
  }

  console.log(`tracks ready: ${trackIdsBySlug.size}`);

  // Older seeded rows use `name` plus a plain `category` string and have no
  // `categoryId`, so the whole collection is normalised regardless of slug.
  const staleTracks = await trackCollection
    .find({
      $or: [{ title: { $exists: false } }, { categoryId: { $exists: false } }],
    })
    .toArray();

  for (const [index, stale] of staleTracks.entries()) {
    const updates = {};

    if (!stale.title && stale.name) updates.title = stale.name;
    if (!stale.categoryId) {
      const slug = slugify(stale.category ?? "");
      updates.categoryId =
        categoryIdsBySlug.get(slug) ?? categoryIds[index % categoryIds.length];
    }
    if (!stale.slug && stale.name) updates.slug = slugify(stale.name);
    if (!stale.requiredSkills) updates.requiredSkills = [];
    if (!stale.description) updates.description = stale.name ?? "";

    await trackCollection.updateOne({ _id: stale._id }, { $set: updates });

    if (stale.slug) trackIdsBySlug.set(stale.slug, stale._id);
  }

  console.log(`stale tracks normalised: ${staleTracks.length}`);

  const trackIds = [...trackIdsBySlug.values()];

  // --------------------------------------------------------- existing courses
  const courseCollection = db.collection("courses");
  const instructor = await db
    .collection("users")
    .find({ role: "instructor" })
    .limit(1)
    .next();

  const courseDocs = await courseCollection.find({}).toArray();

  for (const [index, course] of courseDocs.entries()) {
    const updates = {};

    // Without a status the public listing (which filters on "published")
    // returns nothing.
    if (!course.status) updates.status = "published";
    if (!course.category || typeof course.category === "string") {
      updates.category = categoryIds[index % categoryIds.length];
console.log(`courses normalised: ${courseDocs.length}`);

  // ------------------------------------- sections / lessons / quizzes for empty ones
  const now = new Date();

  let contentCreated = 0;

  for (const course of courseDocs) {
    const sectionCount = await db
      .collection("sections")
      .countDocuments({ courseId: course._id });

    if (sectionCount > 0) continue;

    const sectionId = new mongoose.Types.ObjectId();
    const lessonId = new mongoose.Types.ObjectId();

    await db.collection("sections").insertOne({
      _id: sectionId,
      title: "Getting Started",
      description:
        "An introduction to the course and how to get the most out of it.",
      courseId: course._id,
      order: 1,
      createdAt: now,
      updatedAt: now,
    });

    await db.collection("lessons").insertOne({
      _id: lessonId,
      title: "Welcome and Course Overview",
      duration: 12,
      type: "text",
      textContent:
        "Welcome to the course. In this lesson we cover what you will learn, how the material is organised, and how to get help if you get stuck.",
      videoUrl: null,
      videoPublicId: null,
      courseId: course._id,
      sectionId,
      order: 1,
      quizId: null,
      isPreview: true,
      createdAt: now,
      updatedAt: now,
    });

    if (contentCreated % 2 === 0 && course.instructorId) {
      const quizId = new mongoose.Types.ObjectId();

      await db.collection("quizzes").insertOne({
        _id: quizId,
        title: "Course Foundations Check",
        instructorId: course.instructorId,
        courseId: course._id,
        questions: [
          {
            question: "What will this course help you achieve?",
            options: [
              "A practical, job-ready skill set",
              "Memorising definitions only",
              "Skipping practice",
              "Avoiding projects",
            ],
            correctAnswer: "A practical, job-ready skill set",
            points: 1,
          },
          {
            question: "How should you approach the exercises?",
            options: [
              "Read only",
              "Complete them before moving on",
              "Skip to the last lesson",
              "Do them once a year",
            ],
            correctAnswer: "Complete them before moving on",
            points: 1,
          },
        ],
        passingScore: 50,
        createdAt: now,
        updatedAt: now,
      });

      await db
        .collection("lessons")
        .updateOne({ _id: lessonId }, { $set: { quizId } });
    }

    contentCreated += 1;
  }

  console.log(`courses given starter content: ${contentCreated}`);

  await mongoose.disconnect();
    }
    if (!course.track || typeof course.track === "string") {
      updates.track = trackIds[index % trackIds.length];
    }
    if (!course.instructorId && instructor) updates.instructorId = instructor._id;
    if (!course.level) updates.level = pick(LEVELS, index);
    if (typeof course.duration !== "number" || course.duration <= 0) {
      updates.duration = 10;
    }
    if (typeof course.price !== "number" || course.price < 0) {
      updates.price = 49.99;
    }
    if (typeof course.rating !== "number") updates.rating = 0;
    if (!Array.isArray(course.objectives)) updates.objectives = [];
    if (!Array.isArray(course.prerequisites)) updates.prerequisites = [];

    if (Object.keys(updates).length) {
      await courseCollection.updateOne({ _id: course._id }, { $set: updates });
    }
  }

  console.log(`courses normalised: ${courseDocs.length}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Migration failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
