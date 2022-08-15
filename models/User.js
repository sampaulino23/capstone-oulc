// TREAT THIS SCHEMA AS A USER INSTEAD OF A CUSTOMER,
// THIS MEANS THAT BOTH ADMINS AND CUSTOMERS FALL WITHIN THIS MODEL

const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    user_fullname: {
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true
    },
    user_pass: {
        type: String,
        required: true
    },
    user_role: {
        type: String,
        required:true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    url:{
        type: String
    }
    
});

module.exports = mongoose.model('User', UserSchema);

