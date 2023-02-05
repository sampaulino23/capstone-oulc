const mongoose = require('mongoose');

const FeedbackSchema = mongoose.Schema({
    contractVersion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractVersion',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    content: {
        type: String,
        required: true,
        default: ' '
    },
    status: {
        type: String,
        enum: ['Pending', 'Submitted', 'Revised'],
        required: true,
        default: 'Pending'
    },
    submitDate: {
        type: Date,
        default: Date.now(),
    },
    
});

module.exports = mongoose.model('Feedback', FeedbackSchema);