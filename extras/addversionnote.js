const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';

const mongoose = require('mongoose');

mongoose.connect(url)
    .then(() => console.log('Mongo DB connected!'))
    .catch(err => console.error('Mongo DB FAILED to connect.', err));
    

const VersionNote = require('../models/VersionNote');

async function seedVersionNotes() {
    console.log('Seeding verion notes...');

    const versionNotes = [
        {
            oulcComments: 'Blah blah sample comments hehe xd',
            thirdPartyResponse: 'Wow response',
            requestingPartyRemarks: 'Hello World 123'
        },
    ];

    for (versionNote of versionNotes) {
        var newVersionNote = new VersionNote(versionNote);
        await newVersionNote.save();
    }

    const a = await VersionNote.find();
    console.log('versionNotes: ', a);
}

seedVersionNotes();