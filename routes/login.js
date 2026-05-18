var express = require('express');
var router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.get('/', function (req, res, next) {
    res.render('login', {message: ''});
});

router.post('/', async function (req, res, next) {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email: email});

        if (!user) {
            res.render('login', {message: 'Invalid email or password!'});
        }
        if (!bcrypt.compare(password, user.password)) {
            res.render('login', {message: 'Invalid email or password!'});
        }

        req.session.user = {email};

        res.redirect('/blogs');
    } catch (err) {
        console.log(err);
    }

    res.send('running');
});

module.exports = router;