const express = require('express');
const path = require('path');
const multer = require('multer');
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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'images', 'thumbnails'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `thumbnail-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

const uploadThumbnail = (req, res, next) => {
    upload.single('thumbnail')(req, res, (err) => {
        if (err) {
            const email = req.session.user.email;
            return res.render('new_blog', {email, error: 'Thumbnail upload failed. Please choose an image file under 5MB.'});
        }
        next();
    });
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

router.post('/new', requireAuth, uploadThumbnail, async function (req, res, next) {
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

    if (!req.file) {
        return res.render('new_blog', {email, error: "Please upload a thumbnail image"});
    }

    const author = await User.findOne({email: email});
    const authorId = author._id.toString()
    const newBlogObj = {
        title,
        description,
        content,
        thumbnail: `/images/thumbnails/${req.file.filename}`,
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

router.post('/:blogId/comments/:commentId/edit', requireAuth, async function (req, res, next) {
    const email = req.session.user.email;
    const {blogId, commentId} = req.params;
    const {content} = req.body;

    if (!content || !content.trim()) {
        return res.redirect(`/blogs/${blogId}`);
    }

    try {
        const user = await User.findOne({email});
        const blog = await Blog.findById(blogId);
        const comment = blog && blog.comments.id(commentId);

        if (!comment) {
            return res.redirect(`/blogs/${blogId}`);
        }

        if (!comment.author.equals(user._id)) {
            return res.redirect(`/blogs/${blogId}`);
        }

        comment.content = content.trim();
        comment.editedAt = new Date();
        await blog.save();
        res.redirect(`/blogs/${blogId}`);
    } catch (e) {
        console.log(e);
        next(e);
    }
});

router.post('/:blogId/comments/:commentId/replies/:replyId/edit', requireAuth, async function (req, res, next) {
    const email = req.session.user.email;
    const {blogId, commentId, replyId} = req.params;
    const {content} = req.body;

    if (!content || !content.trim()) {
        return res.redirect(`/blogs/${blogId}`);
    }

    try {
        const user = await User.findOne({email});
        const blog = await Blog.findById(blogId);
        const comment = blog && blog.comments.id(commentId);
        const reply = comment && comment.replies.id(replyId);

        if (!reply) {
            return res.redirect(`/blogs/${blogId}`);
        }

        if (!reply.author.equals(user._id)) {
            return res.redirect(`/blogs/${blogId}`);
        }

        reply.content = content.trim();
        reply.editedAt = new Date();
        await blog.save();
        res.redirect(`/blogs/${blogId}`);
    } catch (e) {
        console.log(e);
        next(e);
    }
});

router.post('/:blogId/comments/:commentId/delete', requireAuth, async function (req, res, next) {
    const email = req.session.user.email;
    const {blogId, commentId} = req.params;

    try {
        const user = await User.findOne({email});
        const blog = await Blog.findById(blogId);
        const comment = blog && blog.comments.id(commentId);

        if (!comment) {
            return res.redirect(`/blogs/${blogId}`);
        }

        const isCommentOwner = comment.author.equals(user._id);
        const isBlogAuthor = blog.author.equals(user._id);

        if (!isCommentOwner && !isBlogAuthor) {
            return res.redirect(`/blogs/${blogId}`);
        }

        blog.comments.pull(commentId);
        await blog.save();
        res.redirect(`/blogs/${blogId}`);
    } catch (e) {
        console.log(e);
        next(e);
    }
});

router.post('/:blogId/comments/:commentId/replies/:replyId/delete', requireAuth, async function (req, res, next) {
    const email = req.session.user.email;
    const {blogId, commentId, replyId} = req.params;

    try {
        const user = await User.findOne({email});
        const blog = await Blog.findById(blogId);
        const comment = blog && blog.comments.id(commentId);
        const reply = comment && comment.replies.id(replyId);

        if (!reply) {
            return res.redirect(`/blogs/${blogId}`);
        }

        const isReplyOwner = reply.author.equals(user._id);
        const isBlogAuthor = blog.author.equals(user._id);

        if (!isReplyOwner && !isBlogAuthor) {
            return res.redirect(`/blogs/${blogId}`);
        }

        comment.replies.pull(replyId);
        await blog.save();
        res.redirect(`/blogs/${blogId}`);
    } catch (e) {
        console.log(e);
        next(e);
    }
});

module.exports = router;
