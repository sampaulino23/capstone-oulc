const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';

const User = require('../models/User.js');
const { ObjectId } = require('mongoose');

const admincontroller = {

    getAddUser: async (req, res) => {
        try {
			res.render('adduser');

		} catch(err) {
			console.log(err);
		}
    },
   
    postAddUser: async (req, res) => {
        try {
            let user = new User({
                fullName: req.body.name,
                email: req.body.email,
                department: req.body.department,
                role: req.body.role,
                isActive: true,
                password: '12345'
            });

			res.send('User ' + user.fullName + ' has been added');

		} catch(err) {
			console.log(err);
		}
    },

    getUserManagement: async (req, res) => {
        try {
            console.log("USERS");

            const users = await User.find({}).lean()
                                        .sort({})
                                        .exec();

			res.render('usermanagement', {
                role: req.user.role,
                users: users
            });

		} catch(err) {
			console.log(err);
		}
    }
}

module.exports = admincontroller;