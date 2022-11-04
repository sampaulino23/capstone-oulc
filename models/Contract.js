const mongoose = require('mongoose');

const ContractSchema = mongoose.Schema({
    contractRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractRequest',
        required: true
    },
    latestversion: {
        type: Number
    }
    
});

module.exports = mongoose.model('Contract', ContractSchema);

