const mongoose = require('mongoose');

const ContractVersionSchema = mongoose.Schema({
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        required: true
    },
    file: {
        type: mongoose.Schema.Types.ObjectId,   // implement changes when finalized
        required: true
    },
});

module.exports = mongoose.model('ContractVersion', ContractVersionSchema);

