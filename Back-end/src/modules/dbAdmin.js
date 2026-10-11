const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchama = mongoose.Schema(
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
      maxLength: 40,
    },
    email: {
      type: String,
      validate: {
        validator: function (email) {
          return /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook)\.com$/.test(email);
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
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
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
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

adminSchama.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const adminModule = mongoose.model("admins", adminSchama);

module.exports = adminModule;
