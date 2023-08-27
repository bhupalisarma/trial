const Post = require("../models/Post");
const Classroom = require("../models/Classroom");
const User = require("../models/User");

const createPost = async (req, res) => {
  try {
    const { heading, content, attachmentUrl } = req.body;
    const userId = req.user._id;
    const classroomId = req.params.classroomId;

    // Update references in classroom and user
    const classroom = await Classroom.findById(classroomId);
    const user = await User.findById(userId);

    if (!classroom || !user) {
      return res.status(400).json({
        success: false,
        message: "Classroom or user Not found",
      });
    }

    const newPost = await Post.create({
      heading,
      content,
      attachmentUrl,
      author: userId,
      classroom: classroomId,
    });

    classroom.posts.push(newPost._id);
    user.posts.push(newPost._id);

    await classroom.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });

    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: String(error) });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const { classroomId } = req.body;
    const posts = await Post.find({ classroom: classroomId })
      .populate("author", "name")
      .populate("comments", "content")
      .exec();
    res.status(200).json({
      message: "Successfully fetched all the posts of this classroom.",
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: String(error) });
  }
};

module.exports = {
  createPost,
  getAllPosts,
};
