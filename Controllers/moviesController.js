const express = require("express"); // Import Express for creating the server.
const Movie = require("../Models/moviesModel");
const router = express.Router(); // Create a router for movies routes.

exports.validateBody = (req, res, next) => {
  if (!req.body.name || !req.body.releaseYear) {
    res.status(400).json({
      status: "Failure",
      Message: "Not valide request Body",
    });
  }
  next();
};

// / Handler to get all movies.
exports.getAllMovies = async (req, res) => {
  try {
    let movies = await Movie.find();
    res.status(201).json({
      status: "Success",
      noOfMovies: movies.length,
      data: { movie: movies },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: err.message,
    });
  }
};

// Handler to get a movie by ID.
exports.getMovieById = async (req, res, next) => {
  // Make it an async function
  try {
    const movie = await Movie.findById(req.params.id); // Await the asynchronous call
    if (!movie) {
      return res.status(404).json({
        status: "Fail",
        message: "Movie not found",
      });
    }
    res.status(200).json({
      status: "Success",
      data: { movie },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};

// Handler to create a new movie.
exports.createMovie = async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);
    res.status(201).json({
      status: "Success",
      data: { movie: newMovie },
    });
  } catch (err) {
    res.status(400).json({
      status: "Fail",
      message: err.message,
    });
  }
};

// Handler to update a movie by ID.
exports.updateMovie = (req, res) => {};

// Handler to delete a movie by ID.
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        status: "Fail",
        message: "No movie found with that ID",
      });
    }

    res.status(204).json({
      status: "Success",
      deletedMovie: movie,
    });
  } catch (err) {
    res.status(400).json({
      status: "Fail",
      message: err.message,
    });
  }
};
