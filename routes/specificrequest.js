const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoURI = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';

const MongoStore = require('connect-mongo');
const specificrequestcontroller = require('../controller/specificrequestcontroller.js');

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
let gfs;

conn.once('open',() => {
  gfs = Grid(conn, mongoose.mongo);
  gfs.collection('repository');
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
const upload = multer({ storage });

router.use(require('connect-flash')());

// staff start
router.get('/staff/:id', specificrequestcontroller.getStaffSpecificRequest);

router.get('/forlegalreview', specificrequestcontroller.forLegalReview);

router.post('/forrevision/staff', specificrequestcontroller.postForRevisionStaff);
// staff end

// attorney start
router.post('/forrevision/attorney', specificrequestcontroller.postForRevisionAttorney);
router.get('/approveRequest', specificrequestcontroller.markAsCleared);
// attorney end

// requesting office start
router.post('/uploadRepositoryFile', upload.single('file'), specificrequestcontroller.postUploadRepositoryFile);
// requesting office end

conn.once('open',() => {
  gfs = Grid(conn, mongoose.mongo);
  gfs.collection('requestdocuments');
});

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
router.post('/uploadrequestdocs', uploadRequestDocs.fields([
  { name: 'contractFiles'},
  { name: 'refDocFiles' }
]), specificrequestcontroller.postUploadRequestDocuments);

// view file on contract request
router.get('/viewfile/:fileid', specificrequestcontroller.viewFile);

passport.serializeUser((user_id, done) =>{
    done(null, user_id);
});
passport.deserializeUser((user_id, done) =>{
    done(null, user_id);
});




module.exports = router;