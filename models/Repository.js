const mongoose = require('mongoose');

const RepositorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    requestid: {
        type: mongoose.Schema.Types.ObjectId,
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
});

module.exports = mongoose.model('Repository', RepositorySchema);

