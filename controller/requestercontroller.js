const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const crypto = require('crypto');

const User = require('../models/User.js');
const ContractRequest = require('../models/ContractRequest.js');
const ContractType = require('../models/ContractType.js');
const Status = require('../models/Status.js');
const Template = require('../models/Template.js');
const Conversation = require('../models/Conversation.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');
const { template } = require('handlebars');
const RepositoryFile = require('../models/RepositoryFile.js');

const requestercontroller = {

    getHome: async (req, res) => {
        try {
           
            res.render('requesterhome', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName
            });

        } catch (err) {
            console.log(err);
        }
    },

    getCreateRequest: async (req, res) => {
        try {

            const user = await User.findById(req.user).lean()
                .populate({
                    path: 'department',
                    ref: 'Department'
                })
                .exec();

            var today = new Date();

            const contracttypes = await ContractType.find({}).lean().exec();

            res.render('createrequest', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName,
                department: user.department.abbrev,
                requestdate: today,
                contracttypes: contracttypes
            });

        } catch (err) {
            console.log(err);
        }
    },

    postCreateRequest: async (req, res) => {
        try {
            // var roleName = req.body.role;
            // var departmentAbbrev = req.body.department;

            // const role = await Role.findOne({name: roleName}).exec();
            // const department = await Department.findOne({abbrev: departmentAbbrev}).exec();

            const users = await User.find({roleName: "Staff", isActive: true}).lean()
                .exec();

            var contractrequest = new ContractRequest({
                 requester: req.user._id,
                 contractType: "6318a39958ff2002a67f7507", //Test only. 
                 trackingNumber: "12345", //Test only. Automate
                 subjectMatter: req.body.subject,
                 requestDate: Date.now(),
                 requestTitle: req.body.documenttitle,
                 effectivityStartDate: req.body.starteffectivity,
                 effectivityEndDate: req.body.endeffectivity,
                // contactPerson: "" --> not in schema
                 contactNum: req.body.contactno,
                // reviewType: req.body.reviewtype, --> Test only. Input field to be changed
                 signatoryLevel: req.body.signatorylevel, //Test only. Automate
                 signatoryName: req.body.signatoryname,
                 templateUsed: "DLSU Template", //req.body.templateused, //Test only. Input field to be changed
                 sectionChangeNotes: req.body.sectionchanges, //Test only. Input field to be changed
                 thirdPartyRepresentativeName: req.body.thirdpartyname,
                 thirdPartyRepresentativeEmail: req.body.thirdpartyemail,
                 contractingParty: req.body.contractingparty,
                 amountInvolved: req.body.amount,
                 assignedAttorney: "6318a6b4c0119ed0b4b6bb82" //Initial only
            });

            await contractrequest.save(async function(){
                var membersList = [req.user._id];
                for (i=0; i < users.length; i++) {
                    membersList.push(users[i]._id);
                }
            
                var conversation = new Conversation({
                    contractRequest: contractrequest._id,
                    members: membersList
                });
                await conversation.save();
                res.redirect('/requester');
            });

        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = requestercontroller;