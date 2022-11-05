const mongoose = require('mongoose');

const ReferenceDocumentSchema = mongoose.Schema({
    contractRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractRequest',
        required: true
    },
    uploadDate: {
        type: Date,
        required: true
    },
    file: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    filename: {
        type: String,
    },
    isreviewed: {
        type: Boolean,
        required: true,
    }
    
});

module.exports = mongoose.model('ReferenceDocument', ReferenceDocumentSchema);

