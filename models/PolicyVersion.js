const mongoose = require('mongoose');

const PolicyVersionSchema = mongoose.Schema({
    policy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policy',
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    file: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    uploadDate: {
        type: Date,
        required: true
    },
    uploadBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    versionNote: {
        type: String,
    }
});

module.exports = mongoose.model('PolicyVersion', PolicyVersionSchema);
