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

const oulccontroller = {

    getDashboard: async (req, res) => {
        try {

            console.log ("DASHBOARD" + req.session);
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
                    path: 'asssignedAttorney'
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
            // console.log(month + " " + day + " " + year);

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
                contractTypes: contractTypes
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

                const cursor = await gridfsBucket.find({filename: template.wordFileName}, {limit: 1});
                cursor.forEach((doc, err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(doc);
                        gridfsBucket.delete(doc._id);
                    }
                });

                const cursor2 = await gridfsBucket.find({filename: template.pdfFileName}, {limit: 1});
                cursor2.forEach((doc, err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(doc);
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

        console.log('View template on click');

        const templateid = req.query.templateid;

        const template = await Template.findById(templateid).exec();

        console.log(template.pdfFileName);

        res.send({
            pdfFileName: template.pdfFileName
        })

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
                if (file[0].contentType === 'application/pdf') {
                    // Read output to browser
                    const readstream = gridfsBucket.openDownloadStream(file[0]._id);
                    readstream.pipe(res);
                } else {
                    res.status(404).json({
                        err: 'Not a pdf document'
                    });
                }
            });

        } catch (err) {
            console.log(err);
        }
    },

    uploadTemplate: async (req, res) => {
        try {

            const templateTitle = req.body.title;
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
                                  'Authorization': 'Bearer pdf_live_qIwmoNBh0yB5LOWeRv78cKXDMFW9PKvF3ELZfHqV0Oq'
                              }),
                              responseType: "stream"
                            })
                        
                            // response.data.pipe(fs.createWriteStream("result.pdf"))

                            // generate pdf filename using crypto module
                            const buf = crypto.randomBytes(16);
                            var pdfFilename = buf.toString('hex') + '.pdf';

                            // upload pdf file to gridfsbucket
                            response.data.pipe(gridfsBucket.openUploadStream(pdfFilename, {contentType: 'application/pdf'}));

                            // create template object
                            const newTemplate = new Template({
                                name: templateTitle,
                                type: mongoose.Types.ObjectId(contractType._id),
                                uploadDate: fileuploaddate,
                                isWordFile: true,
                                wordFileName: filename,
                                pdfFileName: pdfFilename
                            });

                            console.log('0');
        
                            // insert template object to db
                            newTemplate.save(function(){
                                console.log('3');
                                res.redirect('back');
                            });

                          } catch (e) {
                            const errorString = await streamToString(e.response.data)
                            console.log(errorString)
                          }
                        })()

                        // fs.createReadStream('result.pdf').
                        //   pipe(gridfsBucket.openUploadStream('myfile'));

                        console.log('1');
                        
                        function streamToString(stream) {
                          const chunks = []
                          return new Promise((resolve, reject) => {
                            stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
                            stream.on("error", (err) => reject(err))
                            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
                          })
                        }
                    });

                    console.log('2');

                } else if (doc.contentType === 'application/pdf') {
                    console.log(doc);
                    console.log('pdf');

                    const newTemplate = new Template({
                        name: templateTitle,
                        type: mongoose.Types.ObjectId(contractType._id),
                        uploadDate: fileuploaddate,
                        isWordFile: false,
                        pdfFileName: filename
                    });

                    newTemplate.save(function(){
                        console.log('3');
                        res.redirect('back');
                    });
                }
            });
            
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

    getDownloadTemplate: async (req, res) => {
        try {

            const filename = req.params.filename;

            console.log(filename);

            const cursor = gridfsBucket.find({filename: filename});
            cursor.forEach((doc, err) => {
                if (err) {
                    console.log(err);
                }
                console.log(doc);

                const downStream = gridfsBucket.openDownloadStreamByName(doc.filename);

                // res.setHeader('Content-Type', 'application/pdf');
                // res.setHeader('Content-Disposition', `attachment; filename=${doc.filename}`);

                downStream.pipe(res);
            });

        } catch (err) {
            console.log(err);
        } 
    },

    getRepository: async (req, res) => {
        try {

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
                repositoryFiles: repositoryFiles
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
    }
}

module.exports = oulccontroller;