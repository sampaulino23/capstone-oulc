const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const StatusSchema = mongoose.Schema({
    counter: {
        type: Int32,
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

