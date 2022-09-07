const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const User = require('../models/User.js');
const Role = require('../models/Role.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');


const staffcontroller = {


    getStaffDashboard: async (req, res) => {
        try {

            const userlogged = await User.findOne({ email: req.user.email }).lean()
            .populate({
                path: 'role'
            }).exec();
    
            // console.log(userlogged);
            res.render('dashboardoulc', {
                user:userlogged
            });

        } catch (err) {
            console.log(err);
        }
    },

    getRequests: async (req, res) => {
        try {

            const userlogged = await User.findOne({ email: req.user.email }).lean()
            .populate({
                path: 'role'
            }).exec();
    
            // console.log(userlogged);
            res.render('requestsoulc', {
                user:userlogged
            });

        } catch (err) {
            console.log(err);
        }
    },
    getTemplates: async (req, res) => {
        try {

            const userlogged = await User.findOne({ email: req.user.email }).lean()
            .populate({
                path: 'role'
            }).exec();
    
            // console.log(userlogged);
            res.render('templatesoulc', {
                user:userlogged
            });

        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = staffcontroller;