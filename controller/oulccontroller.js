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
const ContractVersion = require('../models/ContractVersion.js');
const Contract = require('../models/Contract.js');
const Status = require('../models/Status.js');
const Template = require('../models/Template.js');
const Role = require('../models/Role.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');
const { template } = require('handlebars');
const RepositoryFile = require('../models/RepositoryFile.js');
const Conversation = require('../models/Conversation.js');
const Feedback  = require('../models/Feedback.js');
const Faq = require('../models/Faq.js');
const Policy = require('../models/Policy.js');
const PolicyVersion = require('../models/PolicyVersion.js');
const Issue = require('../models/Issue.js');

// Create mongo connection
const conn = mongoose.createConnection(url);

// Init gridfsBucket
let gridfsBucket, gridfsBucketRepo, gridfsBucketPolicy;

conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'templates'
    });
    gridfsBucketRepo = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'repository'
    })
    gridfsBucketPolicy = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'policy'
    })
});

function getStaffWaiting (month, day, year, contractrequests, waiting, loggedInStaff) {
    //get number of waiting requests (staff)
    for (i=0; i<contractrequests.length; i++) {
        if (contractrequests[i].assignedStaff != null) {
            if (contractrequests[i].statusCounter == "2" && contractrequests[i].assignedStaff._id.toString() == loggedInStaff.toString()){
                waiting.all++
                if (contractrequests[i].requestDate.getMonth() == month && contractrequests[i].requestDate.getDate() == day && contractrequests[i].requestDate.getFullYear() == year){
                    waiting.today++
                }
            }
        }
    }
}

function getStaffToReview (month, day, year, contractrequests, toreview, loggedInStaff) {
    //get number of waiting requests (staff)
    for (i=0; i<contractrequests.length; i++) {
        if (contractrequests[i].assignedStaff != null) {
            if (contractrequests[i].statusCounter == "3" && contractrequests[i].assignedStaff._id.toString() == loggedInStaff.toString()){
                toreview.all++
                if (contractrequests[i].requestDate.getMonth() == month && contractrequests[i].requestDate.getDate() == day && contractrequests[i].requestDate.getFullYear() == year){
                    toreview.today++
                }
            }
        }
    }
}

function getAttorneyWaiting (month, day, year, contractrequests, waiting, loggedInAttorney) {
    //get number of waiting requests (staff)
    for (i=0; i<contractrequests.length; i++) {
        if (contractrequests[i].assignedAttorney != null) {
            if (contractrequests[i].statusCounter == "5" && contractrequests[i].assignedAttorney._id.toString() == loggedInAttorney.toString()){
                waiting.all++
                if (contractrequests[i].requestDate.getMonth() == month && contractrequests[i].requestDate.getDate() == day && contractrequests[i].requestDate.getFullYear() == year){
                    waiting.today++
                }
            }
        }
    }
}

function getAttorneyToReview (month, day, year, contractrequests, toreview, loggedInAttorney) {
    //get number of waiting requests (staff)
    for (i=0; i<contractrequests.length; i++) {
        if (contractrequests[i].assignedAttorney != null) {
            if (contractrequests[i].statusCounter == "6" && contractrequests[i].assignedAttorney._id.toString() == loggedInAttorney.toString()){
                toreview.all++
                if (contractrequests[i].requestDate.getMonth() == month && contractrequests[i].requestDate.getDate() == day && contractrequests[i].requestDate.getFullYear() == year){
                    toreview.today++
                }
            }
        }
    }
}

var client = require('@draftable/compare-api').client('Ctqxea-test', 'ba07097e83b21734ff6200b18278eee8');
var comparisons = client.comparisons;

const oulccontroller = {

    getDashboard: async (req, res) => {
        try {
            console.log("DASHBOARD PENDING NEAR START COUNT (START OF FUNCTION): " + req.session.pending_nearstartcount);
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
                    path: 'assignedAttorney'
                })
                .populate({
                    path: 'assignedStaff'
                })
                .sort()
                .exec();

            const departments = await Department.find({  abbrev: { $not: { $eq: "OULC"}  }}).lean().sort({abbrev: 1}).exec();
            const contractTypes = await ContractType.find({}).lean().exec();
                
            var dateToday = new Date();
            var month = dateToday.getMonth(); //this starts with 0
            var day = dateToday.getDate(); //actual date is utc but it applies the local time
            var year = dateToday.getFullYear();
            console.log(dateToday);

            let pending = {all:0, today:0, percentage: 0, nearstartcount: 0};
            let waiting = {all:0, today:0};
            let toreview = {all:0, today:0, nearstartcount: 0};
            let clearedCard = {count: 0, percentage: 0};
            let initialReview = {count: 0, percentage: 0};
            let legalReview = {count: 0, percentage: 0, nearstartcount: 0};

            //set violation count per department as 0 initially
            for (y=0; y<departments.length; y++) {
                departments[y].violationCount = 0;
            }
            for (z=0; z<contractTypes.length; z++) {
                contractTypes[z].violationCount = 0;
                contractTypes[z].requestCount = 0;
            }
        
            for (i=0; i<contractrequests.length; i++) {
                function dateDiffInDays(a, b) {
                    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
                    // Discard the time and time-zone information.
                    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
                    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
                  
                    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
                }

                var Difference_In_Days_Start = dateDiffInDays(new Date(contractrequests[i].requestDate), new Date(contractrequests[i].effectivityStartDate));
                var NotifDays = dateDiffInDays(new Date(), new Date(contractrequests[i].effectivityStartDate));

                // To set number of days gap in contract request
                contractrequests[i].daysGap = Difference_In_Days_Start;

                // START OF REQUEST COUNT PER STATUS
                if (contractrequests[i].statusCounter == "1"){
                    pending.all++;
                    if (contractrequests[i].requestDate.getMonth() == month && contractrequests[i].requestDate.getDate() == day && contractrequests[i].requestDate.getFullYear() == year){
                        pending.today++;
                    }
                    if (NotifDays >= 0 && NotifDays < 7) {
                        pending.nearstartcount++;
                        req.session.pending_nearstartcount = pending.nearstartcount; //assign notif count
                    }
                }
                else if (contractrequests[i].statusCounter == "2" || contractrequests[i].statusCounter == "3"){
                    initialReview.count++;
                    if(contractrequests[i].statusCounter == "3"){
                        if (NotifDays >= 0 && NotifDays < 7) {
                            toreview.nearstartcount++;
                            req.session.toreview_nearstartcount = toreview.nearstartcount; //assign notif count
                        }
                    }
                }
                else if (contractrequests[i].statusCounter == "4" || contractrequests[i].statusCounter == "5" || contractrequests[i].statusCounter == "6"){
                    legalReview.count++;
                    if((contractrequests[i].statusCounter == "4" || contractrequests[i].statusCounter == "6")){
                        if (NotifDays >= 0 && NotifDays < 7) {
                            legalReview.nearstartcount++;
                            req.session.legalReview_nearstartcount = legalReview.nearstartcount; //assign notif count
                        }
                    }
                }
                else if (contractrequests[i].statusCounter == "7"){
                    clearedCard.count++;
                }
                // END OF REQUEST COUNT PER STATUS

                // START OF REQUEST COUNT PER TYPE
                for (k=0; k<contractTypes.length; k++) {
                    if (contractrequests[i].contractType.name == contractTypes[k].name) {
                        contractTypes[k].requestCount++;
                    }   
                }
                // END OF REQUEST COUNT PER TYPE

                // START OF VIOLATION COUNT PER DEPARTMENT AND PER TYPE
                // To calculate the time difference of two dates
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

                var Difference_In_Days = dateDiffInDays(new Date(contractrequests[i].requestDate), new Date(contractrequests[i].effectivityStartDate));

                if (Difference_In_Days < 7) {
                    for (j=0; j<departments.length; j++) {
                        if (contractrequests[i].requester.department.abbrev == departments[j].abbrev) {
                            departments[j].violationCount++;
                        }   
                    }
                    for (k=0; k<contractTypes.length; k++) {
                        if (contractrequests[i].contractType.name == contractTypes[k].name) {
                            contractTypes[k].violationCount++;
                        }   
                    }
                }
                // END OF VIOLATION COUNT PER DEPARTMENT AND PER TYPE
            }

            // compute percentage per status
            clearedCard.percentage = ((clearedCard.count/contractrequests.length) * 100).toFixed(2);
            pending.percentage = ((pending.all/contractrequests.length) * 100).toFixed(2);
            initialReview.percentage = ((initialReview.count/contractrequests.length) * 100).toFixed(2);
            legalReview.percentage = ((legalReview.count/contractrequests.length) * 100).toFixed(2);

            if (req.user.roleName == "Staff"){
                //made this as a function so we can use the getDashboard for both attorney and staff. We will just change the function depending on the user
                getStaffWaiting(month, day, year, contractrequests, waiting, req.user._id); //get number of waiting request for staff
                getStaffToReview(month, day, year, contractrequests, toreview, req.user._id); //get number of to review request for staff
            }
            else if (req.user.roleName == "Attorney"){
                //made this as a function so we can use the getDashboard for both attorney and staff. We will just change the function depending on the user
                getAttorneyWaiting(month, day, year, contractrequests, waiting, req.user._id); //get number of waiting request for attorney
                getAttorneyToReview(month, day, year, contractrequests, toreview, req.user._id); //get number of to review request for attorney
               
            }
            
            console.log("DASHBOARD PENDING NEAR START COUNT (END OF FUNCTION): " + req.session.pending_nearstartcount);
    
            res.render('dashboardoulc', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName,
                pending: pending,
                waiting: waiting,
                toreview: toreview,
                cleared: clearedCard,
                initialReview: initialReview,
                legalReview: legalReview,
                pending_nearstartcount: req.session.pending_nearstartcount,
                toreview_nearstartcount: req.session.toreview_nearstartcount,
                legalReview_nearstartcount: req.session.legalReview_nearstartcount,
                requestCount: contractrequests.length,
                departments: departments,
                contractTypes: contractTypes
            });

        } catch (err) {
            console.log(err);
        }
    },

    getDashboardDate: async (req, res) => {
        try {
            var startdate = new Date(req.body.startdate);
            var enddate = new Date(req.body.enddate);

            var updatedstartdate = startdate.setUTCHours(0,0,0,0);
            var updatedenddate = enddate.setUTCHours(23,59,59,999);

            console.log(startdate + " until " + enddate);

            //const contractrequests = await ContractRequest.find({requestDate: dateToday}).lean()
            const contractrequests = await ContractRequest.find({requestDate: {$gte: updatedstartdate, $lte: updatedenddate}}).lean()
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
                .sort()
                .exec();

            console.log(contractrequests.length);

            const departments = await Department.find({  abbrev: { $not: { $eq: "OULC"}  }}).lean().sort({abbrev: 1}).exec();
            const contractTypes = await ContractType.find({}).lean().exec();
                
            var dateToday = new Date();
            var month = dateToday.getMonth(); //this starts with 0
            var day = dateToday.getDate(); //actual date is utc but it applies the local time
            var year = dateToday.getFullYear();
            console.log(dateToday);

            let pending = {all:0, today:0, percentage: 0};
            let waiting = {all:0, today:0};
            let toreview = {all:0, today:0};
            let clearedCard = {count: 0, percentage: 0};
            let initialReview = {count: 0, percentage: 0};
            let legalReview = {count: 0, percentage: 0};

            //set violation count per department as 0 initially
            for (y=0; y<departments.length; y++) {
                departments[y].violationCount = 0;
            }
            for (z=0; z<contractTypes.length; z++) {
                contractTypes[z].violationCount = 0;
                contractTypes[z].requestCount = 0;
            }
        
            for (i=0; i<contractrequests.length; i++) {

                // START OF REQUEST COUNT PER STATUS
                if (contractrequests[i].statusCounter == "1"){
                    pending.all++;
                    if (contractrequests[i].requestDate.getMonth() == month && contractrequests[i].requestDate.getDate() == day && contractrequests[i].requestDate.getFullYear() == year){
                        pending.today++;
                    }
                }
                else if (contractrequests[i].statusCounter == "2" || contractrequests[i].statusCounter == "3"){
                    initialReview.count++;
                }
                else if (contractrequests[i].statusCounter == "4" || contractrequests[i].statusCounter == "5" || contractrequests[i].statusCounter == "6"){
                    legalReview.count++;
                }
                else if (contractrequests[i].statusCounter == "7"){
                    clearedCard.count++;
                }
                // END OF REQUEST COUNT PER STATUS

                // START OF REQUEST COUNT PER TYPE
                for (k=0; k<contractTypes.length; k++) {
                    if (contractrequests[i].contractType.name == contractTypes[k].name) {
                        contractTypes[k].requestCount++;
                    }   
                }
                // END OF REQUEST COUNT PER TYPE

                // START OF VIOLATION COUNT PER DEPARTMENT AND PER TYPE
                // To calculate the time difference of two dates
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

                var Difference_In_Days = dateDiffInDays(new Date(contractrequests[i].requestDate), new Date(contractrequests[i].effectivityStartDate));

                if (Difference_In_Days < 7) {
                    for (j=0; j<departments.length; j++) {
                        if (contractrequests[i].requester.department.abbrev == departments[j].abbrev) {
                            departments[j].violationCount++;
                        }   
                    }
                    for (k=0; k<contractTypes.length; k++) {
                        if (contractrequests[i].contractType.name == contractTypes[k].name) {
                            contractTypes[k].violationCount++;
                        }   
                    }
                }
                // END OF VIOLATION COUNT PER DEPARTMENT AND PER TYPE
            }

            // compute percentage per status
            clearedCard.percentage = ((clearedCard.count/contractrequests.length) * 100).toFixed(2);
            pending.percentage = ((pending.all/contractrequests.length) * 100).toFixed(2);
            initialReview.percentage = ((initialReview.count/contractrequests.length) * 100).toFixed(2);
            legalReview.percentage = ((legalReview.count/contractrequests.length) * 100).toFixed(2);

            if (req.user.roleName == "Staff"){
                //made this as a function so we can use the getDashboard for both attorney and staff. We will just change the function depending on the user
                getStaffWaiting(month, day, year, contractrequests, waiting, req.user._id); //get number of waiting request for staff
                getStaffToReview(month, day, year, contractrequests, toreview, req.user._id); //get number of to review request for staff
            }
            else if (req.user.roleName == "Attorney"){
                //made this as a function so we can use the getDashboard for both attorney and staff. We will just change the function depending on the user
                getAttorneyWaiting(month, day, year, contractrequests, waiting, req.user._id); //get number of waiting request for attorney
                getAttorneyToReview(month, day, year, contractrequests, toreview, req.user._id); //get number of to review request for attorney
               
            }
            
    
            res.render('dashboardoulc', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName,
                pending: pending,
                waiting: waiting,
                toreview: toreview,
                cleared: clearedCard,
                initialReview: initialReview,
                legalReview: legalReview,
                requestCount: contractrequests.length,
                departments: departments,
                contractTypes: contractTypes,
                startdate: startdate,
                enddate: enddate
            });

        } catch (err) {
            console.log(err);
        }
    },

    postDeleteTemplate: async (req, res) => {
        try {

            const templateid = req.body.deleteTemplate;

            // delete template object
            const template = await Template.findByIdAndDelete(templateid).exec();

            if (template) {

                // delete word file in gridfs
                if (template.isWordFile == true) {
                    const cursor = await gridfsBucket.find({_id: mongoose.Types.ObjectId(template.wordFileId)}, {limit: 1});
                    cursor.forEach((doc, err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            gridfsBucket.delete(doc._id);
                        }
                    });
                }

                // delete pdf file in gridfs
                const cursor2 = await gridfsBucket.find({_id: mongoose.Types.ObjectId(template.pdfFileId)}, {limit: 1});
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

    viewTemplateOnClick: async (req, res) => {

        const templateid = req.query.templateid;

        const template = await Template.findById(templateid).exec();

        console.log(template.pdfFileId.toString());

        res.send({
            pdfFileId: template.pdfFileId.toString()
        })

    },

    viewTemplate: async (req, res) => {
        try {

            const fileid = req.params.fileid;

            const cursor = gridfsBucket.find({_id: mongoose.Types.ObjectId(fileid)});

            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                } else if (doc.contentType === 'application/pdf') {
                    const readstream = gridfsBucket.openDownloadStream(doc._id);
                    readstream.pipe(res);
                } else {
                    res.status(404).json({
                        err: 'No file exist'
                    });
                }
            })

        } catch (err) {
            console.log(err);
        }
    },

    viewRepositoryFile: async (req, res) => {
        try {

            const fileid = req.params.fileid;

            const cursor = gridfsBucketRepo.find({_id: mongoose.Types.ObjectId(fileid)});

            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                } else if (doc.contentType === 'application/pdf') {
                    const readstream = gridfsBucketRepo.openDownloadStream(doc._id);
                    readstream.pipe(res);
                } else {
                    res.status(404).json({
                        err: 'No file exist'
                    });
                }
            })

        } catch (err) {
            console.log(err);
        }
    },

    uploadTemplate: async (req, res) => {
        try {

            if (req.file != null) {
                const contractTypeInput = req.body.contractType;
    
                const contractType = await ContractType.findOne({name: contractTypeInput}).exec();
    
                const filename = req.file.filename;
                const file_id = mongoose.Types.ObjectId(req.file.id);
                const fileuploaddate = req.file.uploadDate;
    
                const cursor = gridfsBucket.find({_id: file_id});
                cursor.forEach((doc, err) => {
                    if (err) {
                        console.log(err);
                    } else if (doc.contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || doc.contentType === 'application/msword') {
                        console.log(doc);
                        console.log('word');
                        const writableStream = fs.createWriteStream('./word_file.docx');
    
                        const downStream = gridfsBucket.openDownloadStream(doc._id);
                        downStream.pipe(writableStream);
    
                        writableStream.on('close', function(){
                            const formData = new FormData()
                            formData.append('instructions', JSON.stringify({
                              parts: [
                                {
                                  file: "document"
                                }
                              ]
                            }))
                            formData.append('document', fs.createReadStream('word_file.docx'))
                            
                            ;(async () => {
                              try {
                                const response = await axios.post('https://api.pspdfkit.com/build', formData, {
                                  headers: formData.getHeaders({
                                      'Authorization': 'Bearer pdf_live_A8KAhWydkVoVruRCuJ50xONECa4uroQO7jIiose5aSi'
                                  }),
                                  responseType: "stream"
                                })
                            
                                // generate pdf filename using crypto module
                                const buf = crypto.randomBytes(12);
                                var pdfFilename = buf.toString('hex') + '.pdf';
    
                                var pdfFileObjectId = pdfFilename.slice(0, -4);
    
                                // upload pdf file to gridfsbucket
                                response.data.pipe(gridfsBucket.openUploadStreamWithId(mongoose.Types.ObjectId(pdfFileObjectId), pdfFilename, {contentType: 'application/pdf'}));
    
                                // create template object
                                const newTemplate = new Template({
                                    name: filename,
                                    type: mongoose.Types.ObjectId(contractType._id),
                                    uploadDate: fileuploaddate,
                                    isWordFile: true,
                                    wordFileId: doc._id,
                                    pdfFileId: mongoose.Types.ObjectId(pdfFileObjectId)
                                });
    
                                // insert template object to db
                                newTemplate.save(function(){
                                    // delete a file
                                    fs.unlink('word_file.docx', (err) => {
                                        if (err) {
                                            throw err;
                                        }
    
                                        console.log("Word file is deleted.");
                                    });
    
                                    res.redirect('back');
                                });
    
                              } catch (err) {
                                // const errorString = await streamToString(e.response.data)
                                console.log(err)
                              }
                            })()
    
                            // fs.createReadStream('result.pdf').
                            //   pipe(gridfsBucket.openUploadStream('myfile'));
                            
                            function streamToString(stream) {
                              const chunks = []
                              return new Promise((resolve, reject) => {
                                stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
                                stream.on("error", (err) => reject(err))
                                stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
                              })
                            }
                        });
    
                    } else if (doc.contentType === 'application/pdf') {
                        console.log(doc);
                        console.log('pdf');
    
                        const newTemplate = new Template({
                            name: filename,
                            type: mongoose.Types.ObjectId(contractType._id),
                            uploadDate: fileuploaddate,
                            isWordFile: false,
                            pdfFileId: doc._id
                        });
    
                        newTemplate.save(function(){
                            res.redirect('back');
                        });
                    }
                });
            }

            
        } catch (err) {
            console.log(err);
        } 
    },

    postReplaceTemplate: async (req, res) => {
        try {

            const originalTemplateId = req.body.replaceTemplate;
            const file_id = mongoose.Types.ObjectId(req.file.id);

            const template = await Template.findById(originalTemplateId).exec()

            const originalTemplateIsWordFile = template.isWordFile;
            const originalTemplatePdfFileId = template.pdfFileId;

            // find uploaded file in gridfs
            const cursor = gridfsBucket.find({_id: file_id});
            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                } else if (doc.contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || doc.contentType === 'application/msword') {
                    console.log(doc);
                    console.log('word');
                    const writableStream = fs.createWriteStream('./word_file.docx');

                    const downStream = gridfsBucket.openDownloadStream(doc._id);
                    downStream.pipe(writableStream);

                    writableStream.on('close', function(){
                        const formData = new FormData()
                        formData.append('instructions', JSON.stringify({
                          parts: [
                            {
                              file: "document"
                            }
                          ]
                        }))
                        formData.append('document', fs.createReadStream('word_file.docx'))
                        
                        ;(async () => {
                          try {
                            const response = await axios.post('https://api.pspdfkit.com/build', formData, {
                              headers: formData.getHeaders({
                                  'Authorization': 'Bearer pdf_live_A8KAhWydkVoVruRCuJ50xONECa4uroQO7jIiose5aSi'
                              }),
                              responseType: "stream"
                            })

                            // generate pdf filename using crypto module
                            const buf = crypto.randomBytes(12);
                            var pdfFilename = buf.toString('hex') + '.pdf';

                            var pdfFileObjectId = pdfFilename.slice(0, -4);

                            // upload pdf file to gridfsbucket
                            response.data.pipe(gridfsBucket.openUploadStreamWithId(mongoose.Types.ObjectId(pdfFileObjectId), pdfFilename, {contentType: 'application/pdf'}));

                            Template.findByIdAndUpdate(originalTemplateId, {
                                name: doc.filename,
                                uploadDate: doc.uploadDate,
                                isWordFile: true,
                                wordFileId: doc._id,
                                pdfFileId: mongoose.Types.ObjectId(pdfFileObjectId)
                            }, (err, updatedTemplate) => {
                                if (err) {
                                    console.log(err);
                                }

                                // if update template success

                                if (updatedTemplate != null) {

                                    if (originalTemplateIsWordFile == true) {

                                        const originalTemplateWordFileId = template.wordFileId;

                                        // delete old word file from gridfs
                                        gridfsBucket.delete(mongoose.Types.ObjectId(originalTemplateWordFileId));

                                        // delete old pdf file from gridfs
                                        gridfsBucket.delete(mongoose.Types.ObjectId(originalTemplatePdfFileId));
                                    } else if (originalTemplateIsWordFile == false) {

                                        // delete old pdf file from gridfs
                                        gridfsBucket.delete(mongoose.Types.ObjectId(originalTemplatePdfFileId));
                                    }
                                }

                                // delete a file
                                fs.unlink('word_file.docx', (err) => {
                                    if (err) {
                                        throw err;
                                    }

                                    console.log("Word file is deleted.");
                                });

                                res.redirect('back');
                            });


                          } catch (err) {
                            // const errorString = await streamToString(e.response.data)
                            console.log(err)
                          }
                        })()


                        
                        function streamToString(stream) {
                          const chunks = []
                          return new Promise((resolve, reject) => {
                            stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
                            stream.on("error", (err) => reject(err))
                            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
                          })
                        }
                    });


                } else if (doc.contentType === 'application/pdf') {
                    console.log(doc);
                    console.log('pdf');


                    const updatedTemplate = Template.findByIdAndUpdate(originalTemplateId, {
                        name: doc.filename,
                        uploadDate: doc.uploadDate,
                        isWordFile: false,
                        pdfFileId: doc._id
                    }).exec();

                    // if update template success
                    if (updatedTemplate != null) {

                        if (originalTemplateIsWordFile == true) {

                            const originalTemplateWordFileId = template.wordFileId;

                            // delete old word file from gridfs
                            gridfsBucket.delete(mongoose.Types.ObjectId(originalTemplateWordFileId));

                            // delete old pdf file from gridfs
                            gridfsBucket.delete(mongoose.Types.ObjectId(originalTemplatePdfFileId));
                        } else if (originalTemplateIsWordFile == false) {
                            
                            // delete old pdf file from gridfs
                            gridfsBucket.delete(mongoose.Types.ObjectId(originalTemplatePdfFileId));
                        }

                    }

                    res.redirect('back');
                }
            });

            
        } catch (err) {
            console.log(err);
        } 
    },

    getDownloadTemplate: async (req, res) => {
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

    getRepository: async (req, res) => {
        try {

            const contracttypes = await ContractType.find({}).lean().exec();
            const repositoryFiles = await RepositoryFile.find({}).lean()
            .populate({
                path: 'requestid',
                populate: {
                    path: 'contractType'
                    } 
            })
            .sort({uploadDate: 1})
            .exec();
    
            res.render('repository', {
                user_fullname: req.user.fullName,
                user_role: req.user.roleName,
                contracttypes: contracttypes,
                repositoryFiles: repositoryFiles,
                pending_nearstartcount: req.session.pending_nearstartcount, //new notif implementation
                toreview_nearstartcount: req.session.toreview_nearstartcount, //new notif implementation
                legalReview_nearstartcount: req.session.legalReview_nearstartcount //new notif implementation
            });

        } catch (err) {
            console.log(err);
        }
    },

    getSpecificRepositoryFile: async (req, res) => {
        try {

            var path = req.path.split('/')[2];

            const repositoryFile = await RepositoryFile.findOne({_id : path}).lean()
            .populate({
                path: 'requestid',
                populate: {
                    path: 'contractType'
                    } 
            })
            .lean()
            .exec();

           /* if(await RepositoryFile.findOne({_id : path ,tags: val}).exec()){
                console.log("EXISTS!");
            }else{
                console.log("N/A");
            }*/

            // To calculate the time difference of two dates
            var Difference_In_Time = repositoryFile.requestid.effectivityEndDate.getTime() - repositoryFile.requestid.effectivityStartDate.getTime();
                    
            // To calculate the no. of days between two dates
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

            if (Difference_In_Days < 0){
                Difference_In_Days = Math.floor(Difference_In_Days);
            }
            else {
                Difference_In_Days = Math.ceil(Difference_In_Days);
            }

            // To set number of days gap in contract request
            repositoryFile.daysDuration = Difference_In_Days;
            
            res.render('specificrepositoryfile', {
                user_fullname:req.user.fullName,
                user_role: req.user.roleName,
                repositoryFile: repositoryFile,
                pending_nearstartcount: req.session.pending_nearstartcount, //new notif implementation
                toreview_nearstartcount: req.session.toreview_nearstartcount, //new notif implementation
                legalReview_nearstartcount: req.session.legalReview_nearstartcount //new notif implementation

            });

        } catch (err) {
            console.log(err);
        }
    },

    addTag: async (req, res) => {
       
            var tag = req.query.tag;
            var id = req.query.id;

            console.log("ID IS: " + id);
            console.log(tag);

            if(await RepositoryFile.findOne({_id : id ,tags: tag}).exec()){
                console.log("Tag already exists. Can't add.");
            }
            else{
                try{
                    await RepositoryFile.findOneAndUpdate({_id : id}, { $push: { tags: tag } }).exec();
                } catch (err) {
                    console.log(err);
                }
                console.log("Tag was added succesfully.");
            }
    },

    removeTag: async (req, res) => {
        try {
            var tag = req.query.tag;
            var id = req.query.id;
            console.log("ID IS: " + id);
            console.log("Removed: " + tag);

            try{
                await RepositoryFile.findOneAndUpdate({_id : id}, { $pull: { tags: tag } }).exec();
            } catch (err) {
                console.log(err);
            }

        } catch (err) {
            console.log(err);
        }
    },

    downloadRepositoryFile: async (req, res) => {

        try {
            const fileid = req.params.fileid;
    
            const cursor = gridfsBucketRepo.find({_id: mongoose.Types.ObjectId(fileid)});
            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                }
                const downStream = gridfsBucketRepo.openDownloadStream(doc._id);
    
                res.setHeader('Content-Type', doc.contentType);
                res.setHeader('Content-Disposition', `attachment; filename=${doc.filename}`);
    
                downStream.pipe(res);
            });

        } catch (err) {
            console.log(err);
        }

    },

    savePendingFeedback: async (req, res) => {
        try {
            console.log('SAVE PENDING FEEDBACK');

            const comments = req.query.comments;

            console.log(comments);

            var cvid = comments[0].contractversionid.substring(4);
            var contractVersion = await ContractVersion.findById(cvid)
                .lean()
                .populate({
                    path: 'contract'
                })
                .exec();
            
            var contractRequest = await ContractRequest.findById(contractVersion.contract.contractRequest).exec();

            // cycle through all comments and create a feedback object for each one
            for (comment of comments) {

                console.log(comment.content);

                // if feedback is not empty
                if (comment.content) {

                    var contractversionid = comment.contractversionid.substring(4);
    
                    var findComment = await Feedback.findOne({contractVersion: contractversionid}).exec();
    
                    if (findComment) {  // if comments is already there
                        console.log('has existing comment');
    
                        // console.log(findContractVersion.comment);
                        // console.log(comment.content);
    
                        var success = await Feedback.findByIdAndUpdate(findComment, {$set: { content: comment.content}}).exec();
    
                    } else {    // if no comment
                        console.log('no comment');
    
                        let newComment = new Feedback({
                            contractVersion: contractversionid,
                            user_id: req.user._id,
                            content: comment.content,
                            status: 'Pending'
                        });
        
                        var insertComment = await newComment.save();
                        // var success = await ContractVersion.findByIdAndUpdate(contractversionid, { $set: {comment: insertComment._id}}).exec();
                    }
                } else {    // if feedback is empty whether not entered or deleted
                    var contractversionid = comment.contractversionid.substring(4);
    
                    var findComment = await Feedback.findOne({contractVersion: contractversionid}).exec();
    
                    if (findComment) {  // if comments is already there
                        console.log('has existing comment');
    
                        // console.log(findContractVersion.comment);
                        // console.log(comment.content);
    
                        var success = await Feedback.findByIdAndUpdate(findComment, {$set: { content: ''}}).exec();
    
                    }
                }

            }

        } catch (err) {
            console.log(err);
        }

    },

    deleteRepositoryFile: async (req, res) => {

        try {
            console.log('Delete Repo File');
    
            const repositoryfileid = req.body.deleteRepositoryFile;
            const fileid = req.params.fileid;
    
            // delete repositoryfile object
            await RepositoryFile.findByIdAndDelete(repositoryfileid).exec();
    
            const cursor = await gridfsBucketRepo.find({_id: mongoose.Types.ObjectId(fileid)}, {limit: 1});
            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                } else {
                    gridfsBucketRepo.delete(doc._id);
                }
            });
    
            res.redirect('back');

        } catch (err) {
            console.log(err);

        }
    },

    getFAQs: async (req, res) => {
        try {

            const faqs = await Faq.find({}).lean().sort({date: 1}).exec();
    
            res.render('faqs', {
                user_fullname:req.user.fullName,
                user_role: req.user.roleName,
                faqs: faqs,
                forrevision_count: req.session.forrevision_count,
                pending_nearstartcount: req.session.pending_nearstartcount, //new notif implementation
                toreview_nearstartcount: req.session.toreview_nearstartcount, //new notif implementation
                legalReview_nearstartcount: req.session.legalReview_nearstartcount //new notif implementation
                // contracttypes: contracttypes,
                // templates: templates
            });

        } catch (err) {
            console.log(err);
        }
    },

    postAddFAQs: async (req, res) => {
        try {
            var FAQ = new Faq({
                question: req.body.questionFAQ,
                answer: req.body.answerFAQ,
                date: Date.now()
            });

            await FAQ.save(function(){
                res.redirect('back');
            });
            
        } catch (err) {
            console.log(err);
        }
    },
            
    getPendingFeedbacks: async (req, res) => {
        try {

            console.log("GET PENDING FEEDBACKS");

            const pendingFeedbacksFileIds = req.query.pendingFeedbacksFileIds;
            console.log(pendingFeedbacksFileIds);

            var pendingFeedbacksOfLatestVersionContracts = [];

            if (pendingFeedbacksFileIds) {
                
                for (pendingFeedbackFileId of pendingFeedbacksFileIds) {
    
                    var contractVersionId = pendingFeedbackFileId.substring(4);
    
                    var pendingFeedback = await Feedback.findOne({contractVersion: contractVersionId}).exec();
                    // console.log(pendingFeedback);
    
                    pendingFeedbacksOfLatestVersionContracts.push(pendingFeedback);
    
                }
    
                console.log(pendingFeedbacksOfLatestVersionContracts);
    
                res.send({pendingFeedbacks: pendingFeedbacksOfLatestVersionContracts});
    
            }

        } catch (err) {
            console.log(err);
        }
    },

    postDeleteFAQ: async (req, res) => {
        try {

            const faqid = req.body.deleteFAQ;

            // delete faq object
            await Faq.findByIdAndDelete(faqid).exec();

            res.redirect('back');

        } catch (err) {
            console.log(err);
        }
    },

    postUpdateFAQ: async (req, res) => {
        try {

            const faqid = req.body.updateFAQ;

            // update faq object
            await Faq.findOneAndUpdate({ _id: faqid }, { $set: { question: req.body.updateQuestionFAQ, answer: req.body.updateAnswerFAQ } });

            res.redirect('back');

        } catch (err) {
            console.log(err);
        }
    },

    getPolicy: async (req, res) => {
        try {

            const policies = await Policy.find({})
                .exec();

            var policyVersions = [];

            for (policy of policies) {
                const policyVersion = await PolicyVersion.findOne({policy: policy._id, version: policy.latestVersion })
                    .lean()
                    .populate({
                        path: 'uploadBy'
                    })
                    .exec();

                policyVersions.push(policyVersion);
            }

            res.render('policy', {
                user_id: req.user._id,
                user_fullname: req.user.fullName,
                user_role: req.user.roleName,
                policyVersions: policyVersions,
                pending_nearstartcount: req.session.pending_nearstartcount, //new notif implementation
                toreview_nearstartcount: req.session.toreview_nearstartcount, //new notif implementation
                legalReview_nearstartcount: req.session.legalReview_nearstartcount, //new notif implementation
                forrevision_count: req.session.forrevision_count
            });

        } catch (err) {
            console.log(err);
        }
    },

    postUploadPolicy: async (req, res) => {
        try {
            if (req.file != null) {
                const filename = req.file.filename;
                const file_id = mongoose.Types.ObjectId(req.file.id);
                const fileuploaddate = req.file.uploadDate;
                const user_id = req.body.uploadPolicyUser;

                console.log(user_id);
            
                let newPolicy = new Policy({
                    latestVersion: 1
                });

                let policy = await newPolicy.save();

                console.log(policy);

                let newPolicyVersion = new PolicyVersion({
                    policy: policy._id,
                    filename: filename,
                    file: file_id,
                    uploadDate: fileuploaddate,
                    uploadBy: user_id,
                    version: 1
                });

                console.log(newPolicyVersion);

                newPolicyVersion.save(function(){
                    res.redirect('back');
                });
                
            }
            
        } catch (err) {
            console.log(err);
        }
    },

    viewPolicy: async (req, res) => {
        try {

            const fileid = req.params.fileid;

            const cursor = gridfsBucketPolicy.find({_id: mongoose.Types.ObjectId(fileid)});

            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                } else if (doc.contentType === 'application/pdf') {
                    const readstream = gridfsBucketPolicy.openDownloadStream(doc._id);
                    readstream.pipe(res);
                } else {
                    res.status(404).json({
                        err: 'No file exist'
                    });
                }
            })

        } catch (err) {
            console.log(err);
        }
    },

    viewPolicyOnClick: async (req, res) => {
        try {
            const policyid = req.query.policyid;
            const policyVersion = await PolicyVersion.findById(policyid).exec();
    
            res.send({
                fileid: policyVersion.file.toString()
            })
        } catch (err) {
            console.log(err);
        }
    },

    postDeletePolicy: async (req, res) => {
        try {
            const policyVersionId = req.body.deletePolicy;
            const policyVersion = await PolicyVersion.findByIdAndDelete(policyVersionId).exec();

            await Policy.findByIdAndDelete(policyVersion.policy).exec();
    
            const cursor = await gridfsBucketPolicy.find({_id: mongoose.Types.ObjectId(policyVersion.file)}, {limit: 1});
            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                } else {
                    gridfsBucketPolicy.delete(doc._id);
                }
            });
        } catch (err) {
            console.log(err);
        }

        res.redirect('back');
    },

    postUpdatePolicy: async (req, res) => {
        try {

            console.log('POST UPDATE POLICY');

            const originalPolicyVersionId = req.body.updatePolicyVersion;
            const file = req.file;
            const revisionNotes = req.body.updatePolicyRevisionNotes;
            const updatedBy = req.body.updatePolicyUserId;

            const originalPolicyVersion = await PolicyVersion.findById(originalPolicyVersionId)
                .populate({
                    path: 'policy'
                })
                .exec();

            // add new policyVersion object
            let newPolicyVersion = new PolicyVersion({
                policy: mongoose.Types.ObjectId(originalPolicyVersion.policy._id),
                filename: file.filename,
                file: file.id,
                uploadDate: file.uploadDate,
                uploadBy: updatedBy,
                versionNote: revisionNotes,
                version: originalPolicyVersion.policy.latestVersion + 1
            });

            newPolicyVersion.save();

            // update latestVersion of Policy object
            await Policy.findByIdAndUpdate(originalPolicyVersion.policy._id, {$inc: {latestVersion: 1}}).exec();

            res.redirect('back');
            
        } catch (err) {
            console.log(err);
        }
    },

    getPolicyVersions: async (req, res) => {
        try {

            const policyid = req.params.id;
            
            const policy = await Policy.findById(policyid)
                .lean()
                .exec();

            const latestPolicyVersion = await PolicyVersion.findOne({policy: policy, version: policy.latestVersion})
                .lean()
                .exec();

            const policyVersions = await PolicyVersion.find({policy: policy})
                .populate({
                    path: 'uploadBy'
                })
                .lean()
                .sort({version: -1})
                .exec();

            res.render('revisionhistorypolicy', {
                user_fullname: req.user.fullName,
                user_role: req.user.roleName,
                latestPolicyVersion: latestPolicyVersion,
                policy: policy,
                policyVersions: policyVersions
            });
            
        } catch (err) {
            console.log(err);
        }
    },

    comparePolicyVersions: async (req, res) => {
        try {

            const policyid = req.body.policyIdForComparing;

            const policy = await Policy.findById(policyid).lean().exec();
            const policyVersions = await PolicyVersion.find({policy: policy})
                .lean()
                .exec();

            console.log(policyid);

            const latestPolicyVersion = await PolicyVersion.findOne({policy: policy, version: policy.latestVersion})
                .lean()
                .exec();

            if (policy.latestVersion <= 1) {
                var versionbefore = policy.latestVersion;
            } else {
                var versionbefore = policy.latestVersion - 1;
            }

            console.log(versionbefore);

            const beforePolicyVersion = await PolicyVersion.findOne({ policy: policy, version: versionbefore})
                .lean()
                .exec();

            const cursorRight = await gridfsBucketPolicy.find({_id: mongoose.Types.ObjectId(latestPolicyVersion.file)});
            const cursorLeft = await gridfsBucketPolicy.find({_id: mongoose.Types.ObjectId(beforePolicyVersion.file)});

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
            const downStream = gridfsBucketPolicy.openDownloadStream(documentRight._id);
            downStream.pipe(writableStream);
            console.log('right');

            downStream.on('end', function() {
                const writableStream2 = fs.createWriteStream('./left_compare.pdf');
                const downStream2 = gridfsBucketPolicy.openDownloadStream(documentLeft._id);
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

                        res.render('comparepolicyversions', {
                            user_fullname: req.user.fullName,
                            user_role: req.user.roleName,
                            leftPolicyVersion: beforePolicyVersion._id.toString(),
                            rightPolicyVersion: latestPolicyVersion._id.toString(),
                            latestPolicyVersion: latestPolicyVersion,
                            policy: policy,
                            policyVersions: policyVersions,
                            draftable: viewerURL
                        });
                    });
                });

            });

        } catch (err) {
            console.log(err);
        }
    },

    customComparePolicyVersions: async (req, res) => {
        try {

            const fileLeft = req.body.policyFileSelectedLeft;
            const fileRight = req.body.policyFileSelectedRight;

            // console.log(fileLeft);
            // console.log(fileRight);

            let policyVersionLeft;

            policyVersionLeft = await PolicyVersion.findOne({ file: fileLeft }).lean().exec();
            const policyVersionRight = await PolicyVersion.findOne({ file: fileRight }).lean()
                .populate({
                    path: 'uploadBy',
                })
                .populate({
                    path: 'policy'
                })
                .exec();

            // console.log(policyVersionLeft, policyVersionRight);

            const policyVersions = await PolicyVersion.find({ policy: policyVersionRight.policy }).lean().exec();
            const latestPolicyVersion = await PolicyVersion.findOne({policy: policyVersionRight.policy, version: policyVersionRight.policy.latestVersion})
                .lean()
                .exec();

            // console.log(latestPolicyVersion);

            const cursorLeft = await gridfsBucketPolicy.find({_id: mongoose.Types.ObjectId(fileLeft)});
            const cursorRight = await gridfsBucketPolicy.find({_id: mongoose.Types.ObjectId(fileRight)});

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
            const downStream = gridfsBucketPolicy.openDownloadStream(documentRight._id);
            downStream.pipe(writableStream);
            console.log('right');

            downStream.on('end', function() {
                const writableStream2 = fs.createWriteStream('./left_compare.pdf');

                let downStream2;
                downStream2 = gridfsBucketPolicy.openDownloadStream(documentLeft._id);

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

                        res.render('comparepolicyversions', {
                            user_fullname: req.user.fullName,
                            user_role: req.user.roleName,
                            policyVersions: policyVersions,
                            latestPolicyVersion: latestPolicyVersion,
                            leftPolicyVersion: policyVersionLeft._id.toString(),
                            rightPolicyVersion: policyVersionRight._id.toString(),
                            draftable: viewerURL
                        });
                    });
                });

            });

        } catch (err) {
            console.log(err);
        }
    },

    getIssueLog: async (req, res) => {
        try {

            var issues;
            var requests;
            if (req.user.roleName == "Requester") {
                issues = await Issue.find({requester: req.user._id}).lean().populate({
                    path: 'contractRequest'
                })
                .sort({issueNumber: 1, date: 1})
                .exec(); 

                requests = await ContractRequest.find({requester: req.user._id, statusCounter: 7}).lean().exec(); 
            }
            else {
                issues = await Issue.find({}).lean().populate({
                    path: 'contractRequest'
                })
                .sort({issueNumber: 1, date: 1})
                .exec(); 
            }

            res.render('issuelog', {
                user_id: req.user._id,
                user_fullname:req.user.fullName,
                user_role: req.user.roleName,
                issues: issues,
                requests: requests,
                forrevision_count: req.session.forrevision_count
            });

        } catch (err) {
            console.log(err);
        }
    },

    viewIssueOnClick: async (req, res) => {
        console.log ("ISSUE ON CLICK");

        const issueid = req.query.issueid;

        const issue = await Issue.findById(issueid).lean()
        .populate({
            path: 'contractRequest'
        })
        .populate({
            path: 'requester',
            populate: {
                path: 'department'
              } 
        }).exec();

        console.log(issue._id);
        var issuetitle = issue.title; 
        console.log (issuetitle);

        res.send({
            issue: issue
        });

    },

    resolveIssue: async (req, res) => { //attorney
        try {
            var issueid = req.query.issueid;
            var response = req.query.response;
            console.log("INSIDE RESOLVE: " + issueid);

            // update faq object
            await Issue.findOneAndUpdate({ _id: issueid }, { $set: { status: "Resolved", response: response} });
           

        } catch (err) {
            console.log(err);
        }
    },
}

module.exports = oulccontroller;