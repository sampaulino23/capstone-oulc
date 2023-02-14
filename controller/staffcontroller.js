const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const User = require('../models/User.js');
const ContractRequest = require('../models/ContractRequest.js');
const ContractType = require('../models/ContractType.js');
const Status = require('../models/Status.js');
const Template = require('../models/Template.js');
const Role = require('../models/Role.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');
const { template } = require('handlebars');
const { populate } = require('../models/User.js');

const staffcontroller = {

    getRequests: async (req, res) => {
        try {

            if (req.user.roleName == "Requester") {
                var query = {requester: req.user._id};
            }
            else{
                var query = {};
            }

            //console.log(query + req.user.fullName);
            const contractrequests = await ContractRequest.find(query).lean()
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
                    path: 'assignedAttorney'
                })
                .populate({
                    path: 'assignedStaff'
                })
                .sort({requestDate: 1})
                .exec();

            // console.log('length: ' + contractrequests.length);

            for (i = 0; i < contractrequests.length; i++) {
                const statusList = await Status.findOne({counter: contractrequests[i].statusCounter}).exec();
            
                if (req.user.roleName == "Staff") {
                    contractrequests[i].status = statusList.statusStaff;
                    // console.log(i + ' ' + contractrequests[i].statusCounter + ' ' + contractrequests[i].status);
                }
                else if (req.user.roleName == "Attorney"){
                    contractrequests[i].status = statusList.statusAttorney;
                    // console.log(i + ' ' + contractrequests[i].statusCounter + ' ' + contractrequests[i].status);
                }
                else {
                    contractrequests[i].status = statusList.statusRequester;
                    // console.log(i + ' ' + contractrequests[i].statusCounter + ' ' + contractrequests[i].status);
                }
                
                // var date1 = contractrequests[i].requestDate;
                // var date2 = contractrequests[i].effectivityStartDate;
                    
                // // To calculate the time difference of two dates
                // var Difference_In_Time = contractrequests[i].effectivityStartDate.getTime() - contractrequests[i].requestDate.getTime();
                    
                // // To calculate the no. of days between two dates
                // var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                // if (Difference_In_Days < 0){
                //     Difference_In_Days = Math.floor(Difference_In_Days);
                // }
                // else {
                //     Difference_In_Days = Math.ceil(Difference_In_Days);
                // }

                function dateDiffInDays(a, b) {
                    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
                    // Discard the time and time-zone information.
                    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
                    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
                  
                    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
                }

                Difference_In_Days = dateDiffInDays(new Date(contractrequests[i].requestDate), new Date(contractrequests[i].effectivityStartDate));

                // To set number of days gap in contract request
                contractrequests[i].daysGap = Difference_In_Days;

            }

            const contracttypes = await ContractType.find({}).lean().exec();

            const user = await User.findById(req.user).lean()
                            .populate({
                                path: 'role'
                            })
                            .exec();
            
            res.render('requestsoulc', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName,
                user: user,
                contracttypes: contracttypes,
                contractrequests: contractrequests,
                pending_nearstartcount: req.session.pending_nearstartcount, //new notif implementation
                toreview_nearstartcount: req.session.toreview_nearstartcount, //new notif implementation
                legalReview_nearstartcount: req.session.legalReview_nearstartcount, //new notif implementation
                forrevision_count: req.session.forrevision_count //new notif implementation
            });

        } catch (err) {
            console.log(err);
        }
    },
    
    getTemplates: async (req, res) => {
        try {

            const contracttypes = await ContractType.find({}).lean().exec();
            const templates = await Template.find({}).lean()
                .populate({
                    path: 'type'
                }).exec();

            res.render('templatesoulc', {
                user_fullname:req.user.fullName,
                user_role: req.user.roleName,
                contracttypes: contracttypes,
                templates: templates,
                pending_nearstartcount: req.session.pending_nearstartcount, //new notif implementation
                toreview_nearstartcount: req.session.toreview_nearstartcount, //new notif implementation
                legalReview_nearstartcount: req.session.legalReview_nearstartcount, //new notif implementation
                forrevision_count: req.session.forrevision_count //new notif implementation
                
            });

        } catch (err) {
            console.log(err);
        }
    }

    
}

module.exports = staffcontroller;