const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/authUtils');
const { createPost } = require('../controllers/postController')
const { getAllPosts } = require('../controllers/postController')


router.post('/:classroomId/posts', verifyToken, createPost);

router.get('/:classroomId/posts', getAllPosts)

module.exports = router;
