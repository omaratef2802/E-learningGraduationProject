const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "the firstname is required"],
      lowercase: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: [true, "the lastname is required"],
      lowercase: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      validate: {
        validator: function (email) {
          return /^[a-zA-Z]{3,8}[0-9]{0,9}(@)(gmail|yahoo|outlook)\.com$/.test(
            email,
          );
        },
        message: (obj) => `${obj.value} is not valid`,
      },
      required: [true, "the email is required"],
      unique: [true, "the email must be unique"],
    },
    dateBirth: {
      type: Date,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    appleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    img: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    phone: {
      type: String,
      default: null,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: [0, "Current streak cannot be negative"],
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: [0, "Longest streak cannot be negative"],
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    bio: {
      type: String,
      min: [5, "the mi of bio is 5"],
      max: [100, "the max of bio is 100"],
    },
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const userModel = mongoose.model("users", UserSchema);
module.exports = userModel;
