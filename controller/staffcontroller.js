const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const User = require('../models/User.js');
const ContractRequest = require('../models/ContractRequest.js');
const ContractType = require('../models/ContractType.js');
const Status = require('../models/Status.js');
const Role = require('../models/Role.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');


const staffcontroller = {


    getStaffDashboard: async (req, res) => {
        try {

            // const userlogged = await User.findOne({ email: req.user.email }).lean()
            // .populate({
                // path: 'role'
            // }).exec();
    
            // console.log(userlogged);
            res.render('dashboardoulc', {
                user_role:req.session.role
            });

        } catch (err) {
            console.log(err);
        }
    },

    getRequests: async (req, res) => {
        try {

            const contractrequests = await ContractRequest.find({}).lean()
                .populate({
                    path: 'requester',
                    populate: {
                        path: 'department'
                      } 
                })
                .populate({
                    path: 'contractType'
                })
                .populate({
                    path: 'asssignedAttorney'
                })
                .sort({requestDate: 1})
                .exec();

                for (i = 0; i < contractrequests.length; i++) {
                    contractrequests[i].status = await Status.findOne({counter: contractrequests[i].statusCounter}).exec();
                    contractrequests[i].status = contractrequests[i].status.statusStaff;
                    // console.log (contractrequests[i].status);
                }
            //   console.log("CONTRACT" + JSON.stringify(contractrequests));
            // console.log(userlogged);
            res.render('requestsoulc', {
                user_role:req.session.role,
                contractrequests: contractrequests
            });

        } catch (err) {
            console.log(err);
        }
    },
    getTemplates: async (req, res) => {
        try {

            // const userlogged = await User.findOne({ email: req.user.email }).lean()
            // .populate({
            //     path: 'role'
            // }).exec();
    
            // console.log(userlogged);
            res.render('templatesoulc', {
                user_role:req.session.role
            });

        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = staffcontroller;