const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    editedAt: {
        type: Date,
        default: null,
    },
    replies: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        editedAt: {
            type: Date,
            default: null,
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }]
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }]
})

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 40,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    comments: [commentSchema]
}, {
    timestamps: true
});


module.exports = mongoose.model('Blog', blogSchema);
