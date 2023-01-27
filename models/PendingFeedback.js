const mongoose = require('mongoose');

const PendingFeedbackSchema = mongoose.Schema({
    contractVersion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractVersion',
        required: true
    },
    feedbackSet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeedbackSet',
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
    status: {
        type: String,
        enum: ['Pending', 'Submitted'],
        required: true,
        default: 'Pending'
    },
    submitDate: {
        type: Date,
        default: Date.now(),
    },
    
});

module.exports = mongoose.model('PendingFeedback', PendingFeedbackSchema);