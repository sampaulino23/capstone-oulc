const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const User = require('../models/User.js');
const ContractRequest = require('../models/ContractRequest.js');
const Contract = require('../models/Contract.js');
const ContractVersion = require('../models/ContractVersion.js');
const StagingContractVersion = require('../models/StagingContractVersion.js');
const VersionNote = require('../models/VersionNote.js');
const ReferenceDocument = require('../models/ReferenceDocument.js');
const Message = require('../models/Message.js');
const ContractType = require('../models/ContractType.js');
const Status = require('../models/Status.js');
const Role = require('../models/Role.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');
const RepositoryFile = require('../models/RepositoryFile.js');
const NegotiationFile = require('../models/NegotiationFile.js');
const Conversation = require('../models/Conversation.js');
const ThirdParty = require('../models/Thirdparty.js');
const FeedbackSet = require('../models/FeedbackSet.js');

const fs = require('fs');
const { filename } = require('gotenberg-js-client');
const Template = require('../models/Template.js');
const Feedback = require('../models/Feedback.js');

    const conn = mongoose.createConnection(url);

// Init gridfsBucket
let gridfsBucket, gridfsBucketRequestDocuments, gridfsBucketTemplates, gridfsBucketNegotiations;

conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'repository'
    });
    gridfsBucketRequestDocuments = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'requestdocuments'
    });
    gridfsBucketTemplates = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'templates'
    });
    gridfsBucketNegotiations = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'negotiations'
    });
});

var client = require('@draftable/compare-api').client('Ctqxea-test', 'ba07097e83b21734ff6200b18278eee8');
var comparisons = client.comparisons;

const specificrequestcontroller = {

    getStaffSpecificRequest: async (req, res) => { //staff
        try {

            var path = req.path.split('/')[2];
            var userid = req.user._id;
            var messages = null;
            var withNegotiationFiles = false;

            const conversation = await Conversation.findOne({contractRequest: path, members: userid, type: "conversation"}).lean().exec();

            if (conversation) {
                console.log("INSIDE CONVERSATION");
                messages = await Message.find({conversationId: conversation._id}).lean().exec(); 
            }

            const contractrequest = await ContractRequest.findById(path).lean()
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
                    path: 'conversation'
                })
                .sort({requestDate: 1})
                .exec();

            const comments = await Feedback.find({contractRequest: contractrequest}).lean()
                .populate({
                    path: 'user_id'
                })
                .exec();

            const statusList = await Status.findOne({counter: contractrequest.statusCounter}).exec();

            if (req.user.roleName == "Staff") {
                contractrequest.status = statusList.statusStaff;
            }
            else if (req.user.roleName == "Attorney") {
                contractrequest.status = statusList.statusAttorney;
            }

            // // To calculate the time difference of two dates
            // var Difference_In_Time = contractrequest.effectivityEndDate.getTime() - contractrequest.effectivityStartDate.getTime();
                    
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

            var Difference_In_Days = dateDiffInDays(new Date(contractrequest.effectivityStartDate), new Date(contractrequest.effectivityEndDate));

            // To set number of days gap in contract request
            contractrequest.daysDuration = Difference_In_Days;

            const contracts = await Contract.find({contractRequest: path}).lean().exec();

            var latestversioncontracts = [];
            var contractversions = [];
            var revisedfeedbacks = [];

            for (contract of contracts) {
                const latestversioncontract = await ContractVersion.findOne({contract: contract._id, version: contract.latestversion})
                    .lean()
                    .populate({
                        path: 'versionNote'
                    })
                    .populate({
                        path: 'comment',
                        populate: {
                            path: 'user_id'
                        }
                    })
                    .exec();
                
                    latestversioncontracts.push(latestversioncontract);

                const contractversion = await ContractVersion.find({contract: contract._id})
                    .lean()
                    .populate({
                        path: 'contract',
                        populate: {
                            path: 'contractRequest',
                            populate: {
                                path: 'requester',
                            }
                        }
                    })
                    .populate({
                        path: 'versionNote'
                    })
                    .sort({version: -1})
                    .exec();

                for (eachcontractversion of contractversion) {
                    contractversions.push(eachcontractversion);

                    var revisedfeedback = await Feedback.findOne({contractVersion: eachcontractversion})
                        .lean()
                        .populate({
                            path: 'user_id'
                        })
                        .populate({
                            path: 'contractVersion'
                        }).exec();

                    revisedfeedbacks.push(revisedfeedback);
                }
            }

            const negotiationfiles = await NegotiationFile.find({requestid: path}).lean()
                .populate({
                    path: 'requestid',
                    populate: {
                        path: 'requester'
                    }
                }).exec();

            if (negotiationfiles.length != 0) {
                withNegotiationFiles = true;
            }

            const referencedocuments = await ReferenceDocument.find({contractRequest: path}).lean().exec();

            const roleAttorney = await Role.findOne({name: 'Attorney'}).exec();

            const attorneys = await User.find({role: roleAttorney,_id: { $ne: userid }, isActive: true}).lean().exec();

            const user = await User.findById(req.user).lean().exec();

            // TODO: Show Feedback History for specific request (repeat for Requester Side)
            // const feedbackSets = await FeedbackSet.find({contractRequest: contractrequest})
            //     .lean()
            //     .populate({
            //         path: 'feedba',
            //         populate({
            //             path: 'user_id'
            //         })
            //     })
            //     .exec();

            res.render('specificrequest', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName,
                user: user,
                contractrequest: contractrequest,
                comments: comments,
                latestversioncontracts: latestversioncontracts,
                referencedocuments: referencedocuments,
                contractversions: contractversions,
                attorneys: attorneys,
                conversation: conversation,
                messages: messages,
                negotiationfiles: negotiationfiles,
                withNegotiationFiles: withNegotiationFiles
            });

        } catch (err) {
            console.log(err);
        }
    },

    getRequesterSpecificRequest: async (req, res) => { //requester
        try {

            var path = req.path.split('/')[2];
            var userid = req.user._id;
            var messages = null;

            const conversation = await Conversation.findOne({contractRequest: path, members: userid, type: "conversation"}).lean().exec();
        
            if (conversation) {
                console.log("INSIDE CONVERSATION");
                messages = await Message.find({conversationId: conversation._id}).lean().exec(); 
            }
            
            const contractrequest = await ContractRequest.findById(path).lean()
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
                    path: 'conversation'
                })
                .sort({requestDate: 1})
                .exec();

            const statusList = await Status.findOne({counter: contractrequest.statusCounter}).exec();

            contractrequest.status = statusList.statusRequester;

            // // To calculate the time difference of two dates
            // var Difference_In_Time = contractrequest.effectivityEndDate.getTime() - contractrequest.effectivityStartDate.getTime();
                    
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

            var Difference_In_Days = dateDiffInDays(new Date(contractrequest.effectivityStartDate), new Date(contractrequest.effectivityEndDate));

            // To set number of days gap in contract request
            contractrequest.daysDuration = Difference_In_Days;

            const contracts = await Contract.find({contractRequest: path}).lean().exec();

            var latestversioncontracts = [];
            var contractversions = [];
            var stagingcontractversions = [];
            var feedbacks = [];
            var revisedfeedbacks = [];

            for (contract of contracts) {
                var latestversioncontract = await ContractVersion.findOne({contract: contract._id, version: contract.latestversion})
                    .lean()
                    .populate({
                        path: 'versionNote'
                    })
                    .populate({
                        path: 'comment',
                        populate: {
                            path: 'user_id'
                        }
                    })
                    .exec();

                var pendingFeedback = await Feedback.findOne({contractVersion: latestversioncontract})
                    .lean()
                    .populate({
                        path: 'user_id'
                    })
                    .populate({
                        path: 'contractVersion'
                    })
                    .exec();

                console.log(pendingFeedback);

                feedbacks.push(pendingFeedback);
                
                latestversioncontracts.push(latestversioncontract);

                var contractversion = await ContractVersion.find({contract: contract._id})
                    .lean()
                    .populate({
                        path: 'contract',
                        populate: {
                            path: 'contractRequest',
                            populate: {
                                path: 'requester',
                            }
                        }
                    })
                    .populate({
                        path: 'versionNote'
                    })
                    .sort({version: -1})
                    .exec();

                for (eachcontractversion of contractversion) {
                    contractversions.push(eachcontractversion);

                    var revisedfeedback = await Feedback.findOne({contractVersion: eachcontractversion})
                        .lean()
                        .populate({
                            path: 'user_id'
                        })
                        .populate({
                            path: 'contractVersion'
                        }).exec();

                    revisedfeedbacks.push(revisedfeedback);
                }

                var stagingcontractversion = await StagingContractVersion.findOne({contract: contract})
                    .lean()
                    .populate({
                        path: 'versionNote'
                    })
                    .exec();

                if (stagingcontractversion) {
                    stagingcontractversions.push(stagingcontractversion);
                }
            }

            const negotiationfiles = await NegotiationFile.find({requestid: path}).lean()
                .populate({
                    path: 'requestid',
                    populate: {
                        path: 'requester'
                    }
                }).exec();

            const referencedocuments = await ReferenceDocument.find({contractRequest: path}).lean().exec();

            res.render('specificrequest', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName,
                contractrequest: contractrequest,
                feedbacks: feedbacks,
                revisedfeedbacks: revisedfeedbacks,
                latestversioncontracts: latestversioncontracts,
                referencedocuments: referencedocuments,
                contractversions: contractversions,
                conversation: conversation,
                messages: messages,
                stagingcontractversions: stagingcontractversions,
                negotiationfiles: negotiationfiles
            });

        } catch (err) {
            console.log(err);
        }
    },

    forLegalReview: async (req, res) => { //staff
        try {
            console.log("Inside For Legal Review");
            var contractrequestid = req.query.contractid;
            await ContractRequest.findOneAndUpdate({ _id: contractrequestid }, { $set: { statusCounter: 4} });

            const contracts = await Contract.find({contractRequest: contractrequestid}).exec();

            // set isreviewed of all latestversioncontracts to false
            for (contract of contracts) {
                await ContractVersion.findOneAndUpdate({contract: contract._id, version: contract.latestversion}, {$set: {isreviewed: false}}).exec();
            }

            // set isreviewed of all referencedocuments to false
            const referencedocuments = await ReferenceDocument.find({ contractRequest: contractrequestid});

            for (referencedocument of referencedocuments) {
                await ReferenceDocument.findByIdAndUpdate(referencedocument._id, {$set: {isreviewed: false}}).exec();
            }

        } catch (err) {
            console.log(err);
        }
    },

    postForRevisionStaff: async (req, res) => { //staff
        try {

            var contractRequestId = req.body.addStaffFeedbackID;

            // var feedback = new Feedback({
            //     contractRequest: req.body.addStaffFeedbackID,
            //     user_id: req.user._id,
            //     content: req.body.addStaffFeedback
            // });

            console.log("Inside For Revision Office Staff");

            const contractrequest =  await ContractRequest.findOne({ _id: contractRequestId }); //for email
            const documenttype = await ContractType.findOne({ _id: contractrequest.contractType}); //for email
            await ContractRequest.findOneAndUpdate({ _id: contractRequestId }, { $set: { statusCounter: 2 } });
            // await feedback.save();

            // set status of pendingFeedbacks to 'Submitted'
            const contracts = await Contract.find({contractRequest: contractrequest}).lean().exec();
            var feedbacks = [];

            for (contract of contracts) {
                var latestversioncontract = await ContractVersion.findOne({contract: contract._id, version: contract.latestversion}).exec();
                    
                var pendingFeedback = await Feedback.findOneAndUpdate({contractVersion: latestversioncontract}, {$set: { status: 'Submitted'}}).exec();

                if (pendingFeedback) {
                    console.log(pendingFeedback);
    
                    feedbacks.push(pendingFeedback._id);
                }
            }

            // add feedbackSet object
            var newFeedbackSet = new FeedbackSet({
                contractRequest: contractrequest,
                counter: contractrequest.feedbackCounter + 1,
                feedbacks: feedbacks
            });

            console.log(newFeedbackSet);
            newFeedbackSet.save();

            // change feedbackCounter of contractRequest
            await ContractRequest.findOneAndUpdate({ _id: contractRequestId }, { $inc: { feedbackCounter: 1 } });

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
                to: "migfranzbro@gmail.com", //change to tester/user email 
                subject: "Contract Request [Document No. " + contractrequest.trackingNumber + "] - For Revision",
                text: "Good day! \n" + "\n Your request for contract approval with Document No. " 
                + contractrequest.trackingNumber + " has been marked as for revision. Please check comments and upload revised version of document/s. \n"
                + "\nContract Request Details: \n" 
                + "\nTitle: " + contractrequest.requestTitle + "\n"
                + "Request Date: " + contractrequest.requestDate + "\n"
                + "Document Type: " + documenttype.name + "\n"
                + "Subject Matter: " + contractrequest.subjectMatter + "\n" 
                + "\nLog-in now to begin processing the request: http://localhost:3000 \n" 
                + "\nRegards," 
                + "\nOffice of the University Legal Counsel" 
            }

            transporter.sendMail (options, function (err, info) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Sent: " + info.response);
            })       

            res.redirect('back');
        } catch (err) {
            console.log(err);
        }
    },

    postForRevisionAttorney: async (req, res) => { //attorney
        try {

            var contractRequestId = req.body.addAttorneyFeedbackID;

            var feedback = new Feedback({
                contractRequest: req.body.addAttorneyFeedbackID,
                user_id: req.user._id,
                content: req.body.addAttorneyFeedback
            });

            console.log("Inside For Revision Attorney");

            const contractrequest =  await ContractRequest.findOne({ _id: contractRequestId }); //for email
            const documenttype = await ContractType.findOne({ _id: contractrequest.contractType}); //for email
            await ContractRequest.findOneAndUpdate({ _id: contractRequestId }, { $set: { statusCounter: 5 } });
            await feedback.save();

            const contracts = await Contract.find({contractRequest: contractRequestId}).lean().exec();

            // var latestversioncontracts = [];

            for (contract of contracts) {
                const latestversioncontract = await ContractVersion.findOne({contract: contract._id, version: contract.latestversion})
                    .lean()
                    .populate({
                        path: 'versionNote'
                    })
                    .populate({
                        path: 'comment'
                    })
                    .exec();

                const today = new Date();

                await Comment.findByIdAndUpdate(latestversioncontract.comment._id, {$set: {submitDate: today, status: 'Submitted'}}).exec();
                
                // latestversioncontracts.push(latestversioncontract);
            }

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
                to: "migfranzbro@gmail.com", //change to tester/user email 
                subject: "Contract Request [Document No. " + contractrequest.trackingNumber + "] - For Revision",
                text: "Good day! \n" + "\n Your request for contract approval with Document No. " 
                + contractrequest.trackingNumber + " has been marked as for revision. Please check comments and upload revised version of document/s. \n"
                + "\nContract Request Details: \n" 
                + "\nTitle: " + contractrequest.requestTitle + "\n"
                + "Request Date: " + contractrequest.requestDate + "\n"
                + "Document Type: " + documenttype.name + "\n"
                + "Subject Matter: " + contractrequest.subjectMatter + "\n" 
                + "\nLog-in now to begin processing the request: http://localhost:3000 \n" 
                + "\nRegards," 
                + "\nOffice of the University Legal Counsel" 
            }

            transporter.sendMail (options, function (err, info) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Sent: " + info.response);
            })       

            res.redirect('back');
        } catch (err) {
            console.log(err);
        }
    },

    markAsCleared: async (req, res) => { //attorney
        try {
            console.log("Inside Mark as Cleared");
            var contractid = req.query.contractid;

            const contractrequest =  await ContractRequest.findOne({ _id: contractid }); //for email
            const documenttype = await ContractType.findOne({ _id: contractrequest.contractType}); //for email
            await ContractRequest.findOneAndUpdate({ _id: contractid }, { $set: { statusCounter: 7} });

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
                to: "migfranzbro@gmail.com", //change to tester/user email 
                subject: "Contract Request [Document No. " + contractrequest.trackingNumber + "] - Approved",
                text: "Good day! \n" + "\n Your request for contract approval with Document No. " 
                + contractrequest.trackingNumber + " has been approved and marked as Completed. Please upload signed contract/s.\n"
                + "\nContract Request Details: \n" 
                + "\nTitle: " + contractrequest.requestTitle + "\n"
                + "Request Date: " + contractrequest.requestDate + "\n"
                + "Document Type: " + documenttype.name + "\n"
                + "Subject Matter: " + contractrequest.subjectMatter + "\n" 
                + "\nRegards," 
                + "\nOffice of the University Legal Counsel \n" 
                + "\nLog-in now to view request: http://localhost:3000" 
                }
            
            transporter.sendMail (options, function (err, info) {
                if (err) {
                    console.log(err);
                    return;
                }
                    console.log("Sent: " + info.response);
            })     

        } catch (err) {
            console.log(err);
        }
    },

    cancelRequest: async (req, res) => { //attorney
        try {
            console.log("Inside Mark as Cancelled");
            var contractid = req.query.contractid;
            await ContractRequest.findOneAndUpdate({ _id: contractid }, { $set: { statusCounter: 8} });

        } catch (err) {
            console.log(err);
        }
    },

    routeToAnotherAttorney: async (req, res) => {
        try {
            const contractrequestid = req.query.contractrequestid;
            const routedattorney = req.query.routedattorney;
            console.log ("INSIDE ROUTE TO ANOTHER ATTORNEY");

            await ContractRequest.findOneAndUpdate({ _id: contractrequestid} , { $set: { assignedAttorney: routedattorney } }).exec();
            await Conversation.updateMany({ contractRequest: contractrequestid} , { $addToSet: { members: routedattorney } }).exec();

            // Reset is-reviewed to false for all latest contracts and reference documents attached
            const contracts = await Contract.find({ contractRequest: contractrequestid }).exec();

            for (contract of contracts) {
                await ContractVersion.findOneAndUpdate({ contract: contract._id,  version: contract.latestversion}, { $set: { isreviewed: false } }).exec();
                console.log ("INSIDE CONTRACTS" + contract);
            }

            const referencedocuments = await ReferenceDocument.find({ contractRequest: contractrequestid }).exec();

            for (referencedocument of referencedocuments) {
                await ReferenceDocument.findByIdAndUpdate(referencedocument._id, { $set: { isreviewed: false } }).exec();
                console.log ("INSIDE REFERENCE DOCUMENTS" + referencedocument);
            }

        } catch (err) {
            console.log(err);
        }
    },

    postUploadRepositoryFile: async (req, res) => { // requesting office
        try {

            const files = req.files;
            const requestid = req.body.uploadRepositoryFileID;

            if (files.signedContractFiles != null) {
                for (signedContractFile of files.signedContractFiles) {
                    let newRepositoryFile = new RepositoryFile({
                        name: signedContractFile.filename,
                        type: "others",
                        requestid: mongoose.Types.ObjectId(requestid),
                        uploadDate: signedContractFile.uploadDate,
                        file: signedContractFile.id
                    })
                    await newRepositoryFile.save();
                }
            }

            if (files.signedInstitutionalFiles != null) {
                for (signedInstitutionalFile of files.signedInstitutionalFiles) {
                    let newInstitutionalFile = new RepositoryFile({
                        name: signedInstitutionalFile.filename,
                        type: "institutional",
                        tags: ["Institutional MOA"], 
                        requestid: mongoose.Types.ObjectId(requestid),
                        uploadDate: signedInstitutionalFile.uploadDate,
                        file: signedInstitutionalFile.id
                    })
                    await newInstitutionalFile.save();
                }
            }

            res.redirect('back');
        } catch (err) {
            console.log(err);
        }
    },

    postUploadNegotiationFile: async (req, res) => { // requesting office
        try {

            const files = req.files;
            const requestid = req.body.uploadNegotiationFileID;

            if (files.negotiationFiles != null) {
                for (negotiationFile of files.negotiationFiles) {
                    let newNegotiationFile = new NegotiationFile({
                        name: negotiationFile.filename,
                        requestid: mongoose.Types.ObjectId(requestid),
                        uploadDate: negotiationFile.uploadDate,
                        file: negotiationFile.id
                    })

                    await newNegotiationFile.save();
                }
            }

            res.redirect('back');
        } catch (err) {
            console.log(err);
        }
    },

    postUploadRequestDocuments: async (req, res) => {

        try {
            console.log('UPLOAD REQUEST DOCUMENTS');

            const files = req.files;
            const contractrequestid = req.body.contractRequestId;

            console.log(contractrequestid);

            if (files.contractFiles != null) {
                for (contractFile of files.contractFiles) {
                    console.log(contractFile);
                    console.log(contractFile.id);

                    // insert contract object to db
                    var newContract = new Contract({
                        contractRequest: contractrequestid,
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
                        contractRequest: contractrequestid,
                        uploadDate: refDocFile.uploadDate,
                        file: refDocFile.id,
                        filename: refDocFile.filename
                    });

                    await newReferenceDocument.save();
                }
            }

            res.redirect('back');

        } catch (err) {
            console.log(err);
        }

    },

    setReviewedDocuments: async (req, res) => {
        try {

            console.log ("SET REVIEWED DOCUMENTS");
            const documentsattached = req.query.documentsattached;

            for (document of documentsattached) {

                if (document.documenttype == 'contract') {

                    if (document.isreviewed == 'true') {
                        await ContractVersion.findByIdAndUpdate(document.documentid, { $set: 
                            { 
                                isreviewed: true
                            }
                        }).exec();
                    } else if (document.isreviewed == 'false') {
                        await ContractVersion.findByIdAndUpdate(document.documentid, { $set: 
                            { 
                                isreviewed: false
                            }
                        }).exec();
                    }

                } else if (document.documenttype == 'refdoc') {

                    if (document.isreviewed == 'true') {
                        await ReferenceDocument.findByIdAndUpdate(document.documentid, { $set: 
                            { 
                                isreviewed: true
                            }
                        }).exec();
                    } else if (document.isreviewed == 'false') {
                        await ReferenceDocument.findByIdAndUpdate(document.documentid, { $set: 
                            { 
                                isreviewed: false
                            }
                        }).exec();
                    }
                }
            }

        } catch (err) {
            console.log(err);
        }
    },

    getContractVersions: async (req, res) => {
        try {
            const fileid = req.query.fileid;

            const contractversion = await ContractVersion.findOne({file: fileid})
                .exec();

            var contractversionslist = [];

            var isContract;

            if (contractversion != null) {
                contractversionslist = await ContractVersion.find({contract: contractversion.contract})
                    .populate({
                        path: 'contract'
                    })
                    .exec();

                isContract = true;
            } else {
                isContract = false
            }

            res.send({
                contractversionslist: contractversionslist,
                isContract: isContract
            });

        } catch (err) {
            console.log(err);
        }
    },

    viewFile: async (req, res) => {
        try {

            const cursor = gridfsBucketRequestDocuments.find({_id: mongoose.Types.ObjectId(req.params.fileid)});

            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                } else if (doc.contentType === 'application/pdf') {
                    // Read output to browser
                    const readstream = gridfsBucketRequestDocuments.openDownloadStream(doc._id);
                    readstream.pipe(res);
                } else {
                    res.send({
                        isPDF: false
                    });
                }
            });

        } catch (err) {
            console.log(err);
        }
    },

    downloadContractVersion: async (req, res) => {
        try {

            const cursor = gridfsBucketRequestDocuments.find({_id: mongoose.Types.ObjectId(req.params.fileid)});

            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                } else if (doc.contentType === 'application/pdf') {
                    // Read output to browser
                    const readstream = gridfsBucketRequestDocuments.openDownloadStream(doc._id);

                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename=${doc.filename}`);

                    readstream.pipe(res);
                } else {
                    res.send({
                        isPDF: false
                    });
                }
            });

        } catch (err) {
            console.log(err);
        }
    },

    compareRevisionHistory: async (req, res) => {
        try {

            const fileLeft = req.body.fileSelectedLeft;
            const fileRight = req.body.fileSelectedRight;

            // console.log(fileLeft);
            // console.log(fileRight);

            let contractversionleft;

            contractversionleft = await ContractVersion.findOne({ file: fileLeft }).exec();
            const contractversionright = await ContractVersion.findOne({ file: fileRight }).lean()
                .populate({
                    path: 'contract',
                    populate: {
                        path: 'contractRequest',
                        populate: {
                            path: 'contractType'
                        }
                    }
                })
                .exec();

            const contractversions = await ContractVersion.find({ contract: contractversionright.contract }).lean().exec();

            const templates = await Template.find({type: contractversionright.contract.contractRequest.contractType}).lean().exec();
            console.log(templates);

            let isTemplate = false;

            const cursorRight = await gridfsBucketRequestDocuments.find({_id: mongoose.Types.ObjectId(fileRight)});

            if (!contractversionleft) {
                console.log('it is template');
                isTemplate = true;
                contractversionleft = await Template.findOne({pdfFileId: fileLeft}).lean().exec();
            } else {
                console.log('it is contract');
                isTemplate = false;
            }

            let cursorLeft;

            if (isTemplate) {
                cursorLeft = await gridfsBucketTemplates.find({_id: mongoose.Types.ObjectId(fileLeft)});
            } else {
                cursorLeft = await gridfsBucketRequestDocuments.find({_id: mongoose.Types.ObjectId(fileLeft)});
            }

            let documentRight, documentLeft;

            if (await cursorRight.hasNext()) {
                documentRight = await cursorRight.next();
            }
            // console.log(documentRight);

            if (await cursorLeft.hasNext()) {
                documentLeft = await cursorLeft.next();
            }
            // console.log(documentLeft);

            const writableStream = fs.createWriteStream('./right_compare.pdf');
            const downStream = gridfsBucketRequestDocuments.openDownloadStream(documentRight._id);
            downStream.pipe(writableStream);
            console.log('right');

            downStream.on('end', function() {
                const writableStream2 = fs.createWriteStream('./left_compare.pdf');

                let downStream2;

                if (isTemplate) { // if template is selected
                    downStream2 = gridfsBucketTemplates.openDownloadStream(documentLeft._id);
                } else {
                    downStream2 = gridfsBucketRequestDocuments.openDownloadStream(documentLeft._id);
                }
                downStream2.pipe(writableStream2);
                console.log('left');

                downStream2.on('end', function(){
                    var identifier = comparisons.generateIdentifier();
    
                    comparisons.create({
                        identifier: identifier,
                        left: {
                            source: fs.readFileSync('./left_compare.pdf'),
                            fileType: 'pdf',
                        },
                        right: {
                            source: fs.readFileSync('./right_compare.pdf'),
                            fileType: 'pdf',
                        },
                        publiclyAccessible: true
                    }).then(function(comparison) {
                        console.log("Comparison created: %s", comparison);
                        // Generate a signed viewer URL to access the private comparison. The expiry
                        // time defaults to 30 minutes if the valid_until parameter is not provided.
                        const viewerURL = comparisons.signedViewerURL(comparison.identifier);
                        console.log("Viewer URL (expires in 30 mins): %s", viewerURL);
    
                        fs.unlink('left_compare.pdf', (err) => {
                            if (err) {
                                throw err;
                            }
                            console.log('left success');
                        });
                        
                        fs.unlink('right_compare.pdf', (err) => {
                            if (err) {
                                throw err;
                            }
                            console.log('right success');
                        });

                        res.render('revisionhistory', {
                            user_fullname: req.user.fullName,
                            user_role: req.user.roleName,
                            contractversions: contractversions,
                            templates: templates,
                            leftcontractversion: contractversionleft._id.toString(),
                            rightcontractversion: contractversionright._id.toString(),
                            draftable: viewerURL
                        });
                    });
                });

            });

        } catch (err) {
            console.log(err);
        }
    },

    getRevisionHistory: async (req, res) => { //staff
        try {

            // var path = req.path.split('/')[2];
            // console.log(path);

            const contractfileid = req.body.contractFileId;
            // console.log(contractfileid);

            const selectedcontractversion = await ContractVersion.findOne({ file: contractfileid }).lean()
                .populate({
                    path: 'contract',
                    populate: {
                        path: 'contractRequest',
                        populate: {
                            path: 'contractType'
                        }
                    }
                })
                .exec();
            // console.log(selectedcontractversion);

            const contract = await Contract.findById(selectedcontractversion.contract).exec();
            // console.log(contract);

            const contractversions = await ContractVersion.find({ contract: selectedcontractversion.contract }).lean().exec();
            // console.log(contractversions);

            const templates = await Template.find({ type: selectedcontractversion.contract.contractRequest.contractType}).lean().exec();
            console.log(templates);

            const latestcontractversion = await ContractVersion.findOne({ version: contract.latestversion, contract: contract}).exec();
            // console.log(latestcontractversion);

            if (contract.latestversion <= 1) {
                var versionbefore = contract.latestversion;
            } else {
                var versionbefore = contract.latestversion - 1;
            }

            const beforecontractversion = await ContractVersion.findOne({ version: versionbefore, contract: contract}).exec();
            // console.log(beforecontractversion);

            const cursorRight = await gridfsBucketRequestDocuments.find({_id: mongoose.Types.ObjectId(latestcontractversion.file)});

            const cursorLeft = await gridfsBucketRequestDocuments.find({_id: mongoose.Types.ObjectId(beforecontractversion.file)});

            let documentRight, documentLeft;

            if (await cursorRight.hasNext()) {
                documentRight = await cursorRight.next();
            }
            console.log(documentRight);

            if (await cursorLeft.hasNext()) {
                documentLeft = await cursorLeft.next();
            }
            console.log(documentLeft);

            const writableStream = fs.createWriteStream('./right_compare.pdf');
            const downStream = gridfsBucketRequestDocuments.openDownloadStream(documentRight._id);
            downStream.pipe(writableStream);
            console.log('right');

            downStream.on('end', function() {
                const writableStream2 = fs.createWriteStream('./left_compare.pdf');
                const downStream2 = gridfsBucketRequestDocuments.openDownloadStream(documentLeft._id);
                downStream2.pipe(writableStream2);
                console.log('left');

                downStream2.on('end', function(){
                    var identifier = comparisons.generateIdentifier();
    
                    comparisons.create({
                        identifier: identifier,
                        left: {
                            source: fs.readFileSync('./left_compare.pdf'),
                            fileType: 'pdf',
                        },
                        right: {
                            source: fs.readFileSync('./right_compare.pdf'),
                            fileType: 'pdf',
                        },
                        publiclyAccessible: true
                    }).then(function(comparison) {
                        console.log("Comparison created: %s", comparison);
                        // Generate a signed viewer URL to access the private comparison. The expiry
                        // time defaults to 30 minutes if the valid_until parameter is not provided.
                        const viewerURL = comparisons.signedViewerURL(comparison.identifier);
                        console.log("Viewer URL (expires in 30 mins): %s", viewerURL);
    
                        fs.unlink('left_compare.pdf', (err) => {
                            if (err) {
                                throw err;
                            }
                            console.log('left success');
                        });
                        
                        fs.unlink('right_compare.pdf', (err) => {
                            if (err) {
                                throw err;
                            }
                            console.log('right success');
                        });

                        res.render('revisionhistory', {
                            user_fullname:req.user.fullName,
                            user_role: req.user.roleName,
                            contractversions: contractversions,
                            templates: templates,
                            leftcontractversion: beforecontractversion._id.toString(),
                            rightcontractversion: latestcontractversion._id.toString(),
                            draftable: viewerURL
                        });
                    });
                });

            });    

        } catch (err) {
            console.log(err);
        }
    },

    sendMessage: async (req, res) => {
       
        try {
            var message = req.query.message;
            //var sender = req.body.id;
            //var name = req.user.fullName;
            //var requestid = req.query.requestid;
            var conversationid = req.query.conversationid;
            var sender = req.query.sender;
            //var user2 = req.query.requesterid;

            console.log(sender + ": " + message + " in conversation " + conversationid);

            // insert message to db
            let newMessage = new Message({
                conversationId: conversationid,
                sender: sender,
                content: message,
                date: Date.now()
            }); 

            await newMessage.save();
          
        }catch(err) {
			console.log(err);
		}
        console.log("Message was sent succesfully.");
    },

    postAddThirdParty: async (req, res) => { 

        try{
            var emailInput = req.body.email;
            var name = req.body.name;
            var requestID = req.body.contractRequestId;
            //const thirdpartyrep = await ThirdParty.findOne({email: emailInput}).exec();

            var thirdparty = new ThirdParty({
                fullName: name,
                email: emailInput,
            });
            await thirdparty.save();

            const thirdpartyrep = await ThirdParty.findOne({email: emailInput}).lean()
            .exec();

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
                to: "capstone.samantha@gmail.com", //change to user.email when done testing
                subject: "Third Party Negotiation",
                text: "Hi! There is a contract request for approval that needs negotiation with the third party representative. The OULC would like to have a discussion with you regarding a contract. Godbless!"
            }

            transporter.sendMail (options, function (err, info) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Sent: " + info.response);
            })

            res.redirect('back');

        }catch (err) {
            console.log(err);
        }
    },

}

module.exports = specificrequestcontroller;