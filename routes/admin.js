const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const url = 'mongodb+srv://admin:admin>@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';

const MongoStore = require('connect-mongo');
const admincontroller = require('../controller/admincontroller.js');

//passport config
require('../config/passport')(passport);

//DB Config
const db =require('../config/database').database;



router.use(bodyParser.urlencoded({ extended: true }));

//For dynamic Nav Bar
router.use(function(req,res,next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

//express session middleware as of Mar 23 based on Chris Courses set to false daw yung dalawa
//eto yung gumagawa ng session
router.use(session({
    secret: 'fsfdfghgfhdfgbfb',
    resave:true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DB_CONNECTION,
        ttl: 2 * 24 * 60 * 60
            })

    //cookie: {secure: true}
}));

// Passport Middleware
router.use(passport.initialize());
router.use(passport.session());





// multer to accept images
const multer = require('multer');

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

// TO BE USED FOR CHECKING IF ADMINISTRATOR USER
// function checkAdmin(req,res,next){
    // if(req.user.email == "admin@oulc.com"){

        // console.log(req.user);
        // next();
    // } else{
        // res.send("Unauthorized Access");
    // }
// }


router.use(require('connect-flash')());

// render add user page
router.get('/adduser', admincontroller.getAddUser);

// post add user
router.post('/adduser', admincontroller.postAddUser);

// render user management page
router.get('/usermanagement', admincontroller.getUserManagement);

router.get('/disableuser', admincontroller.disableUser);

router.get('/enableuser', admincontroller.enableUser);

router.get('/edituser', admincontroller.getEditUserDetails);

router.post('/edituser', admincontroller.postEditUserDetails);

//router.post('/resetpassword', admincontroller.resetPassword);


passport.serializeUser((user_id, done) =>{
    done(null, user_id);
});
passport.deserializeUser((user_id, done) =>{
    done(null, user_id);
});




module.exports = router;