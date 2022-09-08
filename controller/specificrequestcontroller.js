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


const specificrequestcontroller = {


    getStaffSpecificRequest: async (req, res) => {
        try {

          
            res.render('specificrequest', {
                user_role:req.session.role
            });

        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = specificrequestcontroller;