const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const User = require('../models/User.js');
const ContractRequest = require('../models/ContractRequest.js');
const Feedback = require('../models/Feedback.js');
const Contract = require('../models/Contract.js');
const ContractVersion = require('../models/ContractVersion.js');
const ReferenceDocument = require('../models/ReferenceDocument.js');
const Conversation = require('../models/Conversation.js');
const Message = require('../models/Message.js');
const Status = require('../models/Status.js');
const { ObjectId } = require('mongoose');
const Thirdparty = require('../models/Thirdparty.js');

const negotiationcontroller = {

}

module.exports = negotiationcontroller;