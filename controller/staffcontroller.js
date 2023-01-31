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

            if(req.user.roleName == "Attorney" && req.user._id != "6318a6b4c0119ed0b4b6bb82"){
                var query = {assignedAttorney: req.user._id};
            }
            else if (req.user.roleName == "Requester") {
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
                .sort({requestDate: 1})
                .exec();

            // console.log('length: ' + contractrequests.length);

            let pending = {nearstartcount: 0};
            let toreview = {nearstartcount: 0};
            let legalReview  = {nearstartcount: 0};

            for (i = 0; i < contractrequests.length; i++) {
                const statusList = await Status.findOne({counter: contractrequests[i].statusCounter}).exec();

                //var Difference_In_Days_Start = dateDiffInDays(new Date(contractrequests[i].requestDate), new Date(contractrequests[i].effectivityStartDate));
            
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

                if (contractrequests[i].statusCounter == "1"){
                    if(Difference_In_Days == 0 || Difference_In_Days < 7){
                        pending.nearstartcount++;
                    }
                }
                if (contractrequests[i].statusCounter == "3"){
                    if(Difference_In_Days == 0 || Difference_In_Days < 7){
                        toreview.nearstartcount++;
                    }
                }
                if(contractrequests[i].statusCounter == "4" || contractrequests[i].statusCounter == "6"){
                    if(Difference_In_Days == 0 || Difference_In_Days < 7){
                        legalReview.nearstartcount++;
                    }
                }

            }

            const contracttypes = await ContractType.find({}).lean().exec();

            const user = await User.findById(req.user).lean()
                            .populate({
                                path: 'role'
                            })
                            .exec();

            //For revision count - notifs/alerts
            const forrevisionrequests = await ContractRequest.find({requester: req.user._id, statusCounter: 6}).lean().exec();
            var forrevisioncount;
            for (forrevisioncount = 0; forrevisioncount < forrevisionrequests.length; forrevisioncount++){
                forrevisioncount++;
            }
            //
            
            res.render('requestsoulc', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName,
                user: user,
                contracttypes: contracttypes,
                contractrequests: contractrequests,
                forrevisioncount: forrevisioncount,
                pending: pending,
                toreview: toreview,
                legalReview: legalReview
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

            //For revision count - notifs/alerts
            const forrevisionrequests = await ContractRequest.find({requester: req.user._id, statusCounter: 6}).lean().exec();
            var forrevisioncount;
            for (forrevisioncount = 0; forrevisioncount < forrevisionrequests.length; forrevisioncount++){
                forrevisioncount++;
            }
            //
            let pending = {nearstartcount: 0};
            let toreview = {nearstartcount: 0};
            let legalReview  = {nearstartcount: 0};

            const contractrequests = await ContractRequest.find().lean().exec();
            for (i = 0; i < contractrequests.length; i++) {
                function dateDiffInDays(a, b) {
                    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
                    // Discard the time and time-zone information.
                    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
                    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
                  
                    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
                }

                Difference_In_Days = dateDiffInDays(new Date(contractrequests[i].requestDate), new Date(contractrequests[i].effectivityStartDate));
                
                if (contractrequests[i].statusCounter == "1"){
                    if(Difference_In_Days == 0 || Difference_In_Days < 7){
                        pending.nearstartcount++;
                    }
                }
                if (contractrequests[i].statusCounter == "3"){
                    if(Difference_In_Days == 0 || Difference_In_Days < 7){
                        toreview.nearstartcount++;
                    }
                }
                if(contractrequests[i].statusCounter == "4" || contractrequests[i].statusCounter == "6"){
                    if(Difference_In_Days == 0 || Difference_In_Days < 7){
                        legalReview.nearstartcount++;
                    }
                }

            }

            res.render('templatesoulc', {
                user_fullname:req.user.fullName,
                user_role: req.user.roleName,
                contracttypes: contracttypes,
                templates: templates,
                forrevisioncount: forrevisioncount,
                pending: pending,
                toreview: toreview,
                legalReview: legalReview
            });

        } catch (err) {
            console.log(err);
        }
    }

    
}

module.exports = staffcontroller;