const mongoose = require('mongoose');

const ContractRequestSchema = mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contractType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractType',
        required: true
    },
    trackingNumber: {
        type: String,
        required: true
    },
    subjectMatter: {
        type: String,
        required: true
    },
    requestDate: {
        type: Date,
        required: true
    },
    effectivityStartDate: {
        type: Date,
        required: true
    },
    effectivityEndDate: {
        type: Date,
        required: true
    },
    statusCounter: {
        type: Int32,
        required: true
    },
    contactNum: {
        type: String,
        required: true
    },
    reviewType: {
        type: Enum['Express', 'Regular'],
        default: 'Regular',
        required: true
    },
    signatoryLevel: {
        type: Int32,
        required: true
    },
    signatoryName: {
        type: String,
        required: true
    },
    templateUsed: {
        type: Enum[
            'DLSU Template', 
            'DLSU Template with changes in section/paragraph',
            'Other (e.g.: From other party, own templates'
        ],
        required: true
    },
    sectionChangeNotes: {
        type: String,
    },
    thirdPartyRepresentativeName: {
        type: String,
        required: true
    },
    thirdPartyRepresentativeEmail: {
        type: String,
        required: true
    },
    contractingParty: {
        type: String,
        required: true
    },
    amountInvolved: {
        type: Number,
    },
    asssignedStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    asssignedAttorney: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
});

module.exports = mongoose.model('ContractRequest', ContractRequestSchema);

