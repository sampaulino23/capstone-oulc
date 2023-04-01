const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoURI = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';

const MongoStore = require('connect-mongo');
const specificrequestcontroller = require('../controller/specificrequestcontroller.js');

const ContractRequest = require('../models/ContractRequest');

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

// multer to accept files
const path = require('path');
const crypto = require('crypto');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const multer = require('multer');
const { join } = require('path');

const promise = mongoose.connect(mongoURI, { useNewUrlParser: true });

const conn = mongoose.connection;
let gfs, gfsRequestDocs;

conn.once('open',() => {
  gfs = Grid(conn, mongoose.mongo);
  gfs.collection('repository');

  gfsRequestDocs = Grid(conn, mongoose.mongo);
  gfsRequestDocs.collection('requestdocuments');

  gfsNegotiation = Grid(conn, mongoose.mongo);
  gfsNegotiation.collection('negotiation');
});

const storage = new GridFsStorage({
  db: promise,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'repository'
        };
        resolve(fileInfo);
      });
    });
  }
});

const negotiationStorage = new GridFsStorage({
  db: promise,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'negotiation'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });
const negotiationUpload = multer({ storage : negotiationStorage });

router.use(require('connect-flash')());

// staff start
router.get('/staff/:id', specificrequestcontroller.getStaffSpecificRequest);
router.get('/assignStaff', specificrequestcontroller.assignStaff);
router.get('/assignAttorney', specificrequestcontroller.assignAttorney);


router.get('/forlegalreview', specificrequestcontroller.forLegalReview);

router.post('/forrevision/staff', specificrequestcontroller.postForRevisionStaff);
// staff end

// attorney start
function checkAttorney(req,res,next){
  if(req.user.roleName == "Attorney"){
      //req.isAuthenticated() will return true if user is logged in
      next();
  } else{
      res.redirect("/unavailable");
  }
}

router.get('/attorney/:id', checkAttorney, specificrequestcontroller.getStaffSpecificRequest);
router.post('/forrevision/attorney', checkAttorney, specificrequestcontroller.postForRevisionAttorney);
router.get('/approveRequest', checkAttorney, specificrequestcontroller.markAsCleared);
router.post('/revisionHistory', checkAttorney, specificrequestcontroller.getRevisionHistory);
router.post('/comparerevisionhistory', checkAttorney, specificrequestcontroller.compareRevisionHistory);
router.get('/routeattorney', checkAttorney, specificrequestcontroller.routeToAnotherAttorney);
// attorney end

// add 3rd party
router.post('/addthirdparty', specificrequestcontroller.postAddThirdParty);

//send message
//router.get('/sendmessage', specificrequestcontroller.sendMessage);

// requesting office start
function checkRequester(req, res, next){
  if(req.user.roleName == "Requester"){
      //req.isAuthenticated() will return true if user is logged in
      next();
  } else {
      res.redirect("/unavailable");
  }
}

// This is to check if the requester is the one assigned to the contract request
async function checkAssignedRequester(req, res, next){
  let contractRequest = await ContractRequest.findById(req.params.id).exec();

  console.log(contractRequest.requester);
  console.log(req.user._id);

  if(String(req.user._id) == String(contractRequest.requester)){
    next();
  } else {
    res.redirect("/unavailable");
  }
}

router.post('/uploadRepositoryFile', upload.fields([
  { name: 'signedContractFiles'},
  { name: 'signedInstitutionalFiles' }
]), specificrequestcontroller.postUploadRepositoryFile);
router.post('/uploadNegotiationFile', negotiationUpload.fields([
  { name: 'negotiationFiles'}
]), specificrequestcontroller.postUploadNegotiationFile);
router.get('/requester/:id', checkRequester, /*checkAssignedRequester,*/ specificrequestcontroller.getRequesterSpecificRequest);
router.get('/cancelRequest', specificrequestcontroller.cancelRequest);
// requesting office end

// conn.once('open',() => {
//   gfs = Grid(conn, mongoose.mongo);
//   gfs.collection('requestdocuments');
// });

const storageRequestDocs = new GridFsStorage({
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

const uploadRequestDocs = multer( {
  storage: storageRequestDocs,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if(ext !== '.pdf' && ext !== '.doc' && ext !== '.docx') {
        return callback('Only .PDF .DOC .DOCX are allowed')
    }
    callback(null, true)
},
} );

// upload request documents
// router.post('/uploadrequestdocs', uploadRequestDocs.fields([
//   { name: 'contractFiles'},
//   { name: 'refDocFiles' }
// ]), specificrequestcontroller.postUploadRequestDocuments);

// view file on contract request
router.get('/viewfile/:fileid', specificrequestcontroller.viewFile);

passport.serializeUser((user_id, done) =>{
    done(null, user_id);
});
passport.deserializeUser((user_id, done) =>{
    done(null, user_id);
});




module.exports = router;