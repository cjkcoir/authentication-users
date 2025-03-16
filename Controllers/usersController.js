const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
// const util = require("util");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const authController = require("./authController");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
};

const filterReqObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((prop) => {
    if (allowedFields.includes(prop)) newObj[prop] = obj[prop];
  });

  return newObj;
};

exports.updatePassword = async (req, res, next) => {
  try {
    //1. get current user from database

    const user = await User.findById(req.user._id).select("+password");

    //2.check if the suppliied password is correct

    if (
      !(await user.comparePasswordInDb(req.body.currentPassword, user.password))
    ) {
      // Add your code to handle the case where the current password does not match

      return res.status(401).json({
        status: "Update Password Fail",
        message: "The Current Password you provided is WRONG",
      });
    }

    //3.if supplied password is correctt,update user password with new value

    (user.password = req.body.password),
      (user.confirmpassword = req.body.confirmpassword);
    await user.save();

    const loginToken = signToken(user._id);

    res.status(200).json({
      status: "Update password Success",
      LoginToken: loginToken,
      user,
    });

    //4.login user and send JWT
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};

// exports.updateMe = async (req, res, next) => {
//   if (req.body.password || req.body.confirmpassword) {
//     return res.status(400).json({
//       status: " Fail",
//       message: "You can't update your password using this endpoint",
//     });
//   }

//   //UPDATE THE USER

//   const user = await User.findByIdAndUpdate(req.user.id, req.body, {
//     runValidators: true,
//     new: true,
//   });
//   await user.save();
// };
exports.updateMe = async (req, res, next) => {
  try {
    // Prevent password updates via this endpoint
    if (req.body.password || req.body.confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "You can't update your password using this endpoint",
      });
    }

    // Update the user
    const filterObj = filterReqObj(req.body, "name", "email");
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
      runValidators: true,
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating the user",
      error: err.message,
    });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user is populated with the authenticated user's info

    await User.findByIdAndDelete(userId);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
