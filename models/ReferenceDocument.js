const mongoose = require('mongoose');

const ReferenceDocumentSchema = mongoose.Schema({
    contractRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractRequest',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        required: true
    },
    file: {
        type: String,   // implement changes when finalized
        required: true
    }
    
});

module.exports = mongoose.model('ReferenceDocument', ReferenceDocumentSchema);

