const mongoose = require('mongoose');

const ThirdPartySchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
    
});

module.exports = mongoose.model('ThirdParty', ThirdPartySchema);

