const mongoose = require('mongoose');

const PolicySchema = mongoose.Schema({
    latestVersion: {
        type: Number,
        default: 1,
        required: true
    }
});

module.exports = mongoose.model('Policy', PolicySchema);

