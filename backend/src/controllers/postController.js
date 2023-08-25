const Post = require('../models/Post');
const Classroom = require('../models/Classroom');
const User = require('../models/User');

exports.createPost = async (req, res) => {
    try {
        const { heading, content, files, comments, classroomId, userId } = req.body;

        // Create the new post
        const newPost = new Post({
            heading,
            content,
            files,
            comments,
            author: userId,
            classroom: classroomId,
        });

        await newPost.save();

        // Update references in classroom and user
        const classroom = await Classroom.findById(classroomId);
        const user = await User.findById(userId);

        classroom.posts.push(newPost._id);
        user.posts.push(newPost._id);

        await classroom.save();
        await user.save();

        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
};
