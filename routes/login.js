const assert = require('assert');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;
// passport config
const db = require('../config/database').database;

const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo');
const User = require('../models/User');

/* Requiring body-parser package  
to fetch the data that is entered 
by the user in the HTML form.*/

const bodyParser = require("body-parser");

// Telling our Node app to include all these modules
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
require('../config/passport')(passport);

const logincontroller = require('../controller/logincontroller.js');
const resetpasswordcontroller = require('../controller/resetpasswordcontroller.js');
const oulccontroller = require('../controller/oulccontroller.js');

router.use(bodyParser.urlencoded({ extended: true }));


router.use(session({
    secret: "long secret key",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.DB_CONNECTION,
        ttl: 2 * 24 * 60 * 60
    })
}));

// Initializing Passport
router.use(passport.initialize());

// Starting the session
router.use(passport.session());


//For dynamic Nav Bar
router.use(function(req,res,next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

// multer to accept images
const multer = require('multer');
const specificrequestcontroller = require('../controller/specificrequestcontroller');
const negotiationcontroller = require('../controller/negotiationcontroller');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/img/');
    },
    filename: function(req, file, cb) {
        cb(null, filename = Date.now() + file.originalname);
    }
});

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024*1024*5
    }
});


router.use(require('connect-flash')());

// render login page
router.get('/', logincontroller.getLogin);

// post login handle
router.post('/logcheck', logincontroller.postLogCheck);

router.get('/error', logincontroller.getError);

router.get('/getCheckEmail', logincontroller.getCheckEmail);

// post/register new user to database
router.post('/insert', upload.single('imageprof'), logincontroller.postInsert);

// render reset password page
router.get('/resetpassword/:id', resetpasswordcontroller.getResetPassword);
router.post('/changepassword', resetpasswordcontroller.resetPassword);

// render forgotpassword page
router.get('/forgotpassword', logincontroller.getForgotPassword);

// render sendresetpassword page
router.post('/forgotpasswordconfirmation', logincontroller.postForgotPassword);

// render third party negotiation page
router.get('/thirdparty/:id/:id', negotiationcontroller.getThirdPartyNegotiation);

// set reviewed documents for a specific contract request
router.get('/setrevieweddocuments', specificrequestcontroller.setReviewedDocuments);

// set reviewed documents for a specific contract request
router.get('/getcontractversions', specificrequestcontroller.getContractVersions);

router.get('/addtag', oulccontroller.addTag);
router.get('/removetag', oulccontroller.removeTag);

// Messages
router.get('/sendmessage', specificrequestcontroller.sendMessage);

// For changes to feedback
router.get('/savependingfeedbackchanges', oulccontroller.savePendingFeedback);
router.get('/getpendingfeedbacks', oulccontroller.getPendingFeedbacks);

module.exports = router;