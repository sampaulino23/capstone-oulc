const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const User = require('../models/User.js');
const Role = require('../models/Role.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');

function checkAdmin(req,res,next){
    if(req.user.isAdmin){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/unavailable");
    }
}

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: "capstone.samantha@gmail.com",
//         pass: "uapnxnyyyqqsfkax"
//     }
// });

// const options = {
//     from: "capstone.samantha@gmail.com",
//     to: "samantha.capstone@gmail.com",
//     subject: "SENDING EMAIL WITH NODE",
//     text: "wow! so simple"
// }

 


const admincontroller = {

    // sendEmail: function (req, res) { // function for send mail

    //     transporter.sendMail (options, function (err, info) {
    //         if (err) {
    //             console.log(err);
    //             return;
    //         }
    //         console.log("Sent: " + info.response);
    //     })       
        
    // },



    getAddUser: async (req, res) => {
        try {

            const departments = await Department.find({}).lean().exec();
            const roles = await Role.find({ name: { $not: { $eq: "Administrator" } } }).lean().exec();

            res.render('adduser', {
                departments: departments,
                roles: roles
            });

        } catch (err) {
            console.log(err);
        }
    },

    postAddUser: async (req, res) => {
        try {

            //generate random 8 character password
            var password = Math.random().toString(36).substr(2, 8);

            var roleName = req.body.role;
            var departmentAbbrev = req.body.department;

            const role = await Role.findOne({name: roleName}).exec();
            const department = await Department.findOne({abbrev: departmentAbbrev}).exec();

            var user = new User({
                fullName: req.body.name,
                email: req.body.email,
                department: department._id,
                role: role._id,
                isActive: true,
                password: password,
                isDefaultPass: true
            });

            // code section below is for sending the password to the account's email address
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "capstone.samantha@gmail.com",
                    pass: "uapnxnyyyqqsfkax"
                }
            });

            // change "to" field to your dummy email so you can see the password
            const options = {
                from: "OULC Contract Management System Admin <capstone.samantha@gmail.com>",
                to: "capstone.zelong@gmail.com", //change to user.email when done testing
                subject: "New account password",
                text: "Welcome to the OULC's Contract Management System, " + user.fullName + ". To log in to our system, please use this as your password: " + user.password +
                " http://localhost:3000/resetpassword/" + user._id 
            }

            transporter.sendMail (options, function (err, info) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Sent: " + info.response);
            })       

            // hash the password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user.password, salt);
            user.password = hash;

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

            const adminRole = await Role.findOne({name: 'Administrator'}).exec();

            const users = await User.find({role:  { $not: { $eq: adminRole._id } }}).lean()
                .populate({
                    path: 'department'
                })
                .populate({
                    path: 'role'
                })
                .sort({})
                .exec();

            const roles = await Role.find({name:  { $not: { $eq: "Administrator"} }}).lean().exec();
            const departments = await Department.find({}).lean().exec();

            const newUser = await User.findById(newlyAddedUser).lean().exec();

            res.render('usermanagement', {
                users: users,
                departments: departments,
                roles: roles,
                newlyAddedUser: newUser
            });

        } catch (err) {
            console.log(err);
        }
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

    getEditUserDetails: async (req, res) => {
        try {
            console.log ("Get Edit User Details");

            // select role and department depending on db
        } catch (err) {
            console.log(err);
        }
    },

    postEditUserDetails: async (req, res) => {
        try {
            console.log ("Post Edit User Details");

            var userid = req.body.edituserdetailsid;
            var fullName = req.body.editFullName;
            var departmentAbbrev = req.body.editDepartment;
            var roleName = req.body.editRole;

            const department = await Department.findOne({abbrev: departmentAbbrev}).exec();
            const role = await Role.findOne({name: roleName}).exec();

            await User.findByIdAndUpdate(userid, { $set: { fullName: fullName, department: department._id, role: role._id } });
            
            res.redirect('back');
            
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