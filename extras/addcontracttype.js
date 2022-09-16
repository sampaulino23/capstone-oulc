const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';

const mongoose = require('mongoose');

mongoose.connect(url)
    .then(() => console.log('Mongo DB connected!'))
    .catch(err => console.error('Mongo DB FAILED to connect.', err));
    

const ContractType = require('../models/ContractType');

async function seedContractType() {
    console.log('Seeding contract types...'); // This is based on the joint irf frf form.

    //commented out those that are not included in our scope so we have priority.
    const contracttypes = [
        {
            name: 'MOA/TOR/Contracts for purchases, services, venue, and other piece of work', 
        },
        {
            name: 'OJT/Internship Agreements', 
        },
        // {
        //     name: 'Employment/Labor Contracts'
        // },
        {
            name: 'MOA/Contracts for Workshops or Trainings'
        },
        // {
        //     name: 'MOU/MOA for industry linkages'
        // },
        // {
        //     name: 'Donations/Sponsorships/Grants'
        // },
        // {
        //     name: 'Student/Faculty Exchange or Research Agreements'
        // },
        {
            name: 'Licensing or Subscription Agreements'
        }

    ];

    for (contracttype of contracttypes) {
        var newContractType = new ContractType(contracttype);
        await newContractType.save();
    }

    const a = await ContractType.find();
    console.log('contract types: ', a);
}

seedContractType();