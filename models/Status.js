const mongoose = require('mongoose');
const StatusSchema = mongoose.Schema({
    counter: {
        type: Number,
        unique: true,
        required: true
    },
    statusStaff: {
        type: String,
        required: true
    },
    statusAttorney: {
        type: String,
        required: true
    },
    statusRequester: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Status', StatusSchema);

