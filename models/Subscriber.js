const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subscriber', subscriberSchema);