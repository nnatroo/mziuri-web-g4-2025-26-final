const express = require('express');
const router = express.Router();

const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        res.redirect('/login');
    }
}

router.get('/', requireAuth, function (req, res, next) {
    const email = req.session.user.email;
    res.render('blogs', {email});
});

router.get('/new', requireAuth, function (req, res, next) {
    const email = req.session.user.email;
    res.render('new_blog', {email, error: null});

})

module.exports = router;
