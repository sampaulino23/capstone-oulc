const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';

const mongoose = require('mongoose');

mongoose.connect(url)
    .then(() => console.log('Mongo DB connected!'))
    .catch(err => console.error('Mongo DB FAILED to connect.', err));
    

const Department = require('../models/Department');

async function seedRoles() {
    console.log('Seeding departments...');

    const departments = [
        {
            name: 'Office of the Vice President for External Relations and Internationalization',
            abbrev: 'OVPERI'
        },
        {
            name: 'Information Technology',
            abbrev: 'IT'
        },
        {
            name: 'Computer Technology',
            abbrev: 'CT'
        },
        {
            name: 'Software Technology',
            abbrev: 'ST'
        }
    ];

    for (department of departments) {
        var newDepartment = new Department(department);
        await newDepartment.save();
    }

    const a = await Department.find();
    console.log('departments: ', a);
}

seedRoles();