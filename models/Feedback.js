const mongoose = require('mongoose');

const FeedbackSchema = mongoose.Schema({
    contractRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractRequest',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now(),
        required: true
    }
    
});

module.exports = mongoose.model('Feedback', FeedbackSchema);