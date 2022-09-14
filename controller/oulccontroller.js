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

const oulccontroller = {

    // add others that have the same implementation for both office staff and attorney (e.g. templates and repository)


    postDeleteTemplate: async (req, res) => {
        try {
            console.log("Inside Delete Template");
            
            var templateid = req.body.deleteTemplate;
            await Template.findOneAndDelete({_id: templateid})
            .exec();

            res.redirect('back');

        } catch (err) {
            console.log(err);
        }
    }

}

module.exports = oulccontroller;