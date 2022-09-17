

const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// const {
//     pipe,
//     gotenberg,
//     convert,
//     office,
//     to,
//     landscape,
//     set,
//     filename,
//     please,
// } = require('gotenberg-js-client');

// const toPDF = pipe(
//     gotenberg('http://localhost:3000'),
//     convert,
//     office,
//     to(landscape),
//     set(filename('result.pdf')),
//     please
// );

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

                const cursor = await gridfsBucket.find({filename: template.wordFileName}, {limit: 1});
                cursor.forEach((doc, err) => {
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

            const cursor = gridfsBucket.find({_id: file_id});
            cursor.forEach(async (doc, err) => {
                if (err) {
                    console.log(err);
                } else if (doc.contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || doc.contentType === 'application/msword') {
                    console.log(doc);
                    console.log('word');
                    const writableStream = fs.createWriteStream('./word_file.docx');

                    const downStream = gridfsBucket.openDownloadStream(doc._id);
                    downStream.pipe(writableStream);
                        // .pipe(gridfsBucket.openUploadStream('outputFile.docx')));

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
                        
                            response.data.pipe(fs.createWriteStream("result.pdf"))
                          } catch (e) {
                            const errorString = await streamToString(e.response.data)
                            console.log(errorString)
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

                    const newTemplate = new Template({
                        name: filename,
                        type: mongoose.Types.ObjectId(contractType._id),
                        uploadDate: fileuploaddate,
                        wordFileName: filename,
                        pdfFileName: filename
                    });

                    newTemplate.save();

                } else if (doc.contentType === 'application/pdf') {
                    console.log(doc);
                    console.log('pdf');

                    const newTemplate = new Template({
                        name: filename,
                        type: mongoose.Types.ObjectId(contractType._id),
                        uploadDate: fileuploaddate,
                        wordFileName: filename,
                        pdfFileName: filename
                    });

                    newTemplate.save();
                }
            });

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
                downStream.pipe(res);
            });

        } catch (err) {
            console.log(err);
        } 
    }
}

module.exports = oulccontroller;