const app = require("./app"); // Importing the Express application from the specified file
const mongoose = require("mongoose");
const dotenv = require("dotenv"); // Importing the 'dotenv' module to handle environment variables
const cors = require("cors");

dotenv.config({ path: "./config.env" }); // Loading environment variables from the 'config.env' file
app.use(cors());

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(process.env.CONN_STR, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected successfully");
    console.log(conn.connections);
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

const PORT = process.env.PORT || 3000; // Defining the server port (use the environment variable PORT or default to 3000)

app.listen(PORT, "127.0.0.1", () => {
  console.log("Server is running..... on PORT: ", PORT); // Logging a message to indicate the server is running
});

// Catching unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection", err);
  process.exit(1);
});
