const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoURI = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';

const MongoStore = require('connect-mongo');
const staffcontroller = require('../controller/staffcontroller.js');
const oulccontroller = require('../controller/oulccontroller.js');

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
  gfs.collection('templates');
});

const storage = new GridFsStorage({
  db: promise,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'templates'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

router.use(require('connect-flash')());

router.get('/', oulccontroller.getDashboard);
router.get('/contractrequests', staffcontroller.getRequests);
router.get('/templates', staffcontroller.getTemplates);
router.get('/FAQs', oulccontroller.getFAQs);
router.get('/policy', oulccontroller.getPolicy);
router.post('/uploadtemplate', upload.single('file'), oulccontroller.uploadTemplate);
router.post('/deletetemplate', oulccontroller.postDeleteTemplate);
router.post('/replacetemplate', upload.single('file'), oulccontroller.postReplaceTemplate);
router.get('/downloadtemplate/:fileid', oulccontroller.getDownloadTemplate);
router.get('/viewtemplate', oulccontroller.viewTemplateOnClick);
router.get('/template/:fileid', oulccontroller.viewTemplate);
router.get('/repository', oulccontroller.getRepository);
router.get('/viewFile/:id', oulccontroller.getSpecificRepositoryFile);
router.get('/downloadrepositoryfile/:fileid', oulccontroller.downloadRepositoryFile);
router.post('/deleterepositoryfile/:fileid', oulccontroller.deleteRepositoryFile);
router.get('/repositoryfile/:fileid', oulccontroller.viewRepositoryFile);
router.get('/policyversions/:id', oulccontroller.getPolicyVersions);

// post syntax
// router.post('/adduser', staffcontroller.postAddUser);

passport.serializeUser((user_id, done) =>{
    done(null, user_id);
});
passport.deserializeUser((user_id, done) =>{
    done(null, user_id);
});




module.exports = router;