const mongoose = require('mongoose');

const TemplateSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractType',
        required: true
    },
    uploadDate: {
        type: Date,
        required: true
    },
    file: {
        type: mongoose.Schema.Types.ObjectId,   // implement changes when finalized
    }
    
});

module.exports = mongoose.model('Template', TemplateSchema);

