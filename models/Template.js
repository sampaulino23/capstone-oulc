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
    isWordFile: {
        type: Boolean,
        required: true
    },
    wordFileName: {
        type: String,
    },
    pdfFileName: {
        type: String,
    }
    
});

module.exports = mongoose.model('Template', TemplateSchema);

