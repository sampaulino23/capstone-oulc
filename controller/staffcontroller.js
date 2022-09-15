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

const staffcontroller = {


    getStaffDashboard: async (req, res) => {
        try {

            // const userlogged = await User.findOne({ email: req.user.email }).lean()
            // .populate({
                // path: 'role'
            // }).exec();
    
            // console.log(userlogged);
            res.render('dashboardoulc', {
                user_role:req.session.role
            });

        } catch (err) {
            console.log(err);
        }
    },

    getRequests: async (req, res) => {
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
                .sort({requestDate: 1})
                .exec();

                for (i = 0; i < contractrequests.length; i++) {
                    const statusList = await Status.findOne({counter: contractrequests[i].statusCounter}).exec();
                    contractrequests[i].status = statusList.statusStaff;

                    // var date1 = contractrequests[i].requestDate;
                    // var date2 = contractrequests[i].effectivityStartDate;
                      
                    // To calculate the time difference of two dates
                    var Difference_In_Time = contractrequests[i].effectivityStartDate.getTime() - contractrequests[i].requestDate.getTime();
                      
                    // To calculate the no. of days between two dates
                    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                    // To set number of days gap in contract request
                    contractrequests[i].daysGap = Difference_In_Days;
                }

            const contracttypes = await ContractType.find({}).lean().exec();
    
            res.render('requestsoulc', {
                user_role:req.session.role,
                contracttypes: contracttypes,
                contractrequests: contractrequests
            });

        } catch (err) {
            console.log(err);
        }
    },
    getTemplates: async (req, res) => {
        try {

            const contracttypes = await ContractType.find({}).lean().exec();
            const templates = await Template.find({}).lean()
                .populate({
                    path: 'type'
                }).exec();
    
            res.render('templatesoulc', {
                user_role: req.session.role,
                contracttypes: contracttypes,
                templates: templates
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
    }
}

module.exports = staffcontroller;