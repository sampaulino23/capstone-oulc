const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

//Load user Model
const User = require('../models/User');


module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField: 'email', passwordField: 'password'}, (email, password, done) =>{
            //Match User
            User.findOne({email:email})
                .then(user => {
                    if(!user){
                        return done(null, false, {message: 'That email is not registered'});
                    }
                    //Match the Password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if(err) throw err;
                        if(isMatch){
                            console.log(user.id);
                            return done(null, user);
                        }
                        else{
                            return done(null, false, {message: 'Password wrong'});
                        }

                    });
                })
                .catch(err =>console.log(err));
        })
    );

    passport.serializeUser((user, done) =>{
        done(null, user.id);
      });
      
    passport.deserializeUser((id, done) =>{
        User.findById(id, (err, User) => {
            done(err, User);
        });
    });
}













 

      


