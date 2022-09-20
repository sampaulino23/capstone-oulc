const mongoose = require('mongoose');

const RepositoryFileSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    requestid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ContractRequest'
    },
    file: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    uploadDate: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('RepositoryFile', RepositoryFileSchema);

