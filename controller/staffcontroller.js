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

// Connecting mongoose to our database 
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Mongo DB connected!'))
    .catch(err => console.log(err));

// const conn = mongoose.connection;
// let gfs;

// conn.once('open',() => {
//     gfs = Grid(conn, mongoose.mongo);
//     gfs.collection('uploads');
// });

// //create storage object
// const storage = new GridFsStorage({
//     db: promise,
//     file: (req, file) => {
//       return new Promise((resolve, reject) => {
//         crypto.randomBytes(16, (err, buf) => {
//           if (err) {
//             return reject(err);
//           }
//           const filename = buf.toString('hex') + path.extname(file.originalname);
//           const fileInfo = {
//             filename: filename,
//             bucketName: 'uploads'
//           };
//           resolve(fileInfo);
//         });
//       });
//     }
// });

// // Set multer storage engine to the newly created object
// const upload = multer({ storage });

const staffcontroller = {


    getStaffDashboard: async (req, res) => {
        try {

            // const userlogged = await User.findOne({ email: req.user.email }).lean()
            // .populate({
                // path: 'role'
            // }).exec();
    
            // console.log(userlogged);
            res.render('dashboardoulc', {
                user_role:req.session.role
            });

        } catch (err) {
            console.log(err);
        }
    },

    getRequests: async (req, res) => {
        try {

            const contractrequests = await ContractRequest.find({}).lean()
                .populate({
                    path: 'requester',
                    populate: {
                        path: 'department'
                      } 
                })
                .populate({
                    path: 'contractType'
                })
                .populate({
                    path: 'asssignedAttorney'
                })
                .sort({requestDate: 1})
                .exec();

                for (i = 0; i < contractrequests.length; i++) {
                    const statusList = await Status.findOne({counter: contractrequests[i].statusCounter}).exec();
                    contractrequests[i].status = statusList.statusStaff;

                    // var date1 = contractrequests[i].requestDate;
                    // var date2 = contractrequests[i].effectivityStartDate;
                      
                    // To calculate the time difference of two dates
                    var Difference_In_Time = contractrequests[i].effectivityStartDate.getTime() - contractrequests[i].requestDate.getTime();
                      
                    // To calculate the no. of days between two dates
                    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                    // To set number of days gap in contract request
                    contractrequests[i].daysGap = Difference_In_Days;
                }

            const contracttypes = await ContractType.find({}).lean().exec();
    
            res.render('requestsoulc', {
                user_role:req.session.role,
                contracttypes: contracttypes,
                contractrequests: contractrequests
            });

        } catch (err) {
            console.log(err);
        }
    },
    getTemplates: async (req, res) => {
        try {

            const contracttypes = await ContractType.find({}).lean().exec();
    
            res.render('templatesoulc', {
                user_role: req.session.role,
                contracttypes: contracttypes
            });

        } catch (err) {
            console.log(err);
        }
    },

    uploadTemplate: async (req, res) => {
        try {

            res.json({ file: req.file});
            
        } catch (err) {
            console.log(err);
        } 
    }
}

module.exports = staffcontroller;