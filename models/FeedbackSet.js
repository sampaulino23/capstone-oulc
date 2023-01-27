const mongoose = require('mongoose');

const FeedbackSetSchema = mongoose.Schema({
    contractRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractRequest',
        required: true
    },
    date: {
        type: Date,
        default: Date.now(),
        required: true
    },
    counter: {
        type: Number,
        default: 1,
        required: true
    }
    
});

module.exports = mongoose.model('FeedbackSet', FeedbackSetSchema);