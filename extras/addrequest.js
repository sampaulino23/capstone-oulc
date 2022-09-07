const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';

const mongoose = require('mongoose');

mongoose.connect(url)
    .then(() => console.log('Mongo DB connected!'))
    .catch(err => console.error('Mongo DB FAILED to connect.', err));
    

const ContractRequest = require('../models/ContractRequest');

async function seedContractRequest() {
    console.log('Seeding contract requests...'); // This is based on the joint irf frf form.

    //commented out those that are not included in our scope so we have priority.
    const contractrequests = [
        {
            requester: "6313aa63edd1fffc90b5ce9d",
            contractType: "6318a39c58ff2002a67f750a",
            trackingNumber: "142012",
            subjectMatter: "Student MOA for internship/OJT effective September 5, 2022.",
            requestDate: new Date(),
            effectivityStartDate: new Date("2022-08-20T16:00:00Z"),
            effectivityEndDate: new Date("2023-08-20T16:00:00Z"),
            statusCounter: 1,
            contactNum: 09987654321,
            reviewType: "Regular",
            signatoryLevel: 3,
            signatoryName: "Mr. Kenneth Zhuang",
            templateUsed: "DLSU Template",
            sectionChangeNotes: "",
            thirdPartyRepresentativeName: "Bianca Almacen",
            thirdPartyRepresentativeEmail: "bianca@accenture.com",
            contractingParty: "Accenture PH",
            amountInvolved: 5000,
            asssignedAttorney: "6318a6b4c0119ed0b4b6bb82"
        }

    ];

    for (contractrequest of contractrequests) {
        var newContractRequest = new ContractRequest(contractrequest);
        await newContractRequest.save();
    }

    const a = await ContractRequest.find();
    console.log('contract request: ', a);
}

seedContractRequest();