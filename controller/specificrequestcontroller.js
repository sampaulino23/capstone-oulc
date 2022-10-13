const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const User = require('../models/User.js');
const ContractRequest = require('../models/ContractRequest.js');
const Contract = require('../models/Contract.js');
const ContractVersion = require('../models/ContractVersion.js');
const VersionNote = require('../models/VersionNote.js');
const ReferenceDocument = require('../models/ReferenceDocument.js');
const Feedback = require('../models/Feedback.js');
const Message = require('../models/Message.js');
const ContractType = require('../models/ContractType.js');
const Status = require('../models/Status.js');
const Role = require('../models/Role.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');
const RepositoryFile = require('../models/RepositoryFile.js');
const Conversation = require('../models/Conversation.js');

const fs = require('fs');

    const conn = mongoose.createConnection(url);

// Init gridfsBucket
let gridfsBucket, gridfsBucketRequestDocuments;

conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'repository'
    });
    gridfsBucketRequestDocuments = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'requestdocuments'
    });
});

var client = require('@draftable/compare-api').client('erkpQU-test', 'bbbe3883ab6c7505da79f85bd60bfdaf');
var comparisons = client.comparisons;

const specificrequestcontroller = {

    getStaffSpecificRequest: async (req, res) => { //staff
        try {

            var path = req.path.split('/')[2];

            var userid = req.user._id;

            // console.log(path);

            const conversation = await Conversation.findOne({contractRequest: path}).lean().exec();

            //console.log(conversation);

            const messages = await Message.find({}).lean().exec();

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

            // for (i = 0; i < contractrequest.length; i++) {
            //     const statusList = await Status.findOne({counter: contractrequest.statusCounter}).exec();
            //     contractrequest[i].status = statusList.statusStaff;

            //     // To calculate the time difference of two dates
            //     var Difference_In_Time = contractrequest[i].effectivityEndDate.getTime() - contractrequest[i].effectivityStartDate.getTime();
                      
            //     // To calculate the no. of days between two dates
            //     var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

            //     if (Difference_In_Days < 0){
            //         Difference_In_Days = Math.floor(Difference_In_Days);
            //     }
            //     else {
            //         Difference_In_Days = Math.ceil(Difference_In_Days);
            //     }

            //     // To set number of days gap in contract request
            //     contractrequest[i].daysDuration = Difference_In_Days;
            // }

            const statusList = await Status.findOne({counter: contractrequest.statusCounter}).exec();

            if (req.user.roleName == "Staff") {
                contractrequest.status = statusList.statusStaff;
            }
            else if (req.user.roleName == "Attorney") {
                contractrequest.status = statusList.statusAttorney;
            }
            

            // To calculate the time difference of two dates
            var Difference_In_Time = contractrequest.effectivityEndDate.getTime() - contractrequest.effectivityStartDate.getTime();
                    
            // To calculate the no. of days between two dates
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

            if (Difference_In_Days < 0){
                Difference_In_Days = Math.floor(Difference_In_Days);
            }
            else {
                Difference_In_Days = Math.ceil(Difference_In_Days);
            }

            // To set number of days gap in contract request
            contractrequest.daysDuration = Difference_In_Days;

            const feedback = await Feedback.find({contractRequest : path}).lean()
                .populate({
                    path: 'user_id'
                })
                .sort({date: -1})
                .exec();

            const contracts = await Contract.find({contractRequest: path}).lean().exec();

            var latestversioncontracts = [];
            var contractversions = [];

            for (contract of contracts) {
                const latestversioncontract = await ContractVersion.findOne({contract: contract._id, version: contract.latestversion})
                    .lean()
                    .populate({
                        path: 'versionNote'
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
                }
            }

            const referencedocuments = await ReferenceDocument.find({contractRequest: path}).lean().exec();

            const roleAttorney = await Role.findOne({name: 'Attorney'}).exec();

            const attorneys = await User.find({role: roleAttorney,_id: { $ne: userid }}).lean().exec();

            res.render('specificrequest', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName,
                contractrequest: contractrequest,
                feedback: feedback,
                latestversioncontracts: latestversioncontracts,
                referencedocuments: referencedocuments,
                contractversions: contractversions,
                attorneys: attorneys,
                conversation: conversation,
                messages: messages
            });

        } catch (err) {
            console.log(err);
        }
    },

    forLegalReview: async (req, res) => { //staff
        try {
            console.log("Inside For Legal Review");
            var contractid = req.query.contractid;
            await ContractRequest.findOneAndUpdate({ _id: contractid }, { $set: { statusCounter: 4} });

        } catch (err) {
            console.log(err);
        }
    },

    postForRevisionStaff: async (req, res) => { //staff
        try {

            var contractRequestId = req.body.addStaffFeedbackID;

            var feedback = new Feedback({
                contractRequest: req.body.addStaffFeedbackID,
                user_id: req.user._id,
                content: req.body.addStaffFeedback
            });

            console.log("Inside For Revision Office Staff");

            await ContractRequest.findOneAndUpdate({ _id: contractRequestId }, { $set: { statusCounter: 2 } });
            await feedback.save();
            // var feedback = req.body.addStaffFeedback;
            // var id = req.body.addStaffFeedbackID;

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

            await ContractRequest.findOneAndUpdate({ _id: contractRequestId }, { $set: { statusCounter: 5 } });
            await feedback.save();
            // var feedback = req.body.addStaffFeedback;
            // var id = req.body.addStaffFeedbackID;

            res.redirect('back');
        } catch (err) {
            console.log(err);
        }
    },

    markAsCleared: async (req, res) => { //attorney
        try {
            console.log("Inside Mark as Cleared");
            var contractid = req.query.contractid;
            await ContractRequest.findOneAndUpdate({ _id: contractid }, { $set: { statusCounter: 7} });

        } catch (err) {
            console.log(err);
        }
    },

    routeToAnotherAttorney: async (req, res) => {
        try {
            const contractrequestid = req.query.contractrequestid;
            const routedattorney = req.query.routedattorney;

            await ContractRequest.findOneAndUpdate({ _id: contractrequestid} , { $set: { assignedAttorney: routedattorney } }).exec();

            // Reset is-reviewed to false for all latest contracts and reference documents attached
            const contracts = await Contract.find({ contractRequest: contractrequestid }).exec();

            for (contract of contracts) {
                await ContractVersion.findOneAndUpdate({ contract: contract._id,  version: contract.latestversion}, { $set: { isreviewed: false } }).exec();
            }

            const referencedocuments = await ReferenceDocument.find({ contractRequest: contractrequestid }).exec();

            for (referencedocument of referencedocuments) {
                await ReferenceDocument.findByIdAndUpdate(referencedocument._id, { $set: { isreviewed: false } }).exec();
            }

        } catch (err) {
            console.log(err);
        }
    },

    postUploadRepositoryFile: async (req, res) => { // requesting office
        try {

            console.log(req.file);
            const filename = req.file.filename;
            const file_id = mongoose.Types.ObjectId(req.file.id);
            const fileuploaddate = req.file.uploadDate;
            const requestid = req.body.uploadRepositoryFileID;

            const newRepositoryFile = new RepositoryFile({
                name: filename,
                requestid: mongoose.Types.ObjectId(requestid),
                uploadDate: fileuploaddate,
                file: file_id
            });

            newRepositoryFile.save();

            console.log ("INSIDE UPLOAD SIGNED CONTRACT");
            console.log (newRepositoryFile);

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

    getRevisionHistory: async (req, res) => { //staff
        try {

            // var path = req.path.split('/')[2];

            // console.log(path);

            const contractfileid = req.body.contractFileId;
            // console.log(contractfileid);

            const selectedcontractversion = await ContractVersion.findOne({ file: contractfileid }).exec();
            // console.log(selectedcontractversion);

            const contract = await Contract.findById(selectedcontractversion.contract).exec();
            // console.log(contract);

            const contractversions = await ContractVersion.find({ contract: selectedcontractversion.contract }).lean().exec();
            // console.log(contractversions);

            const latestcontractversion = await ContractVersion.findOne({ version: contract.latestversion, contract: contract}).exec();
            // console.log(latestcontractversion);

            if (contract.latestversion <= 1) {
                var versionbefore = contract.latestversion;
            } else {
                var versionbefore = contract.latestversion - 1;
            }

            const beforecontractversion = await ContractVersion.findOne({ version: versionbefore, contract: contract}).exec();
            // console.log(beforecontractversion);

            // code below is old solution
            // const cursor = await gridfsBucketRequestDocuments.find({_id: {"$in": [mongoose.Types.ObjectId(beforecontractversion.file), mongoose.Types.ObjectId(latestcontractversion.file)]}});

            const cursorRight = await gridfsBucketRequestDocuments.find({_id: mongoose.Types.ObjectId(beforecontractversion.file)});

            const cursorLeft = await gridfsBucketRequestDocuments.find({_id: mongoose.Types.ObjectId(latestcontractversion.file)});

            let documentRight, documentLeft;

            if (await cursorRight.hasNext()) {
                documentRight = await cursorRight.next();
            }
            console.log(documentRight);

            if (await cursorLeft.hasNext()) {
                documentLeft = await cursorLeft.next();
            }
            console.log(documentLeft);

            // code below is for bothdocuments implementation
            // const bothdocuments = await cursor.toArray();

            // for (document of bothdocuments) {
            //     if (beforecontractversion.file.toString() == document._id.toString()) {
            //         const writableStream = fs.createWriteStream('./right_compare.pdf');
            //         const downStream = gridfsBucketRequestDocuments.openDownloadStream(document._id);
            //         downStream.pipe(writableStream);

            //         console.log('right');
            //     } else if (latestcontractversion.file.toString() == document._id.toString()) {
            //         const writableStream = fs.createWriteStream('./left_compare.pdf');
            //         const downStream = gridfsBucketRequestDocuments.openDownloadStream(document._id);
            //         downStream.pipe(writableStream);

            //         console.log('left');
            //     }
            // }

            // code belows in the optimized implementation
            // const bothdocuments = await cursor.toArray();

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
                            leftcontractversion: latestcontractversion._id.toString(),
                            rightcontractversion: beforecontractversion._id.toString(),
                            draftable: viewerURL
                        });
                    });
                });

            });

            // code below is the second solution (un-optimized and buggy)
            // var counter = 0;

            // cursor.forEach((doc, err) => {
            //     if (err) {
            //         console.log(err);
            //     } else if (doc.contentType === 'application/pdf') {
            //         // console.log(doc);
            //         // console.log('found');

            //         counter++;
            //         // console.log(counter);

            //         if (beforecontractversion.file.toString() == doc._id.toString()) {
            //             const writableStream = fs.createWriteStream('./right_compare.pdf');
            //             const downStream = gridfsBucketRequestDocuments.openDownloadStream(doc._id);
            //             downStream.pipe(writableStream);

            //             console.log('right');

            //             if (counter == 2) {
            //                 writableStream.on('close', function(){
            //                     var identifier = comparisons.generateIdentifier();
    
            //                     comparisons.create({
            //                         identifier: identifier,
            //                         left: {
            //                             source: fs.readFileSync('./left_compare.pdf'),
            //                             fileType: 'pdf',
            //                         },
            //                         right: {
            //                             source: fs.readFileSync('./right_compare.pdf'),
            //                             fileType: 'pdf',
            //                         },
            //                         publiclyAccessible: true
            //                     }).then(function(comparison) {
            //                         console.log("Comparison created: %s", comparison);
            //                         // Generate a signed viewer URL to access the private comparison. The expiry
            //                         // time defaults to 30 minutes if the valid_until parameter is not provided.
            //                         const viewerURL = comparisons.signedViewerURL(comparison.identifier);
            //                         console.log("Viewer URL (expires in 30 mins): %s", viewerURL);
                    
            //                         fs.unlink('left_compare.pdf', (err) => {
            //                             if (err) {
            //                                 throw err;
            //                             }
            //                         });
                                    
            //                         fs.unlink('right_compare.pdf', (err) => {
            //                             if (err) {
            //                                 throw err;
            //                             }
            //                         });

            //                         res.render('revisionhistory', {
            //                             user_fullname:req.user.fullName,
            //                             user_role: req.user.roleName,
            //                             contractversions: contractversions,
            //                             leftcontractversion: latestcontractversion._id.toString(),
            //                             rightcontractversion: beforecontractversion._id.toString(),
            //                             draftable: viewerURL
            //                         });
            //                     });
            //                 });
            //             }
            //         } else if (latestcontractversion.file.toString() == doc._id.toString()) {
            //             const writableStream = fs.createWriteStream('./left_compare.pdf');
            //             const downStream = gridfsBucketRequestDocuments.openDownloadStream(doc._id);
            //             downStream.pipe(writableStream);

            //             console.log('left');

            //             if (counter == 2) {
            //                 writableStream.on('close', function(){
            //                     var identifier = comparisons.generateIdentifier();
    
            //                     comparisons.create({
            //                         identifier: identifier,
            //                         left: {
            //                             source: fs.readFileSync('./left_compare.pdf'),
            //                             fileType: 'pdf',
            //                         },
            //                         right: {
            //                             source: fs.readFileSync('./right_compare.pdf'),
            //                             fileType: 'pdf',
            //                         },
            //                         publiclyAccessible: true
            //                     }).then(function(comparison) {
            //                         console.log("Comparison created: %s", comparison);
            //                         // Generate a signed viewer URL to access the private comparison. The expiry
            //                         // time defaults to 30 minutes if the valid_until parameter is not provided.
            //                         const viewerURL = comparisons.signedViewerURL(comparison.identifier);
            //                         console.log("Viewer URL (expires in 30 mins): %s", viewerURL);
                    
            //                         fs.unlink('left_compare.pdf', (err) => {
            //                             if (err) {
            //                                 throw err;
            //                             }
            //                         });

            //                         fs.unlink('right_compare.pdf', (err) => {
            //                             if (err) {
            //                                 throw err;
            //                             }
            //                         });

            //                         res.render('revisionhistory', {
            //                             user_fullname:req.user.fullName,
            //                             user_role: req.user.roleName,
            //                             contractversions: contractversions,
            //                             leftcontractversion: latestcontractversion._id.toString(),
            //                             rightcontractversion: beforecontractversion._id.toString(),
            //                             draftable: viewerURL
            //                         });
            //                     });
            //                 });
            //             }
            //         }
            //     }
            // });

            // code below deletes comparisons
            // comparisons.getAll().then(function(oldest_comparisons) {
            //     console.log("Deleting oldest 10 comparisons ...");

            //     console.log(oldest_comparisons.length);

            //     const deleteStartIndex = Math.max(0, oldest_comparisons.length - 10);
            
            //     for (let i = deleteStartIndex; i < oldest_comparisons.length; ++i) {
            //         const identifier = oldest_comparisons[i].identifier;
            //         comparisons.destroy(identifier).then(function() {
            //             console.log("Comparison '%s' deleted.", identifier);
            //         });
            //     }
            // });

            // code below is the first solution for foundation
            // var identifier = comparisons.generateIdentifier();

            // comparisons.create({
            //     identifier: identifier,
            //     left: {
            //         source: fs.readFileSync('./left_compare.pdf'),
            //         fileType: 'pdf',
            //     },
            //     right: {
            //         source: fs.readFileSync('./right_compare.pdf'),
            //         fileType: 'pdf',
            //     },
            //     publiclyAccessible: true
            // }).then(function(comparison) {
            //     console.log("Comparison created: %s", comparison);
            //     // Generate a signed viewer URL to access the private comparison. The expiry
            //     // time defaults to 30 minutes if the valid_until parameter is not provided.
            //     const viewerURL = comparisons.signedViewerURL(comparison.identifier);
            //     console.log("Viewer URL (expires in 30 mins): %s", viewerURL);

            //     res.render('revisionhistory', {
            //         user_fullname:req.user.fullName,
            //         user_role: req.user.roleName,
            //         contractversions: contractversions,
            //         draftable: viewerURL
            //     });
            // });
            

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
            var user1 = req.user._id;
            //var user2 = req.query.requesterid;

            //console.log(requestid + " by " + user1);
            //console.log(name + ": " + message);
            console.log(user1 + ": " + message + " in conversation " + conversationid);

            // insert message to db
            let newMessage = new Message({
                conversationId: conversationid,
                sender: user1,
                content: message
            }); 

            /*let newConversation = new Conversation({
                contractRequest: requestid,
                members: [user1, user2]
            }); */

            await newMessage.save();
            //await newConversation.save();
          
        }catch(err) {
			console.log(err);
		}
        console.log("Message was sent succesfully.");
    },

}

module.exports = specificrequestcontroller;