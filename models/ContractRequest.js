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
        required: true, 
        default: Date.now()
    },
    requestTitle: {
        type: String,
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
        type: Number,
        required: true,
        default: 1
    },
    feedbackCounter: {
        type: Number,
        default: 0
    },
    contactPerson: {
        type: String,
        required: true
    },
    contactNum: {
        type: String,
        required: true
    },
    reviewType: {
        type: String,
        enum: ['Express', 'Regular'],
        default: 'Regular',
        required: true
    },
    signatoryLevel: {
        type: Number,
        required: true
    },
    isCustomSignatoryLevel: {
        type: Boolean,
    },
    signatoryName: {
        type: String,
        required: true
    },
    templateUsed: {
        type: String,
        enum: ['DLSU Template', 'DLSU Template with changes in section/paragraph', 'Other (e.g.: From other party, own templates)'],
        required: true
    },
    sectionChangeNotes: {
        type: String,
    },
    thirdPartyRepresentativeName: {
        type: String
    },
    thirdPartyRepresentativeEmail: {
        type: String
    },
    contractingParty: {
        type: String,
        required: true
    },
    amountInvolved: {
        type: Number,
        default: 0,
    },
    assignedAttorney: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assignedStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: false
    }
    
});

module.exports = mongoose.model('ContractRequest', ContractRequestSchema);

