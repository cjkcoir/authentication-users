const { log } = require("console"); // Import console logging
const express = require("express"); // Import Express for creating the server
const authRouter = require("./Routes/authRouter");
const moviesRouter = require("./Routes/moviesRouter");
const usersRouter = require("./Routes/usersRouter");
const morgan = require("morgan"); // Import morgan for HTTP request logging
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express(); // Create Express app

// Middleware to parse JSON request bodies
app.use(bodyParser.json());
//  // Middleware to parse URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173", // Update to match your client's origin
    methods: "GET, POST, PUT, PATCH,DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true, // Allow credentials
  })
);

// Custom middleware for logging
const loggerMiddleware = (req, res, next) => {
  console.log("Custom Middleware Called...");
  next(); // Continue to the next middleware
};

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(morgan("dev")); // Use morgan for HTTP request logging
app.use(loggerMiddleware); // Use the custom logger middleware

// Custom middleware for adding request time
app.use((req, res, next) => {
  console.log("Another custom middleware called");
  req.requestedAt = new Date().toLocaleString("en-IN", {
    // Store request timestamp in IST
    timeZone: "Asia/Kolkata",
  });
  next(); // Continue to the next middleware
});

app.use("/api/v1/auth", authRouter); // Use usersRouter for "/api/v1/auth" path
app.use("/api/v1/movies", moviesRouter); // Use moviesRouter for "/api/v1/movies" path
app.use("/api/v1/users", usersRouter);

module.exports = app;
