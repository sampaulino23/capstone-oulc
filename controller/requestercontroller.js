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
const Contract = require('../models/Contract.js');
const ContractVersion = require('../models/ContractVersion.js');
const ContractRequest = require('../models/ContractRequest.js');
const ContractType = require('../models/ContractType.js');
const ReferenceDocument = require('../models/ReferenceDocument.js');
const Status = require('../models/Status.js');
const Template = require('../models/Template.js');
const Conversation = require('../models/Conversation.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');
const { template } = require('handlebars');
const RepositoryFile = require('../models/RepositoryFile.js');

const conn = mongoose.createConnection(url);

// Init gridfsBucket
let gridfsBucket, gridfsBucketRequestDocuments;

conn.once('open', () => {
    // gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    //     bucketName: 'repository'
    // });
    gridfsBucketRequestDocuments = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'requestdocuments'
    });
});

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

            const files = req.files;
            console.log(files);

            const users = await User.find({roleName: "Staff", isActive: true}).lean()
                .exec();

            const daterange = req.body.daterange;
            console.log(daterange);

            let startDate = new Date(daterange.substring(0, 10));
            let endDate = new Date(daterange.substring(13));

            console.log(startDate);
            console.log(endDate);

            var contractrequest = new ContractRequest({
                 requester: req.user._id,
                 contractType: "6318a39958ff2002a67f7507", //Test only. 
                 trackingNumber: "12345", //Test only. Automate
                 subjectMatter: req.body.subject,
                 requestDate: req.body.requestdate,
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
                if (files.contractFiles != null) {
                    for (contractFile of files.contractFiles) {
                        console.log(contractFile);
                        console.log(contractFile.id);
    
                        // insert contract object to db
                        var newContract = new Contract({
                            contractRequest: contractrequest._id,
                            latestversion: 1
                        });
    
                        var contract = await newContract.save();
                        
                        // insert contract version object to db
                        var newContractVersion = new ContractVersion({
                            contract: contract._id,
                            version: 1,
                            uploadDate: contractFile.uploadDate,
                            file: contractFile.id,
                            filename: contractFile.filename
                        })
    
                        await newContractVersion.save();
                    }
                }
    
                if (files.refDocFiles != null) {
                    for (refDocFile of files.refDocFiles) {
                        console.log(refDocFile);
                        console.log(refDocFile.id);
    
                        // insert reference document object to db
                        var newReferenceDocument = new ReferenceDocument({
                            contractRequest: contractrequest._id,
                            uploadDate: refDocFile.uploadDate,
                            file: refDocFile.id,
                            filename: refDocFile.filename
                        });
    
                        await newReferenceDocument.save();
                    }
                }

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