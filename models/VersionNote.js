const mongoose = require('mongoose');

const VersionNoteSchema = mongoose.Schema({
    oulcComments: {
        type: String,
        required: true,
        default: 'N/A'
    },
    thirdPartyResponse: {
        type: String,
        required: true,
        default: 'N/A'
    },
    requestingPartyRemarks: {
        type: String,
        required: true,
        default: 'N/A'
    }
});

module.exports = mongoose.model('VersionNote', VersionNoteSchema);

