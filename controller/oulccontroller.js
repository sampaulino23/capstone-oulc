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
const Role = require('../models/Role.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');
const { template } = require('handlebars');
const RepositoryFile = require('../models/RepositoryFile.js');

// Create mongo connection
const conn = mongoose.createConnection(url);

// Init gridfsBucket
let gridfsBucket, gridfsBucketRepo;

conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'templates'
    });
    gridfsBucketRepo = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'repository'
    })
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

function getStaffToReview (month, day, year, contractrequests, toreview) {
    //get number of waiting requests (staff)
    for (i=0; i<contractrequests.length; i++) {
        if (contractrequests[i].statusCounter == "3"){
            toreview.all++
            if (contractrequests[i].requestDate.getMonth() == month && contractrequests[i].requestDate.getDate() == day && contractrequests[i].requestDate.getFullYear() == year){
                toreview.today++
            }
        }
    }
}

function getAttorneyWaiting (month, day, year, contractrequests, waiting, loggedInAttorney) {
    //get number of waiting requests (staff)
    for (i=0; i<contractrequests.length; i++) {
        if (contractrequests[i].statusCounter == "5" && contractrequests[i].assignedAttorney._id.toString() == loggedInAttorney.toString()){
            waiting.all++
            if (contractrequests[i].requestDate.getMonth() == month && contractrequests[i].requestDate.getDate() == day && contractrequests[i].requestDate.getFullYear() == year){
                waiting.today++
            }
        }
    }
}

function getAttorneyToReview (month, day, year, contractrequests, toreview, loggedInAttorney) {
    //get number of waiting requests (staff)
    for (i=0; i<contractrequests.length; i++) {
        if (contractrequests[i].statusCounter == "6" && contractrequests[i].assignedAttorney._id.toString() == loggedInAttorney.toString()){
            toreview.all++
            if (contractrequests[i].requestDate.getMonth() == month && contractrequests[i].requestDate.getDate() == day && contractrequests[i].requestDate.getFullYear() == year){
                toreview.today++
            }
        }
    }
}

const oulccontroller = {

    getDashboard: async (req, res) => {
        try {

            console.log ("DASHBOARD" + JSON.stringify(req.session));
            console.log ("DASHBOARD" + req.session.role);

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
                .sort()
                .exec();

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

            if (req.session.role == "Staff"){
                //made this as a function so we can use the getDashboard for both attorney and staff. We will just change the function depending on the user
                getStaffWaiting(month, day, year, contractrequests, waiting); //get number of waiting request for staff
                getStaffToReview(month, day, year, contractrequests, toreview); //get number of to review request for staff
            }
            else if (req.session.role == "Attorney"){
                //made this as a function so we can use the getDashboard for both attorney and staff. We will just change the function depending on the user
                getAttorneyWaiting(month, day, year, contractrequests, waiting, req.user._id); //get number of waiting request for attorney
                getAttorneyToReview(month, day, year, contractrequests, toreview, req.user._id); //get number of to review request for attorney
               
            }
            
    
            res.render('dashboardoulc', {
                user_role:req.session.role,
                pending: pending,
                waiting: waiting,
                toreview: toreview,
                cleared: clearedCard,
                initialReview: initialReview,
                legalReview: legalReview,
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

            //console.log ("DASHBOARD" + JSON.stringify(req.session));
            //console.log ("DASHBOARD" + req.session.role);
            var startdate = req.body.startdate;
            var enddate = req.body.enddate;

            console.log(startdate + " until " + enddate);

            //const contractrequests = await ContractRequest.find({requestDate: dateToday}).lean()
            const contractrequests = await ContractRequest.find({requestDate: {$gte: new Date(startdate).toISOString(), $lte: new Date(enddate).toISOString()}}).lean()
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
                .sort()
                .exec();

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

            if (req.session.role == "Staff"){
                //made this as a function so we can use the getDashboard for both attorney and staff. We will just change the function depending on the user
                getStaffWaiting(month, day, year, contractrequests, waiting); //get number of waiting request for staff
                getStaffToReview(month, day, year, contractrequests, toreview); //get number of to review request for staff
            }
    
            res.render('dashboardoulc', {
                user_role:req.session.role,
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
                user_role: req.session.role,
                contracttypes: contracttypes,
                repositoryFiles: repositoryFiles
            });

        } catch (err) {
            console.log(err);
        }
    },

    getSpecificRepositoryFile: async (req, res) => {
        try {

            var path = req.path.split('/')[2];
            var val = "test";

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
                user_role: req.session.role,
                repositoryFile: repositoryFile

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

    },

    deleteRepositoryFile: async (req, res) => {
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
    }

}

module.exports = oulccontroller;