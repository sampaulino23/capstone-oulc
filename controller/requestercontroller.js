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

const requestercontroller = {

    getHome: async (req, res) => {
        try {
           
            res.render('requesterhome', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName
            });

        } catch (err) {
            console.log(err);
        }
    },

    getCreateRequest: async (req, res) => {
        try {
           
            res.render('createrequest', {
                user_fullname:req.user.fullName,
                user_role:req.user.roleName
            });

        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = requestercontroller;