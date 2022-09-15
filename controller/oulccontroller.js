const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

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

const oulccontroller = {

    // add others that have the same implementation for both office staff and attorney (e.g. templates and repository)

    postDeleteTemplate: async (req, res) => {
        try {
            console.log("Inside Delete Template");
            
            const templateid = req.body.deleteTemplate;

            const template = await Template.findByIdAndDelete(templateid).exec();

            console.log(template);

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

            console.log(file_id);

            const newTemplate = new Template({
                name: filename,
                type: mongoose.Types.ObjectId(contractType._id),
                uploadDate: fileuploaddate,
                file: file_id
            });

            console.log(newTemplate);

            await newTemplate.save();

            res.redirect('back');
            
        } catch (err) {
            console.log(err);
        } 
    },

    replaceTemplate: async (req, res) => {
        try {

            // const contractTypeInput = req.body.contractType;

            // const contractType = await ContractType.findOne({name: contractTypeInput}).exec();

            // const filename = req.file.filename;
            // const file_id = mongoose.Types.ObjectId(req.file._id);
            // const fileuploaddate = req.file.uploadDate;

            // console.log(file_id);

            // const newTemplate = new Template({
            //     name: filename,
            //     type: mongoose.Types.ObjectId(contractType._id),
            //     uploadDate: fileuploaddate,
            //     file: file_id
            // });

            // console.log(newTemplate);

            // await newTemplate.save();

            res.redirect('back');
            
        } catch (err) {
            console.log(err);
        } 
    }

    

}

module.exports = oulccontroller;