const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const User = require('../models/User.js');
const ContractRequest = require('../models/ContractRequest.js');
const Feedback = require('../models/Feedback.js');
const ContractType = require('../models/ContractType.js');
const Status = require('../models/Status.js');
const Role = require('../models/Role.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');
const Repository = require('../models/Repository.js');

// Connecting mongoose to our database 
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Mongo DB connected!'))
    .catch(err => console.log(err));


    const conn = mongoose.createConnection(url);

// Init gridfsBucket
let gridfsBucket;

conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'repository'
    });
});

const specificrequestcontroller = {

    getStaffSpecificRequest: async (req, res) => { //staff
        try {

            var path = req.path.split('/')[2];

            // console.log(path);

            const contractrequest = await ContractRequest.find({_id : path}).lean()
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

            for (i = 0; i < contractrequest.length; i++) {
                const statusList = await Status.findOne({counter: contractrequest[i].statusCounter}).exec();
                contractrequest[i].status = statusList.statusStaff;

                // To calculate the time difference of two dates
                var Difference_In_Time = contractrequest[i].effectivityEndDate.getTime() - contractrequest[i].effectivityStartDate.getTime();
                      
                // To calculate the no. of days between two dates
                var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                if (Difference_In_Days < 0){
                    Difference_In_Days = Math.floor(Difference_In_Days);
                }
                else {
                    Difference_In_Days = Math.ceil(Difference_In_Days);
                }

                // To set number of days gap in contract request
                contractrequest[i].daysDuration = Difference_In_Days;
            }

            const feedback = await Feedback.find({contractRequest : path}).lean()
                .populate({
                    path: 'user_id'
                })
                .sort({date: -1})
                .exec();

            res.render('specificrequest', {
                user_role:req.session.role,
                contractrequest: contractrequest,
                feedback: feedback,
            });

        } catch (err) {
            console.log(err);
        }
    },

    forLegalReview: async (req, res) => { //staff
        try {
            console.log("Inside For Legal Review");
            var userid = req.query.userid;
            await ContractRequest.findOneAndUpdate({ _id: userid }, { $set: { statusCounter: 4} });

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

    postUploadRepositoryFile: async (req, res) => { // requesting office
        try {

            console.log(req.file);
            const filename = req.file.filename;
            const file_id = mongoose.Types.ObjectId(req.file.id);
            const fileuploaddate = req.file.uploadDate;
            const requestid = req.body.uploadRepositoryFileID;

            const newRepositoryFile = new Repository({
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

            console.log(files.contractFiles.length);

            console.log(files.refDocFiles.length);

            for (contractFile of files.contractFiles) {
                console.log(contractFile);
                console.log(contractFile.id);

            }

            for (refDocFile of files.refDocFiles) {
                console.log(refDocFile);
                console.log(contractFile.id);

            }

            res.redirect('back');

        } catch (err) {
            console.log(err);
        }

    },

    postUploadContract: async (req, res) => {

        console.log('UPLOAD CONTRACT');

    },

    postUploadRefDoc: async (req, res) => {

        console.log('UPLOAD REFERENCE DOCUMENT');

    },

}

module.exports = specificrequestcontroller;