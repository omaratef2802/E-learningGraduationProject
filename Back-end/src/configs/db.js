const mongoose = require("mongoose");
const Wishlist = require("../modules/Wishlist");
const Enrollment = require("../modules/dbEnrollement");

const removeObsoleteWishlistIndex = async () => {
  const collection = Wishlist.collection;
  let indexes;
  try {
    indexes = await collection.indexes();
  } catch (error) {
    // A fresh database may not have created the wishlists collection yet.
    if (error.code === 26 || error.codeName === "NamespaceNotFound") return;
    throw error;
  }

  const staleStudentIndex = indexes.find((index) =>
    index.unique === true &&
    Object.keys(index.key || {}).length === 1 &&
    index.key.student === 1 &&
    !Wishlist.schema.indexes().some(([keys, options]) => options.unique && keys.student === 1),
  );

  if (staleStudentIndex) {
    await collection.dropIndex(staleStudentIndex.name);
    console.log(`Removed obsolete wishlist index: ${staleStudentIndex.name}`);
  }
};

const removeObsoleteEnrollmentIndex = async () => {
  const collection = Enrollment.collection;
  let indexes;
  try {
    indexes = await collection.indexes();
  } catch (error) {
    // A fresh database may not have created the enrollments collection yet.
    if (error.code === 26 || error.codeName === "NamespaceNotFound") return;
    throw error;
  }

  // Older versions indexed `student` and `course`. Current enrollment
  // documents use `studentId` and `courseId`, so that legacy unique index
  // sees every current record as (null, null) and rejects later enrollments.
  const staleIndex = indexes.find((index) =>
    index.unique === true &&
    Object.keys(index.key || {}).length === 2 &&
    index.key.student === 1 &&
    index.key.course === 1 &&
    !Enrollment.schema.indexes().some(([keys, options]) =>
      options.unique && keys.student === 1 && keys.course === 1,
    ),
  );

  if (staleIndex) {
    await collection.dropIndex(staleIndex.name);
    console.log(`Removed obsolete enrollment index: ${staleIndex.name}`);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URL_MONGO);
    await removeObsoleteWishlistIndex();
    await removeObsoleteEnrollmentIndex();
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
