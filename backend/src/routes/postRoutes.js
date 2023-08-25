const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/authUtils');
const { createPost } = require('../controllers/postController')


router.post('/:classroomId/posts', verifyToken, createPost);

module.exports = router;
