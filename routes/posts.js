const mongoose = require("mongoose");

// Define the Post schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  desciption: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  Likes: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("Post", postSchema);
