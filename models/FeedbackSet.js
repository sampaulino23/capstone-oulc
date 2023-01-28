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
    },
    feedbacks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PendingFeedback'
    }]
    
});

module.exports = mongoose.model('FeedbackSet', FeedbackSetSchema);