const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const User = require('../models/User.js');
const ContractRequest = require('../models/ContractRequest.js');
const ContractType = require('../models/ContractType.js');
const Status = require('../models/Status.js');
const Role = require('../models/Role.js');
const Department = require('../models/Department.js');
const { ObjectId } = require('mongoose');

// Connecting mongoose to our database 
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Mongo DB connected!'))
    .catch(err => console.log(err));


const specificrequestcontroller = {


    getStaffSpecificRequest: async (req, res) => {
        try {

            var path = req.path.split('/')[2];

            console.log(path);

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
                }

                // console.log(contractrequest);

          
            res.render('specificrequest', {
                user_role:req.session.role,
                contractrequest: contractrequest
            });

        } catch (err) {
            console.log(err);
        }
    },

    forLegalReview: async (req, res) => {
        try {
            console.log("Inside For Legal Review");
            var userid = req.query.userid;
            await ContractRequest.findOneAndUpdate({ _id: userid }, { $set: { statusCounter: 4} });

        } catch (err) {
            console.log(err);
        }
    },
    postForRevisionStaff: async (req, res) => {
        try {
            console.log("Inside For Revision Office Staff");
            var feedback = req.body.addStaffFeedback;
            var id = req.body.addStaffFeedbackID;
            
            res.redirect('back');
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = specificrequestcontroller;