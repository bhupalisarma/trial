const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/authUtils');
const { getAllClassrooms, createClassroom, getClassroomById } = require('../controllers/classroomController');
const { createPost } = require('../controllers/postController')

// Get all classrooms
router.get('/', verifyToken, getAllClassrooms);

// Create a classroom (requires authentication)
router.post('/', verifyToken, createClassroom);

// Get classroom by ID
router.get('/:classroomId',  getClassroomById);

// Get classroom by ID
router.get('/:classroomId/posts', getClassroomById);

router.post('/:classroomId/posts', verifyToken, createPost);

module.exports = router;


