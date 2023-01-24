const mongoose = require('mongoose');

const NegotiationFileSchema = mongoose.Schema({
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

module.exports = mongoose.model('NegotiationFile', NegotiationFileSchema);

