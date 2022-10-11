const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: false
    },
    sender: {
        type: String,
        required: false
        //type: mongoose.Schema.Types.ObjectId,
        //ref: 'User',
    },
    content: {
        type: String,
        //required: true
    },
    date: {
        type: Date,
        default: Date.now(),
        required: true
    }
    
});

module.exports = mongoose.model('Message', MessageSchema);