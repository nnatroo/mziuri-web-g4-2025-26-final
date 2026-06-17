const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Blog = require('../models/Blog');

const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        res.redirect('/login');
    }
}

router.get('/', requireAuth, async function (req, res, next) {
    const email = req.session.user.email;

    const blogs = await Blog.find().sort({date: -1}).populate("author", 'email')

    res.render('blogs', {email, blogs});
});

router.get('/new', requireAuth, function (req, res, next) {
    const email = req.session.user.email;
    res.render('new_blog', {email, error: null});

})

router.post('/new', requireAuth, async function (req, res, next) {
    const {title, description, content} = req.body;
    const email = req.session.user.email;

    if (!title || !description || !content) {
        res.render('new_blog', {email, error: "Missing title, description or content"});
    }

    if (title.length >= 40) {
        return res.render('new_blog', {email, error: "Title length must be less than 40 characters"});
    }

    if (description.length >= 500) {
        return res.render('new_blog', {email, error: "Description length must be less than 500 characters"});
    }

    if (content.length >= 1000) {
        return res.render('new_blog', {email, error: "Content length must be less than 1000 characters"});
    }

    const author = await User.findOne({email: email});
    const authorId = author._id.toString()
    const newBlogObj = {
        title,
        description,
        content,
        author: authorId,
    }
    try {
        const newBlog = await Blog(newBlogObj);
        await newBlog.save();
        res.redirect('/blogs');
    } catch (e) {
        console.log(e)
    }

})

router.get('/:blogId', requireAuth, async function (req, res, next) {
    const email = req.session.user.email;
    const blogId = req.params.blogId;
    const blog = await Blog.findById(blogId)
        .populate("author", 'email')
        .populate("comments.author", 'email')
        .populate("comments.replies.author", 'email')
    const recentBlogs = await Blog.find().sort({date: -1}).populate("author", 'email').limit(8)

    const currentUser = await User.findOne({email});
    const currentUserId = currentUser ? currentUser._id.toString() : null;

    res.render('blog', {email, recentBlogs, blog, currentUserId});
});

router.post('/:blogId/comments', requireAuth, async function (req, res, next) {
    const email = req.session.user.email;
    const blogId = req.params.blogId;
    const {content} = req.body;

    if (!content || !content.trim()) {
        return res.redirect(`/blogs/${blogId}`);
    }

    try {
        const user = await User.findOne({email});
        const blog = await Blog.findById(blogId);
        blog.comments.push({author: user._id, content: content.trim()});
        await blog.save();
        res.redirect(`/blogs/${blogId}`);
    } catch (e) {
        console.log(e);
        next(e);
    }
});

router.post('/:blogId/comments/:commentId/replies', requireAuth, async function (req, res, next) {
    const email = req.session.user.email;
    const {blogId, commentId} = req.params;
    const {content} = req.body;

    if (!content || !content.trim()) {
        return res.redirect(`/blogs/${blogId}`);
    }

    try {
        const user = await User.findOne({email});
        const blog = await Blog.findById(blogId);
        const comment = blog.comments.id(commentId);

        if (!comment) {
            return res.redirect(`/blogs/${blogId}`);
        }

        comment.replies.push({author: user._id, content: content.trim()});
        await blog.save();
        res.redirect(`/blogs/${blogId}`);
    } catch (e) {
        console.log(e);
        next(e);
    }
});

router.post('/:blogId/comments/:commentId/like', requireAuth, async function (req, res, next) {
    const email = req.session.user.email;
    const {blogId, commentId} = req.params;

    try {
        const user = await User.findOne({email});
        const blog = await Blog.findById(blogId);
        const comment = blog.comments.id(commentId);

        if (!comment) {
            return res.redirect(`/blogs/${blogId}`);
        }

        const likeIndex = comment.likes.findIndex((id) => id.equals(user._id));
        if (likeIndex === -1) {
            comment.likes.push(user._id);
        } else {
            comment.likes.splice(likeIndex, 1);
        }

        await blog.save();
        res.redirect(`/blogs/${blogId}`);
    } catch (e) {
        console.log(e);
        next(e);
    }
});

router.post('/:blogId/comments/:commentId/replies/:replyId/like', requireAuth, async function (req, res, next) {
    const email = req.session.user.email;
    const {blogId, commentId, replyId} = req.params;

    try {
        const user = await User.findOne({email});
        const blog = await Blog.findById(blogId);
        const comment = blog.comments.id(commentId);
        const reply = comment && comment.replies.id(replyId);

        if (!reply) {
            return res.redirect(`/blogs/${blogId}`);
        }

        const likeIndex = reply.likes.findIndex((id) => id.equals(user._id));
        if (likeIndex === -1) {
            reply.likes.push(user._id);
        } else {
            reply.likes.splice(likeIndex, 1);
        }

        await blog.save();
        res.redirect(`/blogs/${blogId}`);
    } catch (e) {
        console.log(e);
        next(e);
    }
});

module.exports = router;
