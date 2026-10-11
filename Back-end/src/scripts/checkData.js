/**
 * Verifies that the API can read the collections it depends on.
 *
 * Run with:  node src/scripts/checkData.js
 */
require("dotenv").config();

const mongoose = require("mongoose");

const run = async () => {
  await mongoose.connect(process.env.URL_MONGO);
  const db = mongoose.connection.db;

  const count = async (collection, filter = {}) =>
    db.collection(collection).countDocuments(filter);

  const trackWithTitle = await count("tracks", { title: { $exists: true } });
  const trackWithCategory = await count("tracks", { categoryId: { $exists: true } });

  console.log("categories:", await count("Category"));
  console.log("tracks:", await count("tracks"));
  console.log("  with title:", trackWithTitle);
  console.log("  with categoryId:", trackWithCategory);
  console.log("courses:", await count("courses"));
  console.log("  published:", await count("courses", { status: "published" }));
  console.log("  with category ObjectId:", await count("courses", { category: { $type: "objectId" } }));
  console.log("  with track ObjectId:", await count("courses", { track: { $type: "objectId" } }));
  console.log("sections:", await count("sections"));
  console.log("lessons:", await count("lessons"));
  console.log("quizzes:", await count("quizzes"));

  const sample = await db
    .collection("courses")
    .find({ status: "published" })
    .limit(1)
    .toArray();

  if (sample.length) {
    const course = sample[0];
    console.log("--- sample published course ---");
    console.log("title:", course.title);
    console.log("status:", course.status);
    console.log("category:", String(course.category));
    console.log("track:", String(course.track));
    console.log("level:", course.level, "| duration:", course.duration, "| price:", course.price);
  }

  // Tracks still missing required fields, listed so they can be fixed by hand.
  const brokenTracks = await db
    .collection("tracks")
    .find({ $or: [{ title: { $exists: false } }, { categoryId: { $exists: false } }] })
    .project({ name: 1, title: 1, slug: 1, category: 1, categoryId: 1 })
    .toArray();

  if (brokenTracks.length) {
    console.log("--- tracks still missing title/categoryId ---");
    for (const track of brokenTracks) {
      console.log(
        String(track._id),
        "| name:", track.name,
        "| title:", track.title,
        "| slug:", track.slug,
        "| category:", track.category,
      );
    }
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Check failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});