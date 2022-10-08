const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    
});

module.exports = mongoose.model('Message', MessageSchema);