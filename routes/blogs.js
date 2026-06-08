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
    } catch (e){
        console.log(e)
    }

})

module.exports = router;
