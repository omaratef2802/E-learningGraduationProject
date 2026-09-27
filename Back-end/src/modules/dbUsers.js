const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "the firstname is required"], lowercase: true, trim: true, minLength: 3, maxLength: 20 },
    lastName: { type: String, required: [true, "the lastname is required"], lowercase: true, trim: true, minLength: 3, maxLength: 20 },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email) => /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook)\.com$/.test(email),
        message: (obj) => `${obj.value} is not valid`,
      },
      required: [true, "the email is required"],
      unique: [true, "the email must be unique"],
    },
    dateBirth: { type: Date },
    password: {
      type: String,
      required: function () { return this.authProvider === "local"; },
    },
    googleId: { type: String, unique: true, sparse: true },
    verifiedSkills: { type: [mongoose.Schema.Types.Mixed], default: [] },
    role: { type: String, enum: ["student", "instructor"], default: "student" },
    img: { type: String, default: null },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    phone: { type: String, default: null },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    isActive: { type: Boolean, default: true },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastActiveDate: { type: Date, default: null },
    bio: { type: String, min: 5, max: 100 },
    trackId: { type: mongoose.Schema.Types.ObjectId, ref: "tracks", default: null },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

module.exports = mongoose.model("users", UserSchema);
