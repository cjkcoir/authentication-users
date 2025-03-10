const express = require("express"); // Import Express for creating the server.
const usersController = require("./../Controllers/usersController");
const authController = require("./../Controllers/authController");

const router = express.Router(); // Create a router instance

router
  .route("/updatePassword")
  .patch(authController.protect, usersController.updatePassword);

router
  .route("/updateMe")
  .patch(authController.protect, usersController.updateMe);

module.exports = router;
