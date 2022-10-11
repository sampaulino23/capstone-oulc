const mongoose = require('mongoose');

const ConversationSchema = mongoose.Schema({

    contractRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractRequest',
        required: false
    },

    members: [{
        type: String,
        required: true
    }]
});

module.exports = mongoose.model('Conversation', ConversationSchema);