const User = require('../models/User');
const assert = require('assert');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcryptjs');
const passport = require('passport');

// passport config
require('../config/passport')(passport);

const db =require('../config/database').database;

//connect to mongo
mongoose.connect(url,{useNewUrlParser: true,useUnifiedTopology: true })
    .then(() => console.log('Mongo DB connected!'))
    .catch(err => console.log(err));

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));


router.use(passport.initialize());
router.use(passport.session());



const logincontroller = {
    getLogin: function (req,res) {
        res.render('login', {
            // profileurl: '/profile/' + req.session.uname,
            pagename: 'Log In',
            title: 'Log In'
        });
    },

    getError: function (req,res) {
        res.render('loginerror', {
            pagename: 'Log In',
            title: 'Log In'
        });
    },

    getPrivacyPage: function (req,res) {
        res.render('privacy', {
            title: 'Privacy Policy'
        });
    },

    postLogCheck: function (req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) {
              return next(err); // will generate a 500 error
            }
            // Generate a JSON response reflecting authentication status
            if (! user) {
              return res.redirect('/login/error')
            }

            req.login(user, loginErr => {
              if (loginErr) {
                return next(loginErr);
              }
              else {
                return res.redirect('/');
              }
              
            });      
          })(req, res, next);
    },


 

    getCheckEmail: function(req, res) {
        var email = req.query.email;

        mongoose.connect(url, { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function(err, db) {
            assert.equal(null, err);
            db.collection('users').findOne({email: email}, 'email', function (err,result) {
                assert.equal(null, err);
                res.send(result);
            });
        });
    },

    getRegister: function (req,res) {

        res.render('signup', {
            pagename: 'Sign Up',
            title: 'Sign Up'
        });
    },

    postInsert: function(req,res, next) {
        var createUserID;
        var ObjectId = require('mongodb').ObjectID;
        var profileURL;

        var user = new User({
            user_fullname: "Samantha Paulino",
            user_email: "admin@oulc.com",
            user_pass: "pass1234",
            user_role: "Administrator",
            isActive: true,
            url: 'blank',
        });
    
        // hash the password
        bcrypt.genSalt(10, (err, salt) => 
            bcrypt.hash(user.password, salt, (err,hash)=>{
                if(err) throw err;
                user.password = hash;
            })
        );
        
    
        // connect to the db
        mongoose.connect(url, { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function(err, db) {
            assert.equal(null, err);
            db.collection('users').insertOne(user, function(err,result) {
                assert.equal(null, err);
                createUserID =  result.insertedId;
                console.log('New profile created' + createUserID);

                mongoose.connect(url, { 
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                },function(err, db){
                    profileURL = '/profile/' +createUserID;
                   var myquery = { '_id': ObjectId(createUserID)};
                   var newvalues = { $set: {url: profileURL}};

                    db.collection("users").updateOne(myquery, newvalues, function(err, result){

                    });

                });
                res.redirect('/login');
            });
        });
    }

}

passport.serializeUser((user_id, done) =>{
    done(null, user_id);
});
passport.deserializeUser((user_id, done) =>{
    done(null, user_id);
});


module.exports = logincontroller;