// Load environment variables from .env file
require('dotenv').config();

const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

// Use environment variables for sensitive information
const MONGODB_URI = process.env.MONGODB_URI;

// Use async/await for cleaner code structure
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to the MongoDB database");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

connectToDatabase();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  profileimage: { type: String },
  fullname: { type: String, required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);
