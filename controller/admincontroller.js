const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');

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

            //generate random 8 character password
            var password = Math.random().toString(36).substr(2, 8);

            var user = new User({
                fullName: req.body.name,
                email: req.body.email,
                department: req.body.department,
                role: req.body.role,
                isActive: true,
                password: password
            });

            // hash the password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user.password, salt);
            user.password = hash;

			req.session.newlyAddedUser = user._id;

			res.redirect('/admin/usermanagement');

            await user.save();

		} catch(err) {
			console.log(err);
		}
    },

    getUserManagement: async (req, res) => {
        try {
            // console.log("USERS");
            var adminuser;

            try {
                var newlyAddedUser = req.session.newlyAddedUser;
                // console.log('newlyAddedUser: ' + newlyAddedUser);
                req.session.newlyAddedUser = null;
            } catch(err) {
                console.log(err);
            }

            const users = await User.find({}).lean()
                                        .sort({})
                                        .exec();

            // console.log (users.length);

            const newUser = await User.findById(newlyAddedUser).lean().exec();

            // console.log(newUser)

            for (i = 0; i < users.length; i++) {
                // console.log ("for " + i);
                if (users[i].role == "Administrator"){
                    adminuser = users[i];
                    // console.log (i);
                    break;
                }
                
            }

			res.render('usermanagement', {
                role: adminuser.role,
                users: users,
                newlyAddedUser: newUser
            });

		} catch(err) {
			console.log(err);
		}
    }
}

module.exports = admincontroller;