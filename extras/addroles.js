const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';

const mongoose = require('mongoose');

mongoose.connect(url)
    .then(() => console.log('Mongo DB connected!'))
    .catch(err => console.error('Mongo DB FAILED to connect.', err));
    

const Role = require('../models/Role');

async function seedRoles() {
    console.log('Seeding roles...');

    const roles = [
        {
            name: 'Requester', 
        },
        {
            name: 'Attorney'
        },
        {
            name: 'Staff'
        }
    ];

    for (role of roles) {
        var newRole = new Role(role);
        await newRole.save();
    }

    const a = await Role.find();
    console.log('roles: ', a);
}

seedRoles();