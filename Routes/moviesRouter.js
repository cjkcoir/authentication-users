const express = require("express"); // Import Express for creating the server.
const moviesController = require("../Controllers/moviesController");
const authController = require("../Controllers/authController");

const router = express.Router(); // Create a router instance

// router.param("id", (req, res, next, value) => {
//   console.log(`Value of ID =${value}`);
//   next();
// });

// /router.param("id", moviesControllermongo.checkID); // Middleware to run checkID when 'id' parameter is present in route

// Define route for sorting movies.
//   router
//   .route('/sort')
//   .get(moviesControllermongo.sortMovies);

// Define GET and POST routes for all movies.
router
  .route("/")
  .get(authController.protect, moviesController.getAllMovies)
  // .get(moviesController.getAllMovies)
  .post(authController.protect, moviesController.createMovie);
// .post(moviesController.createMovie);

// Define GET, PATCH, DELETE routes for a specific movie.
router
  .route("/:id")
  .get(moviesController.getMovieById)
  .patch(moviesController.updateMovie)
  .delete(
    authController.protect,
    authController.restrict("admin", "tester"),
    moviesController.deleteMovie
  );

module.exports = router;
