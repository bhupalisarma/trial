const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: '*',
}));

app.use(express.json());

// Routes
const authRoutes = require('../src/routes/authRoutes');
const userRoutes = require('../src/routes/userRoutes');
const classroomRoutes = require('../src/routes/classroomRoutes');
const postRoutes = require('../src/routes/postRoutes')

app.use('/api/auth', authRoutes);
app.use('/api/users',  userRoutes);
app.use('/api/classrooms',  classroomRoutes);
// app.use('/api/classrooms',postRoutes)


// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the server after successful database connection
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
