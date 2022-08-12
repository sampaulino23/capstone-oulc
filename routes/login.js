const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const url = 'mongodb+srv://test:test@cluster0.tcgdc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const MongoStore = require('connect-mongo')(session);
const logincontroller = require('../controller/logincontroller.js');

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
    store: new MongoStore({ mongooseConnection: mongoose.connection,
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


router.use(require('connect-flash')());

// render login page
router.get('/', logincontroller.getLogin);

// post login handle
router.post('/logcheck', logincontroller.postLogCheck);

// render register page
router.get('/register', logincontroller.getRegister);

router.get('/error', logincontroller.getError);

router.get('/privacypolicy', logincontroller.getPrivacyPage);

router.get('/getCheckEmail', logincontroller.getCheckEmail);

// post/register new user to database
router.post('/insert', upload.single('imageprof'), logincontroller.postInsert);




passport.serializeUser((user_id, done) =>{
    done(null, user_id);
});
passport.deserializeUser((user_id, done) =>{
    done(null, user_id);
});




module.exports = router;