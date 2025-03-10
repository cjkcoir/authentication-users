const express = require("express"); // Import Express for creating the server.
const authController = require("../Controllers/authController");

const router = express.Router(); // Create a router instance

router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

module.exports = router;
