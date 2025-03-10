const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { type } = require("os");

const userSchema = new mongoose.Schema({
  //name,email,password,confirmPassword,photo

  name: {
    type: String,
    required: [true, "Please Enter your Name "],
  },

  email: {
    type: String,
    required: [true, "Please Enter the Email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please Enter the valid Email"],
  },

  photo: {
    type: String,
  },

  role: {
    type: String,
    enum: ["user", "admin", "tester", "supplier"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "Please Enter the Password"],
    minlength: 8,
    select: false,
  },
  confirmpassword: {
    type: String,
    required: [true, "Please Enter the confirmPassword"],
    validate: {
      validator: function (val) {
        return val == this.password;
      },

      message: "Password && confirmPassward does not match",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetTokenExpires: {
    type: Date,
  },
});

// Pre-save middleware to hash the password before saving
userSchema.pre("save", async function (next) {
  // Only run this function if password was modified
  if (!this.isModified("password")) return next(); // Hash the password
  this.password = await bcrypt.hash(this.password, 10); // Delete the confirmpassword field
  this.confirmpassword = undefined;
  next();
});

userSchema.methods.comparePasswordInDb = async function (password, passwordDB) {
  return await bcrypt.compare(password, passwordDB);
};

// Add a method to check if the password was changed after the token was issued
// Add a method to check if the password was changed after the token was issued
userSchema.methods.isPasswordChanged = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordchangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log(passwordchangedTimestamp, JWTTimestamp);

    // Return true if the password was changed after the token was issued
    return JWTTimestamp < passwordchangedTimestamp;
  }
  // Return false if the password was not changed or there's no record of password change
  return false;
};

// Define a method on the user schema to create a reset password token
userSchema.methods.createResetPasswordToken = function () {
  // Generate a random 32-byte token and convert it to a hexadecimal string
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the reset token using SHA-256 and set it as the password reset token for the user
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set the expiration time for the reset token to be 10 minutes from now
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  console.log("Reset Token = ", resetToken);
  console.log("encrypted Reset Token = ", this.passwordResetToken);

  // Return the original reset token (not the hashed version)
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
