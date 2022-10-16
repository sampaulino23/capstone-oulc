const mongoose = require('mongoose');

const ContractSchema = mongoose.Schema({
    contractRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractRequest',
        required: true
    },
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
    },
    // title: {
    //     type: String,
    // },
    latestversion: {
        type: Number
    }
    
});

module.exports = mongoose.model('Contract', ContractSchema);

