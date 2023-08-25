// models/Post.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom', // Reference to the Classroom model
        required: true,
    },
    files: [
        {
            name: String,
            url: String, 
        },
    ],
    comments: [
        {

            content: String,
            createdAt: Date,
        },
    ],
},
{
    timestamps:true
}
);

module.exports = mongoose.model('Post', postSchema);
