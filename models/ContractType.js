const mongoose = require('mongoose');
const ContractTypeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    
});

module.exports = mongoose.model('ContractType', ContractTypeSchema);

