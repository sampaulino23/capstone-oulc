const mongoose = require('mongoose');

const StagingContractSchema = mongoose.Schema({
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
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
    version: {
        type: Number,
        required: true
    },
    versionNote: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VersionNote',
    }
    
});

module.exports = mongoose.model('StagingContract', StagingContractSchema);

