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

router.patch("/resetPassword/:token", authController.resetPassword);

router.delete("/deleteMe", authController.protect, usersController.deleteMe);

module.exports = router;
