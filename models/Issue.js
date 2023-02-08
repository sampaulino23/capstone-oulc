const mongoose = require('mongoose');

const IssueSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Type 1', 'Type 2'],
        default: 'Type 1',
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    issueNumber: {
        type: String,
        required: true
    },
    contractRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractRequest',
        required: false
    },
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved'],
        default: 'Pending',
        required: true
    },
    response: {
        type: String,
        default: '',
        required: false
    },
    date: {
        type: Date,
        default: Date.now(),
        required: true
    }
});

module.exports = mongoose.model('Issue', IssueSchema);