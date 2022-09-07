const mongoose = require('mongoose');

const TemplateSchema = mongoose.Schema({
    name: {
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

module.exports = mongoose.model('Template', TemplateSchema);

