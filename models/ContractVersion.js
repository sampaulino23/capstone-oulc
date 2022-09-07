const { Int32 } = require('mongodb');
const mongoose = require('mongoose');

const ContractVersionSchema = mongoose.Schema({
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    number: {
        type: Int32,
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

module.exports = mongoose.model('ContractVersion', ContractVersionSchema);

