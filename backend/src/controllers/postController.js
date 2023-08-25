const Post = require("../models/Post");
const Classroom = require("../models/Classroom");
const User = require("../models/User");

exports.createPost = async (req, res) => {
  try {
    const { heading, content, userId } = req.body;
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
    // Create the new post
    // const newPost = new Post({
    //     heading,
    //     content,
    //     files,
    //     comments,
    //     author: userId,
    //     classroom: classroomId,
    // });

    // await newPost.save();

    const newPost = await Post.create({
      heading,
      content,
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
