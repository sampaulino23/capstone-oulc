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
const Role = require('../models/Role.js');

/* Requiring body-parser package  
to fetch the data that is entered 
by the user in the HTML form.*/

const bodyParser = require("body-parser");

// Telling our Node app to include all these modules
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
require('../config/passport')(passport);

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

// Connecting mongoose to our database 
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Mongo DB connected!'))
    .catch(err => console.log(err));


const logincontroller = {

    getLogin: function (req, res) {
        res.render('login', {
            // profileurl: '/profile/' + req.session.uname,
            pagename: 'Log In',
            title: 'Log In'
        });
    },

    getError: function (req, res) {
        res.render('loginerror', {
            pagename: 'Log In',
            title: 'Log In'
        });
    },

    getForgotPassword: function (req, res) {
        res.render('forgotpassword', {
            pagename: 'Forgot Password',
            title: 'Forgot Password'
        });
    },

    postInsert: async (req, res, next) => {
        var createUserID;
        var ObjectId = require('mongodb').ObjectID;
        var profileURL;

        const role = await Role.findOne({name: "Administrator"}).exec();
        console.log(role._id);

        var user = new User({
            fullName: "Samantha Paulino",
            email: "admin@oulc.com",
            password: "pass1234",
            role: role._id,
            isActive: true,
        });

        // hash the password
        bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) throw err;
                user.password = hash;
                console.log(user.password);
            })
        );

        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('test');

            db.collection('users').insertOne(user, function (err, result) {
                if (err) throw err;
                client.close();
                res.redirect('back');
            });
        });

    },

    postLogCheck: function (req, res) {

        const userToBeChecked = new User({
            email: req.body.email,
            password: req.body.password
        });
        // Checking if user if correct or not

        req.login(userToBeChecked, function (err) {
            if (err) {
                console.log(err);
                res.redirect('/login/error');
            }
            else {
                passport.authenticate("local", { failureRedirect: '/login/error', failureMessage: true })
                    (req, res, function () {
                        User.find({ email: req.user.email },
                            function (err, docs) {
                                if (err) {
                                    console.log(err);
                                }
                                else if (!req.user.isActive){
                                    res.redirect('/login/error');
                                }
                                else {
                                    console.log("credentials are correct");
                                    res.redirect('/admin/usermanagement');
                                }
                            });
                    });
            }
        })
    },

    getCheckEmail: function (req, res) {
        var email = req.query.email;

        mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function (err, db) {
            assert.equal(null, err);
            db.collection('users').findOne({ email: email }, 'email', function (err, result) {
                assert.equal(null, err);
                res.send(result);
            });
        });
    }

}

module.exports = logincontroller;













