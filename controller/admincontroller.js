const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');

const User = require('../models/User.js');
const { ObjectId } = require('mongoose');


async function getUserAccess (path, req, res) {
    var userAccess;

    if (path == '/active')
        userAccess = true;
    else if (path == '/inactive')
        userAccess = false;


    try {
        const users = await User.find({ isActive: userAccess }).lean()
            .sort({})
            .exec();

        res.render('usermanagement', {
            users: users
        });

    } catch (err) {
        console.log(err);
    }
}

const admincontroller = {

    getAddUser: async (req, res) => {
        try {
            res.render('adduser');

        } catch (err) {
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
                password: password,
                isDefaultPass: true
            });

            // hash the password not needed for adding new user. Remove when finalized
            /*const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user.password, salt);
            user.password = hash;*/

            req.session.newlyAddedUser = user._id;

            res.redirect('/admin/usermanagement');

            await user.save();

        } catch (err) {
            console.log(err);
        }
    },

    getUserManagement: async (req, res) => {
        try {

            try {
                var newlyAddedUser = req.session.newlyAddedUser;
                // console.log('newlyAddedUser: ' + newlyAddedUser);
                req.session.newlyAddedUser = null;
            } catch (err) {
                console.log(err);
            }

            const users = await User.find({}).lean()
                .sort({})
                .exec();
            const newUser = await User.findById(newlyAddedUser).lean().exec();

            res.render('usermanagement', {
                users: users,
                newlyAddedUser: newUser
            });

        } catch (err) {
            console.log(err);
        }
    },

    getUserManagementAccess: function (req, res) {
        getUserAccess(req.path, req, res);
    },

    disableUser: async (req, res) => {
        try {
            console.log("Inside Disable User");
            var userid = req.query.userid;
            await User.findOneAndUpdate({ _id: userid }, { $set: { isActive: false } });

        } catch (err) {
            console.log(err);
        }
    },

    enableUser: async (req, res) => {
        try {
            console.log("Inside Enable User");
            var userid = req.query.userid;
            await User.findOneAndUpdate({ _id: userid }, { $set: { isActive: true } });
        } catch (err) {
            console.log(err);
        }
    },

    resetPassword: async (req, res) => {
        try {
            console.log ("Reset Password");

            //generate random 8 character password
            var password = Math.random().toString(36).substr(2, 8);
            var userid = req.body.userid;

            console.log('userid: ' + userid);

            await User.findByIdAndUpdate(userid, { $set: { password: password, isDefaultPass: true } });

            console.log('new password: ' + password);

            res.redirect('back');
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = admincontroller;