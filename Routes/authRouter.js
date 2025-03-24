const express = require("express"); // Import Express for creating the server.
const authController = require("../Controllers/authController");

const router = express.Router(); // Create a router instance

router.route("/signup").post(authController.signUp);

// POST   http://127.0.0.1:5000/api/v1/auth/login
// {
//     "email":"akilan@gmail.com",
//      "password":"test1234"

// }
router.route("/login").post(authController.login);

router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

module.exports = router;
