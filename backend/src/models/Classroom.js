// models/Classroom.js

const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  standard: {
    type: String,
    required: true,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

const Classroom = mongoose.model("Classroom", classroomSchema);

module.exports = Classroom;
