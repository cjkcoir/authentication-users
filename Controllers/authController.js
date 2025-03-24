const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const util = require("util");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const handleNoToken = (req, res, next) => {
  res.status(401).json({
    status: "Fail",
    message: "You are not logged in.",
  });
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
};

// Handler to create a new user
//http://127.0.0.1:5000/api/v1/auth/signup
exports.signUp = async (req, res) => {
  try {
    const {
      name,
      email,
      photo,
      role,
      password,
      confirmpassword,
      passwordChangedAt,
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "Fail",
        message: "Email already in use",
      });
    }

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      photo,
      role,
      password,
      confirmpassword,
      passwordChangedAt,
    });

    // Generate JWT token
    const accessToken = signToken(newUser._id);

    res.status(201).json({
      status: "Success",
      data: { usr: newUser },
      accessToken,
    });
  } catch (err) {
    res.status(400).json({
      status: "Fail",
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(409).json({
        status: "Fail",
        message: "Please provide email & password for logging IN",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    // const isMatch = await user.comparePasswordInDb(password, user.password);

    if (!user || !(await user.comparePasswordInDb(password, user.password))) {
      return res.status(400).json({
        status: "Fail",
        message: "Incorrect Email or Password",
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: "Success",
      Token: token,
      user,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1. Reads the token & check if it exists
    const testToken = req.headers.authorization;
    let token;

    if (testToken && testToken.startsWith("Bearer")) {
      token = testToken.split(" ")[1];
      token = token.replace(/(\r\n|\n|\r)/gm, "").trim();
    }

    if (!token) {
      return handleNoToken(req, res, next);
    }

    console.log(token);

    //2.validate that token that means token exists or not
    const decodedToken = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );
    console.log(decodedToken);

    //3.check If the User exists in the database or not

    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.status(401).json({
        status: "LOGIN_Fail",
        message:
          "User with the given token not found in the database. Please log in again.",
      });
    }

    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);

    // 4.if the user changed the password after the token was issued

    if (isPasswordChanged) {
      return res.status(401).json({
        status: "Fail",
        message: "User recently changed password. Please log in again.",
      });
    }

    //5.Allow the user to access the route.
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "Fail",
        message: "Token has expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "Fail",
        message: "Invalid token. Please log in again.",
      });
    }
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};

exports.restrict = (...role) => {
  return (req, res, next) => {
    try {
      if (!role.includes(req.user.role)) {
        return res.status(403).json({
          status: "Fail",
          message: "You do not have the Permission to do this ACTION.",
        });
      } else {
        next();
      }
    } catch (error) {
      res.status(400).json({
        status: "Fail",
        message: error.message,
      });
    }
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    //1.GET USER BASED ON POSTED EMAIL

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: "Fail",
        message: "We could not find the user with the given Email",
      });
    }

    //2. GENERATE A RANDOM RESET TOKEN
    const resetToken = user.createResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    //3.SEND THE TOKEN BACK TO THE USER EMAIL

    // const resetUrl = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/v1/users/resetPassword/${resetToken}`;

    // const resetUrl = `${req.protocol}://${req.get(
    //   "host"
    // )}/resetPassword/${resetToken}`;

    const resetUrl = `http://localhost:5173/resetPassword/${resetToken}`;

    // const message = `We have receieved the password reset request,Please use the below link to reset your password\n\n${resetUrl}\n\nThis Reset Password LINK will be valid for 10 MINUTES`;

    const message = `
      <p>We have received a password reset request. Please use the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This Reset Password LINK will be valid for 10 MINUTES.</p>
    `;
    try {
      await sendEmail({
        email: user.email,
        subject: "Password change request receieved",
        message: message,
      });

      res.status(200).json({
        status: "SUCCESS",
        message: "PASSWORD RESET LINK SENT TO THE USER'S Email",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      user.save({ validateBeforeSave: false });
      res.status(500).json({
        status: "Fail",
        message: error.message,
        message2:
          "There was an error in sending password reset Email, Please try again Later",
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};

// exports.resetPassword = async (req, res, next) => {
//   try {
//     const token = crypto
//       .createHash("sha256")
//       .update(req.params.token)
//       .digest("hex");

//     console.log("Hashed token:", token);

//     const user = await User.findOne({
//       passwordResetToken: token,
//       passwordResetTokenExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({
//         status: "Reset Password Fail",
//         message: "Token is Invalid or It has Expired",
//       });
//     }
//     user.password = req.body.password;
//     user.confirmpassword = req.body.confirmpassword;
//     user.passwordResetToken = undefined;
//     user.passwordResetTokenExpires = undefined;
//     user.passwordChangedAt = Date.now();
//     await user.save();

//     const loginToken = signToken(user._id);

//     res.status(200).json({
//       status: "Reset password Success",
//       LoginToken: loginToken,
//       user,
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "Fail",
//       message: error.message,
//     });
//   }
// };

exports.resetPassword = async (req, res, next) => {
  try {
    // Hash the token received in the URL
    const token = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Log the hashed token for debugging
    console.log("Hashed token:", token);

    // Find the user based on the hashed token and check if the token has not expired
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    // If no user is found, log the error and return a response
    if (!user) {
      console.log("Token is invalid or has expired");
      return res.status(400).json({
        status: "Reset Password Fail",
        message: "Token is Invalid or It has Expired",
      });
    }

    // Update the user's password and other related fields
    user.password = req.body.password;
    user.confirmpassword = req.body.confirmpassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();

    // Save the updated user to the database
    await user.save();

    // Generate a new JWT token for the user
    const loginToken = signToken(user._id);

    // Return a success response with the new token
    res.status(200).json({
      status: "Reset password Success",
      LoginToken: loginToken,
      user,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error during password reset:", error);
    // Return an error response
    res.status(400).json({
      status: "Fail",
      message:
        error.message || "An error occurred while resetting the password",
    });
  }
};
