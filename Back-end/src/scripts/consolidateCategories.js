/**
 * Consolidates the two category collections into `categories` (the one the API
 * reads) and repoints the tracks and courses at the surviving rows.
 *
 * The database ended up with two collections for the same resource:
 *
 *   - `Category`  (capital C) â€” 6 rows with subcategories; the 22 tracks and
 *     26 courses reference these ids
 *   - `categories` (lower)    â€” 4 rows without subcategories; this is what
 *     `mongoose.model("Category", ...)` reads, because Mongoose pluralises the
 *     model name to `categories`
 *
 * That split is why the catalog pages came up empty: the UI navigated with an
 * id from `categories` while the tracks were keyed to `Category`.
 *
 * Steps:
 *   1. Ensure every category slug exists in `categories`, creating the missing
 *      ones together with their subcategories.
 *   2. Reassign each track to its logical category. A previous round-robin
 *      migration scattered them across unrelated buckets, so this restores
 *      them from slug and title instead.
 *   3. Point courses at the consolidated rows.
 *   4. Drop `Category` once nothing references it.
 *
 * Run with:  node src/scripts/consolidateCategories.js
 */
require("dotenv").config();

const mongoose = require("mongoose");

const connect = async () => {
  const uri = process.env.URL_MONGO;
  if (!uri) throw new Error("URL_MONGO is missing from .env");
  await mongoose.connect(uri);
  return mongoose.connection.db;
};

const TARGET_CATEGORIES = require("./seed/categories");

// The four categories the product exposes. Tracks that belong to a removed
// category are folded into the nearest surviving one.
const ALLOWED_SLUGS = ["web-development", "languages", "ui-ux-design", "business"];

const REMOVED_SLUG_FALLBACK = {
  "data-science": "web-development",
  "mobile-development": "web-development",
  "cloud-devops": "web-development",
  "business-marketing": "business",
};

const TRACK_CATEGORY_BY_SLUG = {
  "figma-design-systems": "ui-ux-design",
  "product-design-fundamentals": "ui-ux-design",
  "digital-marketing-strategy": "business",
  "growth-marketing": "business",
  "angular-enterprise-architecture": "business",
  "business-english-for-global-work": "business",
  "python-for-data-science": "web-development",
  "machine-learning-engineering": "web-development",
  "mobile-app-development": "web-development",
  "react-native-apps": "web-development",
  "devops-on-cloud": "web-development",
};

/** Everything not listed above is web work. */
const resolveTrackSlug = (track) => {
  if (TRACK_CATEGORY_BY_SLUG[track.slug]) return TRACK_CATEGORY_BY_SLUG[track.slug];
  return "web-development";
};
const run = async () => {
  const db = await connect();

  const categories = db.collection("categories");
  const capitalCategories = db.collection("Category");

  // 1. ensure every target slug exists in `categories`
  const idsBySlug = new Map();

  for (const target of TARGET_CATEGORIES) {
    const existing = await categories.findOne({ slug: target.slug });

    if (existing) {
      idsBySlug.set(target.slug, existing._id);

      const updates = {};
      if (!existing.description) updates.description = target.description;
      if (!existing.icon) updates.icon = target.icon;
      if (!existing.subcategories || !existing.subcategories.length) {
        updates.subcategories = target.subcategories;
      }
      if (Object.keys(updates).length) {
        await categories.updateOne({ _id: existing._id }, { $set: updates });
      }
      continue;
    }

    const inserted = await categories.insertOne({
      name: target.name,
      slug: target.slug,
      icon: target.icon,
      description: target.description,
      subcategories: target.subcategories,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    idsBySlug.set(target.slug, inserted.insertedId);
  }

  console.log(`categories ready: ${idsBySlug.size}`);

  // 2. reassign tracks to their logical category
  const tracks = db.collection("tracks");
  const trackDocs = await tracks.find({}).toArray();

  let reassigned = 0;
  let unmapped = 0;

  for (const track of trackDocs) {
    const slug = resolveTrackSlug(track);
    const targetId = slug ? idsBySlug.get(slug) : undefined;

    if (!targetId) {
      unmapped += 1;
      console.log(`  unmapped track: ${track.slug}`);
      continue;
    }

    if (String(track.categoryId) === String(targetId)) continue;

    await tracks.updateOne({ _id: track._id }, { $set: { categoryId: targetId } });
    reassigned += 1;
  }

  console.log(`tracks reassigned: ${reassigned}, unmapped: ${unmapped}`);

  // 3. repoint courses that still use a capital-C category id
  const courses = db.collection("courses");
  const capitalDocs = await capitalCategories.find({}).project({ slug: 1 }).toArray();
  // Tracks that still point at a slug we are about to drop have to move first,
  // otherwise reassignment above would silently skip them.
  for (const track of trackDocs) {
    const slug = resolveTrackSlug(track);
    const targetId = slug ? idsBySlug.get(slug) : undefined;
    if (!targetId) continue;
    if (String(track.categoryId) === String(targetId)) continue;
    await tracks.updateOne({ _id: track._id }, { $set: { categoryId: targetId } });
  }

  console.log(`tracks reassigned: ${reassigned}, unmapped: ${unmapped}`);
  const capitalIds = capitalDocs.map((doc) => doc._id);
  const capitalToSlug = new Map();
  for (const doc of capitalDocs) capitalToSlug.set(String(doc._id), doc.slug);

  const courseDocs = await courses.find({ category: { $in: capitalIds } }).toArray();

  let repointed = 0;
  for (const course of courseDocs) {
    const slug = capitalToSlug.get(String(course.category));
    const targetId = slug ? idsBySlug.get(slug) : undefined;
    if (!targetId) continue;
    await courses.updateOne({ _id: course._id }, { $set: { category: targetId } });
    repointed += 1;
  }

  console.log(`courses repointed: ${repointed}`);

  // 4. drop the capital-C rows once nothing references them
  const stillReferenced = await tracks.countDocuments({ categoryId: { $in: capitalIds } });

  if (stillReferenced === 0 && repointed === 0) {
    await capitalCategories.deleteMany({ _id: { $in: capitalIds } });
    console.log(`removed ${capitalIds.length} rows from Category`);
  } else {
    console.log(`kept Category: ${stillReferenced} tracks / ${repointed} courses still reference it`);
  }
  // 5. remove the categories the product does not expose
  const extraSlugs = await categories
    .find({ slug: { $nin: ALLOWED_SLUGS } })
    .project({ slug: 1 })
    .toArray();

  for (const extra of extraSlugs) {
    const fallbackSlug = REMOVED_SLUG_FALLBACK[extra.slug] ?? "web-development";
    const fallbackId = idsBySlug.get(fallbackSlug);
    if (!fallbackId) continue;

    const movedTracks = await tracks.countDocuments({ categoryId: extra._id });
    const movedCourses = await courses.countDocuments({ category: extra._id });

    if (movedTracks) {
      await tracks.updateMany({ categoryId: extra._id }, { $set: { categoryId: fallbackId } });
    }
    if (movedCourses) {
      await courses.updateMany({ category: extra._id }, { $set: { category: fallbackId } });
    }

    await categories.deleteOne({ _id: extra._id });

    console.log(
      `removed category "${extra.slug}" -> moved ${movedTracks} tracks, ${movedCourses} courses to ${fallbackSlug}`,
    );
  }

  // 6. summary

  // 5. summary
  console.log("--- summary ---");
  const finalCategories = await categories.find({}).project({ name: 1, slug: 1 }).toArray();
  for (const category of finalCategories) {
    const trackCount = await tracks.countDocuments({ categoryId: category._id });
    const courseCount = await courses.countDocuments({ category: category._id });
    console.log(`  ${category.name} (${category.slug}) -> ${trackCount} tracks, ${courseCount} courses`);
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Consolidation failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
