const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs');

const User = require('../models/User.js');
const ContractRequest = require('../models/ContractRequest.js');
const ContractType = require('../models/ContractType.js');
const Status = require('../models/Status.js');
const Template = require('../models/Template.js');
const Role = require('../models/Role.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');
const { template } = require('handlebars');

// Connecting mongoose to our database 
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Mongo DB connected!'))
    .catch(err => console.log(err));

// Create mongo connection
const conn = mongoose.createConnection(url);

// Init gridfsBucket
let gridfsBucket;

conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

function getStaffWaiting (month, day, year, contractrequests, waiting) {
    //get number of waiting requests (staff)
    for (i=0; i<contractrequests.length; i++) {
        if (contractrequests[i].statusCounter == "2"){
            waiting.all++
            if (contractrequests[i].requestDate.getMonth() == month && contractrequests[i].requestDate.getDate() == day && contractrequests[i].requestDate.getFullYear() == year){
                waiting.today++
            }
        }
    }
}

const oulccontroller = {

    // add others that have the same implementation for both office staff and attorney (e.g. templates and repository)

    getDashboard: async (req, res) => {
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
                .sort()
                .exec();
   
            var dateToday = new Date();
            var month = dateToday.getMonth(); //this starts with 0
            var day = dateToday.getDate(); //actual date is utc but it applies the local time
            var year = dateToday.getFullYear();
            console.log(dateToday);
            console.log(month + " " + day + " " + year);

            let pending = {all:0, today:0};
            let waiting = {all:0, today:0};

            //get number of pending requests
            for (i=0; i<contractrequests.length; i++) {
                if (contractrequests[i].statusCounter == "1"){
                    pending.all++;
                    if (contractrequests[i].requestDate.getMonth() == month && contractrequests[i].requestDate.getDate() == day && contractrequests[i].requestDate.getFullYear() == year){
                        pending.today++;
                    }
                }
            }

            //get number of waiting request for staff
            if (req.session.role == "Staff"){
                //made this as a function so we can use the getDashboard for both attorney and staff. We will just change the function depending on the user
                getStaffWaiting(month, day, year, contractrequests, waiting); 
            }
            
            console.log("PENDING = " + pending.all);
            console.log("PENDING TODAY = " + pending.today);
            console.log("WAITING = " + waiting.all);
            console.log("WAITING TODAY = " + waiting.today);
    
            res.render('dashboardoulc', {
                user_role:req.session.role,
                pending: pending,
                waiting: waiting
            });

        } catch (err) {
            console.log(err);
        }
    },

    postDeleteTemplate: async (req, res) => {
        try {

            const templateid = req.body.deleteTemplate;

            const template = await Template.findByIdAndDelete(templateid).exec();

            if (template) {
                gridfsBucket.delete(mongoose.Types.ObjectId(template.file));
            }

            res.redirect('back');

        } catch (err) {
            console.log(err);
        }
    },

    viewTemplate: async (req, res) => {
        try {

            gridfsBucket.find({filename: req.params.filename}).toArray((err, file) => {
                // Check if files exist
                if (!file || file.length == 0) {
                    return res.status(404).json({
                        err: 'file does not exist'
                    });
                }
                // Check if document
                if (file[0].contentType === 'application/msword' || file[0].contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    // Read output to browser
                    const readstream = gridfsBucket.openDownloadStream(file[0]._id);
                    readstream.pipe(res);
                } else {
                    res.status(404).json({
                        err: 'Not a document'
                    });
                }
            });

        } catch (err) {
            console.log(err);
        }
    },

    uploadTemplate: async (req, res) => {
        try {

            const contractTypeInput = req.body.contractType;

            const contractType = await ContractType.findOne({name: contractTypeInput}).exec();

            const filename = req.file.filename;
            const file_id = mongoose.Types.ObjectId(req.file.id);
            const fileuploaddate = req.file.uploadDate;

            const newTemplate = new Template({
                name: filename,
                type: mongoose.Types.ObjectId(contractType._id),
                uploadDate: fileuploaddate,
                file: file_id
            });

            await newTemplate.save();

            res.redirect('back');
            
        } catch (err) {
            console.log(err);
        } 
    },

    postReplaceTemplate: async (req, res) => {
        try {

            const originalTemplateId = req.body.replaceTemplate;

            const filename = req.file.filename;
            const file_id = mongoose.Types.ObjectId(req.file.id);

            console.log(filename);
            console.log(originalTemplateId);
            console.log(file_id);

            const template = await Template.findById(originalTemplateId).exec()

            const originalTemplateFileId = template.file;

            const newTemplate = await Template.findByIdAndUpdate(originalTemplateId, {
                name: filename,
                file: file_id
            });

            if (newTemplate) {
                gridfsBucket.delete(mongoose.Types.ObjectId(originalTemplateFileId));
            }

            res.redirect('back');
            
        } catch (err) {
            console.log(err);
        } 
    },

    downloadTemplate: async (req, res) => {
        try {

            const templateid = req.query.templateid;

            const template = await Template.findById(templateid).exec();

            const templateFileId = template.file.toString();

            console.log(templateFileId);

            // gridfsBucket.find({_id: templateFileId}).toArray((err, file) => {
                
            //     if (!file || file.length == 0) {
            //         return res.status(404);
            //     } else {
            //         var downloadStream = gridfsBucket.openDownloadStream(file[0]._id);
            //         downloadStream.pipe(res);
            //     }

            // });

            // var downStream = gridfsBucket.openDownloadStream(mongoose.Types.ObjectId(templateFileId));
            // downStream.pipe(res);

            var downStream = gridfsBucket.openDownloadStream(mongoose.Types.ObjectId(templateFileId));
            downStream.pipe(res);

            console.log('DONE DOWNLOADING');
            
        } catch (err) {
            console.log(err);
        } 
    },

    getDownloadTemplate: async (req, res) => {
        try {

            const templateFileId = req.params.fileid;

            console.log(templateFileId);

            // gridfsBucket.find({_id: templateFileId}).toArray((err, file) => {
                
            //     if (!file || file.length == 0) {
            //         return res.status(404);
            //     } else {
            //         var downloadStream = gridfsBucket.openDownloadStream(file[0]._id);
            //         downloadStream.pipe(res);
            //     }

            // });

            // var downStream = gridfsBucket.openDownloadStream(mongoose.Types.ObjectId(templateFileId));
            // downStream.pipe(res);

            var downStream = gridfsBucket.openDownloadStream(mongoose.Types.ObjectId(templateFileId));
            // downStream.pipe(res);

            downStream.on('data', (chunk) => {
                res.write(chunk);
            });
        
            downStream.on('error', () => {
                res.sendStatus(404);
            });
        
            downStream.on('end', () => {
                res.end();
            });

            console.log('DONE DOWNLOADING');
            
        } catch (err) {
            console.log(err);
        } 
    }
}

module.exports = oulccontroller;