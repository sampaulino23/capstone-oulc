const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';

const mongoose = require('mongoose');

mongoose.connect(url)
    .then(() => console.log('Mongo DB connected!'))
    .catch(err => console.error('Mongo DB FAILED to connect.', err));
    

const Status = require('../models/Status');

async function seedStatus() {
    console.log('Seeding status...');

    const status = [
        {
            //  Pending (New submission)
            counter: 1,
            statusStaff: 'Pending',
            statusAttorney: 'Pending',
            statusRequester: 'Pending'
        },
        {
            //  For Revision during Initial Review 
            counter: 2,
            statusStaff: 'Waiting',
            statusAttorney: 'For Initial Review',
            statusRequester: 'For Revision'
        },
        {
            //  Revised / To Review during initial review (This means narevise na ni requesting unit during initial review.)
            counter: 3,
            statusStaff: 'To Review',
            statusAttorney: 'For Initial Review',
            statusRequester: 'Revised'
        },
        {
            //  For Legal Review (This means initially reviewed na)
            counter: 4,
            statusStaff: 'For Legal Review',
            statusAttorney: 'For Legal Review',
            statusRequester: 'For Legal Review'
        },
        {
            //  For Revision during Legal Review 
            counter: 5,
            statusStaff: 'For Legal Review',
            statusAttorney: 'Waiting',
            statusRequester: 'For Revision'
        },
        {
            //  Revised / To Review during legal review (This means narevise na ni requesting unit during legal review)
            counter: 6,
            statusStaff: 'For Legal Review',
            statusAttorney: 'To Review',
            statusRequester: 'Revised'
        },
        {
            //  Rerouted
            counter: 7,
            statusStaff: 'For Legal Review',
            statusAttorney: 'Rerouted',
            statusRequester: 'Revised'
        },
        {
            //  Cleared
            counter: 8,
            statusStaff: 'Cleared',
            statusAttorney: 'Cleared',
            statusRequester: 'Cleared'
        },
    ];

    for (status of status) {
        var newStatus = new Status(status);
        await newStatus.save();
    }

    const a = await Status.find();
    console.log('status: ', a);
}

seedStatus();