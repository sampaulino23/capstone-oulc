// TREAT THIS SCHEMA AS A USER INSTEAD OF A CUSTOMER,
// THIS MEANS THAT BOTH ADMINS AND CUSTOMERS FALL WITHIN THIS MODEL

const mongoose = require('mongoose');
const CustomerSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required:true
    },
    contact_number: {
        type: String,
        required:true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    url:{
        type: String
    }
    
});

module.exports = mongoose.model('Customer', CustomerSchema);

