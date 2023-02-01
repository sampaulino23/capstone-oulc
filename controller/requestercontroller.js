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
const StagingContractVersion = require('../models/StagingContractVersion.js');
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
const VersionNote = require('../models/VersionNote.js');
const NegotiationFile = require('../models/NegotiationFile.js');
const Notification = require('../models/Notification.js');
const { type } = require('os');

const conn = mongoose.createConnection(url);

// Init gridfsBucket
let gridfsBucket, gridfsBucketRequestDocuments;

conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'negotiation'
    });
    gridfsBucketRequestDocuments = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'requestdocuments'
    });
});

const requestercontroller = {

    getHome: async (req, res) => {
        try {

            var violationcount = 0;

            const contractrequests = await ContractRequest.find({requester: req.user._id}).lean().exec();
            const notifications = await Notification.find({}).lean().exec(); //notifs model (initial only)

            //For revision count - notifs/alerts
            const forrevisionrequests = await ContractRequest.find({requester: req.user._id, statusCounter: 6}).lean().exec();
            var forrevisioncount;
            for (forrevisioncount = 0; forrevisioncount < forrevisionrequests.length; forrevisioncount++){
                forrevisioncount++;
            }
            //

            for (i = 0; i < contractrequests.length; i++) {
                // To calculate the time difference of two dates
                var Difference_In_Time = contractrequests[i].effectivityStartDate.getTime() - contractrequests[i].requestDate.getTime();
                // To calculate the no. of days between two dates
                var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                if (Difference_In_Days < 0){
                    Difference_In_Days = Math.floor(Difference_In_Days);
                }
                else {
                    Difference_In_Days = Math.ceil(Difference_In_Days);
                }

                if (Difference_In_Days < 7) {
                    violationcount++
                }
            }
           
            res.render('requesterhome', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName,
                violationcount: violationcount,
                notifications: notifications,
                forrevisioncount: forrevisioncount
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
            var activeCompanies = [];
        
            const contractrequests = await ContractRequest.find({
                $and: [
                    {effectivityStartDate: { $lte: today}},
                    {effectivityEndDate: { $gte: today}},
                    {contractType: "63d785ba00692399c6c91c8e"}, //needs to be updated if db is updated
                    {statusCounter: "7"}
                ]
            }).lean().sort({}).exec();
            const contracttypes = await ContractType.find({}).lean().sort({ code:1 }).exec();

            // console.log(contractrequests);

            //push company name to array
            for (i = 0; i < contractrequests.length; i++) {
                activeCompanies.push(contractrequests[i].contractingParty);
            }

            //convert company names to a format where first letter is uppercase and remaining are lowercase
            activeCompanies = activeCompanies.map(function(v) {
                return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
            });

            //remove duplicates
            var uniqueActiveCompanies = [...new Set(activeCompanies)]
            uniqueActiveCompanies.sort();

            res.render('createrequest', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName,
                department: user.department.name,
                requestdate: today,
                contracttypes: contracttypes,
                activeCompanies: uniqueActiveCompanies
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

            console.log("SL " + req.body.signatorylevel);
            console.log("INSIDE CREATE REQUEST");

            function makeid(length) {
                var result           = '';
                var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
                var charactersLength = characters.length;
                for ( var i = 0; i < length; i++ ) {
                  result += characters.charAt(Math.floor(Math.random() * charactersLength));
               }
               return result;
            }

            const files = req.files;

            // const users = await User.find({roleName: "Staff", isActive: true}).lean()
            //     .exec();

            const users = await User.find({ $or : [{roleName: "Staff"}, {_id: "6318a6b4c0119ed0b4b6bb82"}], isActive: true}).lean()
            .exec();

            const daterange = req.body.daterange;

            let startDate = new Date(daterange.substring(0, 10));
            let endDate = new Date(daterange.substring(13));

            const datenow = new Date();

            var month = ('0' + (datenow.getMonth() + 1)).slice(-2);
            var day = ('0' + (datenow.getDate())).slice(-2);
            var year = datenow.getFullYear();

            var base32 = makeid(4);

            const contracttype = await ContractType.findById(req.body.documenttype).exec();

            var trackingNumber = '' + year + month + day + base32 + '-' + contracttype.code;

            var contractingparty;

            if (contracttype.code == "B") {
                contractingparty = req.body.contractingpartyojt;
                // console.log ("IF: " + contractingparty);
            }
            else {
                contractingparty = req.body.contractingparty;
                // console.log ("ELSE: " + contractingparty);
            }

            var contractrequest = new ContractRequest({
                requester: req.user._id,
                contractType: req.body.documenttype, 
                trackingNumber: trackingNumber,
                subjectMatter: req.body.subject,
                requestDate: req.body.requestdate,
                requestTitle: req.body.documenttitle,
                effectivityStartDate: startDate,
                effectivityEndDate: endDate,
                contactPerson: req.body.contactperson,
                contactNum: req.body.contactno,
                reviewType: req.body.reviewtype,
                signatoryLevel: req.body.signatorylevel, 
                signatoryName: req.body.signatoryname,
                templateUsed: req.body.templateused,
                sectionChangeNotes: req.body.sectionchanges, 
                thirdPartyRepresentativeName: req.body.thirdpartyname,
                thirdPartyRepresentativeEmail: req.body.thirdpartyemail,
                contractingParty: contractingparty,
                amountInvolved: req.body.amount,
                assignedAttorney: "6318a6b4c0119ed0b4b6bb82" //Initial only
            });

            if (contractrequest.amountInvolved == null) {
                contractrequest.amountInvolved = 0;
            }

            await contractrequest.save(async function(){
                console.log("INSIDE CREATE REQUEST SAVE");
                // console.log(contractrequest);
                if (files.contractFiles != null) {
                    for (contractFile of files.contractFiles) {
                        // console.log(contractFile);
                        // console.log(contractFile.id);
    
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
                    members: membersList,
                    type: "conversation"
                });
                await conversation.save();
                res.redirect('/requester/requestreceipt/' + contractrequest._id);
            });

        } catch (err) {
            console.log(err);
        }
    },

    getRequestReceipt: async (req, res) => {
        try {

            var path = req.path.split('/')[2];

            console.log(path);

            const contractrequest = await ContractRequest.findOne({_id : path}).lean()
            .populate({
                path: 'requester',
                populate: {
                    path: 'department'
                  } 
            })
            .populate({
                path: 'contractType'
            }).exec();

            console.log (contractrequest);
            res.render('requestreceipt', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName,
                contractrequest: contractrequest
            });

        } catch (err) {
            console.log(err);
        }
    },

    deleteStagingContractVersion: async (req, res) => {
        try {

            const stagingcontractversionid = req.body.deleteStagingContractVersion;
            const fileid = req.params.id;

            // delete staging contract version object
            const stagingContractVersion = await StagingContractVersion.findByIdAndDelete(stagingcontractversionid).exec();

            await VersionNote.findByIdAndDelete(stagingContractVersion.versionNote).exec();

            const cursor = await gridfsBucketRequestDocuments.find({_id: mongoose.Types.ObjectId(fileid)}, {limit: 1});
            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                } else {
                    gridfsBucketRequestDocuments.delete(doc._id);
                }
            });

            res.redirect('back');

        } catch (err) {
            console.log(err);
        }
    },

    checkStagingContractVersion: async (req, res) => {
        try {

            const fileid = req.query.fileid;

            const contractVersion = await ContractVersion.findOne({file: fileid}).exec();

            const stagingContractVersion = await StagingContractVersion.findOne({contract: contractVersion.contract}).exec();

            if (stagingContractVersion) { // if there is a staging contract version
                
                res.send({
                    hasStaging: true,
                    contractVersion: contractVersion._id
                });
            } else { // if there is no staging contract version

                res.send({
                    hasStaging: false,
                    contractVersion: contractVersion._id
                })                
            }


        } catch (err) {
            console.log(err);
        }
    },

    uploadNewVersion: async (req, res) => {
        try {

            const file = req.file;

            const contractVersionId = req.body.contractVersionIdForNewVersion;

            const contractVersion = await ContractVersion.findById(contractVersionId).exec();

            const checkStagingContractVersion = await StagingContractVersion.findOne({contract: contractVersion.contract}).exec();

            if (file != null) {

                if (checkStagingContractVersion) { // if there is a staging contract version

                    // replace existing staging contract version
                    var versionNoteBeta = {

                    };

                    if (req.body.oulcComments) {
                        versionNoteBeta.oulcComments = req.body.oulcComments;
                    }
                    if (req.body.thirdPartyResponse) {
                        versionNoteBeta.thirdPartyResponse = req.body.thirdPartyResponse;
                    }
                    if (req.body.requestingPartyRemarks) {
                        versionNoteBeta.requestingPartyRemarks = req.body.requestingPartyRemarks;
                    }

                    var newVersionNote = new VersionNote(versionNoteBeta);

                    var newVersionNoteUpdated = {
                        oulcComments: newVersionNote.oulcComments,
                        thirdPartyResponse: newVersionNote.thirdPartyResponse,
                        requestingPartyRemarks: newVersionNote.requestingPartyRemarks
                    };

                    const existingVersionNote = await VersionNote.findOneAndReplace({_id: checkStagingContractVersion.versionNote}, newVersionNoteUpdated).exec();

                    let stagingContractVersion = {
                        contract: contractVersion.contract,
                        uploadDate: file.uploadDate,
                        file: file.id,
                        filename: file.filename,
                        version: parseInt(contractVersion.version) + 1,
                        versionNote: existingVersionNote._id
                    };

                    await StagingContractVersion.findOneAndReplace({_id: checkStagingContractVersion._id}, stagingContractVersion).exec();

                    // delete replaced Gridfs file
                    const cursor = await gridfsBucketRequestDocuments.find({_id: mongoose.Types.ObjectId(checkStagingContractVersion.file)}, {limit: 1});
                    cursor.forEach((doc, err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            gridfsBucketRequestDocuments.delete(doc._id);
                        }
                    });

                } else { // if there is no staging contract version
                    
                    // create new staging contract version
                    var versionNoteBeta = {

                    };

                    if (req.body.oulcComments) {
                        versionNoteBeta.oulcComments = req.body.oulcComments;
                    }
                    if (req.body.thirdPartyResponse) {
                        versionNoteBeta.thirdPartyResponse = req.body.thirdPartyResponse;
                    }
                    if (req.body.requestingPartyRemarks) {
                        versionNoteBeta.requestingPartyRemarks = req.body.requestingPartyRemarks;
                    }

                    var versionNote = new VersionNote(versionNoteBeta);
    
                    const newVersionNote = await versionNote.save();
        
                    await versionNote.save(async () => {
    
                        let stagingContractVersion = new StagingContractVersion({
                            contract: contractVersion.contract,
                            uploadDate: file.uploadDate,
                            file: file.id,
                            filename: file.filename,
                            version: parseInt(contractVersion.version) + 1,
                            versionNote: newVersionNote._id
                        });
    
                        await stagingContractVersion.save();
                    });
                }
            }

            res.redirect('back');

        } catch (err) {
            console.log(err);
        }
    },

    submitRevision: async (req, res) => {
        try {
            const contractRequestId = req.body.contractVersionIdForSubmitRevision;

            const contracts = await Contract.find({contractRequest: contractRequestId}).exec();

            var stagingcontractversions = [];

            for (contract of contracts) {
                const stagingcontractversion = await StagingContractVersion.findOne({contract: contract})
                    .lean()
                    .populate({
                        path: 'versionNote'
                    })
                    .exec();

                if (stagingcontractversion) {
                    stagingcontractversions.push(stagingcontractversion);
                }
            }

            for (stagingcontractversion of stagingcontractversions) {
                let contractVersion = new ContractVersion({
                    contract: stagingcontractversion.contract,
                    version: stagingcontractversion.version,
                    uploadDate: stagingcontractversion.uploadDate,
                    file: stagingcontractversion.file,
                    filename: stagingcontractversion.filename,
                    isreviewed: false,
                    versionNote: stagingcontractversion.versionNote
                });

                await contractVersion.save();

                await StagingContractVersion.findByIdAndDelete(stagingcontractversion._id).exec();

                // set contract's latest version field
                await Contract.findByIdAndUpdate(stagingcontractversion.contract, {$set: { latestversion: stagingcontractversion.version}}).exec();

                // change statusCounter of contract request
                const contractRequest = await ContractRequest.findById(contractRequestId).exec();

                if (contractRequest.statusCounter == 2) {
                    await ContractRequest.findByIdAndUpdate(contractRequestId, {$set: {statusCounter: 3}}).exec();
                } else if (contractRequest.statusCounter == 5) {
                    await ContractRequest.findByIdAndUpdate(contractRequestId, {$set: {statusCounter: 6}}).exec();
                }
            }

            res.redirect('back');

        } catch (err) {
            console.log(err);
        }
    },

    getRepository: async (req, res) => {
        try {

            const user = req.user;

            const contracttypes = await ContractType.find({}).lean().exec();

            const contractrequests = await ContractRequest.find({requester: user._id}).select('_id').exec();

            console.log(contractrequests);

            const repositoryFiles = await RepositoryFile.find({requestid: { "$in": contractrequests}}).lean()
            .populate({
                path: 'requestid',
                populate: {
                    path: 'contractType'
                    } 
            })
            .sort({uploadDate: 1})
            .exec();
    
            res.render('repository', {
                user_fullname:req.user.fullName,
                user_role: req.user.roleName,
                contracttypes: contracttypes,
                repositoryFiles: repositoryFiles
            });

        } catch (err) {
            console.log(err);
        }
    },

    postDeleteNegotiationFile: async (req, res) => {
        try {

            const negotiationfileid = req.body.deleteNegotiationFile;

            // delete template object
            const negotiationFile = await NegotiationFile.findByIdAndDelete(negotiationfileid).exec();

            if (negotiationFile) {

                // delete pdf file in gridfs
                const cursor2 = await gridfsBucket.find({_id: mongoose.Types.ObjectId(negotiationFile.file)}, {limit: 1});
                cursor2.forEach((doc, err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        gridfsBucket.delete(doc._id);
                    }
                });
            }

            res.redirect('back');

        } catch (err) {
            console.log(err);
        }
    },

    getDownloadNegotiationFile: async (req, res) => {
        try {
            const fileid = req.params.fileid;

            const cursor = gridfsBucket.find({_id: mongoose.Types.ObjectId(fileid)});
            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                }
                const downStream = gridfsBucket.openDownloadStream(doc._id);

                res.setHeader('Content-Type', doc.contentType);
                res.setHeader('Content-Disposition', `attachment; filename=${doc.filename}`);

                downStream.pipe(res);
            });

        } catch (err) {
            console.log(err);
        } 
    },

    getViolationReport: async (req, res) => {
        try {
            var months = [{ name: "January", violation: 0 }, { name: "Febuary", violation: 0 }, { name: "March", violation: 0 }, { name: "April", violation: 0 }, { name: "May", violation: 0 }, { name: "June", violation: 0 },
            { name: "July", violation: 0 }, { name: "August", violation: 0 }, { name: "September", violation: 0 }, { name: "October", violation: 0 }, { name: "November", violation: 0 }, { name: "December", violation: 0 }];

            const contractrequests = await ContractRequest.find({requester: req.user._id}).lean().exec();

            function dateDiffInDays(a, b) {
                const _MS_PER_DAY = 1000 * 60 * 60 * 24;
                // Discard the time and time-zone information.
                const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
                const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
              
                return Math.floor((utc2 - utc1) / _MS_PER_DAY);
            }

            for (i = 0; i < contractrequests.length; i++) {
                var Difference_In_Days_Start = dateDiffInDays(new Date(contractrequests[i].requestDate), new Date(contractrequests[i].effectivityStartDate));

                if (Difference_In_Days_Start < 7) {
                    var month = contractrequests[i].requestDate.toLocaleString('default', { month: 'numeric' });
                    if (month == 1) {
                        months[0].violation++;
                    }
                    else if (month == 2) {
                        months[1].violation++;
                    }
                    else if (month == 3) {
                        months[2].violation++;
                    }
                    else if (month == 4) {
                        months[3].violation++;
                    }
                    else if (month == 5) {
                        months[4].violation++;
                    }
                    else if (month == 6) {
                        months[5].violation++;
                    }
                    else if (month == 7) {
                        months[6].violation++;
                    }
                    else if (month == 8) {
                        months[7].violation++;
                    }
                    else if (month == 9) {
                        months[8].violation++;
                    }
                    else if (month == 10) {
                        months[9].violation++;
                    }
                    else if (month == 11) {
                        months[10].violation++;
                    }
                    else if (month == 12) {
                        months[11].violation++;
                    }
                }
            }

            res.render('violationreport', {
                user_fullname:req.user.fullName,
                user_role: req.user.roleName,
                months: months
            });

        } catch (err) {
            console.log(err);
        }
    },

    getIssueLog: async (req, res) => {
        try {

            //const issues = await Issue.find({}).lean().sort({date: 1}).exec();
            var issues = [], b = {requestNumber: 20, summary: "SAMPLE1"}, c = {requestNumber: 30, summary: "SAMPLE2"};
            issues.push(b);
            issues.push(c);
            
            res.render('issuelog', {
                user_fullname:req.user.fullName,
                user_role: req.user.roleName,
                issues: issues
                //faqs: faqs
                // contracttypes: contracttypes,
                // templates: templates
            });

        } catch (err) {
            console.log(err);
        }

    }
}

module.exports = requestercontroller;