const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema({
    information: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);