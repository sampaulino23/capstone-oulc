//const mongoose = require('mongoose');
//const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const User = require('../models/User.js');
const { ObjectId } = require('mongoose');

const resetpasswordcontroller = {

    getResetPassword: async (req, res) => {
		try {
            var userid = req.params.id;

            console.log ("Reset Password Page");
            console.log('userid: ' + userid);

			const user = await User.find({_id : userid}).lean().exec();

			res.render('resetpassword', {user: user, pagename: 'Reset Password', title: 'Reset Password'});
		} catch(err) {
			console.log(err);
		}
    },

    resetPassword: async (req, res) => {
        try {
            var userid = req.body.userid;
            var password = req.body.password;

            console.log ("Post Reset Password");
            console.log('userid: ' + userid);

            // hash the password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            password = hash;

            await User.findByIdAndUpdate(userid, {$set: {password: password, isDefaultPass: false}}).exec();

            console.log('new password: ' + password);

            res.redirect('/');
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = resetpasswordcontroller;