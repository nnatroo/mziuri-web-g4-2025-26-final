const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

router.post('/subscribe', async function (req, res, next) {
    const {subscribeEmail, returnUrl} = req.body;
    const subscriber = new Subscriber({email: subscribeEmail})
    await subscriber.save();
    res.redirect(returnUrl);
});

module.exports = router;