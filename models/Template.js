const mongoose = require('mongoose');

const TemplateSchema = mongoose.Schema({
    name: {
        type: String,   // filename of the file upload
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
    wordFileId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    pdfFileId: {
        type: mongoose.Schema.Types.ObjectId,
    }
    
});

module.exports = mongoose.model('Template', TemplateSchema);

