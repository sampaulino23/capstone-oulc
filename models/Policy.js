const mongoose = require('mongoose');

const PolicySchema = mongoose.Schema({
    name: {
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
    }
});

module.exports = mongoose.model('Policy', PolicySchema);

