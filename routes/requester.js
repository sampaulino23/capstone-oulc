const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoURI = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const staffcontroller = require('../controller/staffcontroller.js');
const oulccontroller = require('../controller/oulccontroller.js');

const MongoStore = require('connect-mongo');
const requestercontroller = require('../controller/requestercontroller.js');

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
router.use(require('connect-flash')());

// multer to accept files
const path = require('path');
const crypto = require('crypto');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const multer = require('multer');
const { join } = require('path');

const promise = mongoose.connect(mongoURI, { useNewUrlParser: true });

const conn = mongoose.connection;
let gfs;

conn.once('open',() => {
    gfs = Grid(conn, mongoose.mongo);
    gfs.collection('requestdocuments');
});

const storage = new GridFsStorage({
    db: promise,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
          const filename = file.originalname;
          const fileInfo = {
            filename: filename,
            bucketName: 'requestdocuments'
          };
          resolve(fileInfo);
      });
    }
});

const upload = multer( {
    storage: storage,
    fileFilter: function (req, file, callback) {
      var ext = path.extname(file.originalname);
      if(ext !== '.pdf' && ext !== '.doc' && ext !== '.docx') {
          return callback('Only .PDF .DOC .DOCX are allowed')
      }
      callback(null, true)
  },
});

function checkRequester(req,res,next){
    if(req.user.roleName == "Requester"){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/unavailable");
    }
}

router.get('/', requestercontroller.getHome);
router.get('/templates', checkRequester, staffcontroller.getTemplates);
router.get('/violationreport', checkRequester, requestercontroller.getViolationReport);
router.post('/violationreportdate', checkRequester, requestercontroller.getViolationReportDate);
router.get('/FAQs', checkRequester, oulccontroller.getFAQs);
router.get('/repository', checkRequester, requestercontroller.getRepository);
router.get('/policy', checkRequester, oulccontroller.getPolicy);
router.get('/contractrequests', checkRequester, staffcontroller.getRequests);
router.get('/createrequest', checkRequester, requestercontroller.getCreateRequest);
router.post('/createcontractrequest', upload.fields([
    { name: 'contractFiles'},
    { name: 'refDocFiles' }
]), requestercontroller.postCreateRequest);
router.get('/requestreceipt/:id', checkRequester, requestercontroller.getRequestReceipt);
router.get('/checkstagingcontractversion', requestercontroller.checkStagingContractVersion);
router.post('/uploadnewversion', upload.single('newVersionFile'), requestercontroller.uploadNewVersion);
router.post('/deletestagingcontractversion/:id', requestercontroller.deleteStagingContractVersion);
router.post('/submitrevision', requestercontroller.submitRevision);
router.post('/deletenegotiationfile', requestercontroller.postDeleteNegotiationFile);
router.get('/downloadNegotiationFile/:fileid', requestercontroller.getDownloadNegotiationFile);
router.get('/issuelog', checkRequester, oulccontroller.getIssueLog);
router.post('/createissue', requestercontroller.postCreateIssue);
router.post('/createissuerequest', requestercontroller.postCreateIssueRequest);
router.get('/negotiation/:fileid', requestercontroller.viewNegotiationFile);

passport.serializeUser((user_id, done) =>{
    done(null, user_id);
});
passport.deserializeUser((user_id, done) =>{
    done(null, user_id);
});

module.exports = router;