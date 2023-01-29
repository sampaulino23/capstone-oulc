const mongoose = require('mongoose');

const PolicySchema = mongoose.Schema({
    latestVersion: {
        type: Number,
    }
});

module.exports = mongoose.model('Policy', PolicySchema);

