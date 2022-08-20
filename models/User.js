const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required:true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isDefaultPass: {
        type: Boolean,
        default: true
    },
    
});

module.exports = mongoose.model('User', UserSchema);

