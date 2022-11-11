const mongoose = require('mongoose');
const url = 'mongodb+srv://admin:admin@cluster0.mwvjlox.mongodb.net/?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const User = require('../models/User.js');
const ContractRequest = require('../models/ContractRequest.js');
const Feedback = require('../models/Feedback.js');
const Contract = require('../models/Contract.js');
const ContractVersion = require('../models/ContractVersion.js');
const ReferenceDocument = require('../models/ReferenceDocument.js');
const Status = require('../models/Status.js');
const { ObjectId } = require('mongoose');

const negotiationcontroller = {

    getResetPassword: async (req, res) => {
		try {
            var userid = req.params.id;

            console.log ("Reset Password Page");
            console.log('userid: ' + userid);

			const user = await User.find({_id : userid}).lean().exec();

			res.render('resetpassword', {user: user, pagename: 'Reset Password', title: 'Reset Password'});
		} catch(err) {
			console.log(err);
		}
    },

    getThirdPartyNegotiation: async (req, res) => { 
        try {

            var path = req.path.split('/')[2];
            //var userid = req.user._id;
            //var messages = null;

            /*const conversation = await Conversation.findOne({contractRequest: path, members: userid}).lean().exec();

            if (conversation) {
                console.log("INSIDE CONVERSATION");
                messages = await Message.find({conversationId: conversation._id}).lean().exec(); 
            }*/
            
            const contractrequest = await ContractRequest.findById(path).lean()
                .populate({
                    path: 'requester',
                    populate: {
                        path: 'department'
                      } 
                })
                .populate({
                    path: 'contractType'
                })
                .populate({
                    path: 'assignedAttorney'
                })
                .populate({
                    path: 'conversation'
                })
                .sort({requestDate: 1})
                .exec();

            const statusList = await Status.findOne({counter: contractrequest.statusCounter}).exec();
            contractrequest.status = statusList.statusAttorney;

           /*if (req.user.roleName == "Staff") {
                contractrequest.status = statusList.statusStaff;
            }
            else if (req.user.roleName == "Attorney") {
                contractrequest.status = statusList.statusAttorney;
            }*/

            // // To calculate the time difference of two dates
            // var Difference_In_Time = contractrequest.effectivityEndDate.getTime() - contractrequest.effectivityStartDate.getTime();
                    
            // // To calculate the no. of days between two dates
            // var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

            // if (Difference_In_Days < 0){
            //     Difference_In_Days = Math.floor(Difference_In_Days);
            // }
            // else {
            //     Difference_In_Days = Math.ceil(Difference_In_Days);
            // }

            function dateDiffInDays(a, b) {
                const _MS_PER_DAY = 1000 * 60 * 60 * 24;
                // Discard the time and time-zone information.
                const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
                const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
              
                return Math.floor((utc2 - utc1) / _MS_PER_DAY);
            }

            var Difference_In_Days = dateDiffInDays(new Date(contractrequest.effectivityStartDate), new Date(contractrequest.effectivityEndDate));

            // To set number of days gap in contract request
            contractrequest.daysDuration = Difference_In_Days;

            const feedback = await Feedback.find({contractRequest : path}).lean()
                .populate({
                    path: 'user_id'
                })
                .sort({date: -1})
                .exec();

            const contracts = await Contract.find({contractRequest: path}).lean().exec();

            var latestversioncontracts = [];
            var contractversions = [];

            for (contract of contracts) {
                const latestversioncontract = await ContractVersion.findOne({contract: contract._id, version: contract.latestversion})
                    .lean()
                    .populate({
                        path: 'versionNote'
                    })
                    .exec();
                
                    latestversioncontracts.push(latestversioncontract);

                const contractversion = await ContractVersion.find({contract: contract._id})
                    .lean()
                    .populate({
                        path: 'contract',
                        populate: {
                            path: 'contractRequest',
                            populate: {
                                path: 'requester',
                            }
                        }
                    })
                    .populate({
                        path: 'versionNote'
                    })
                    .sort({version: -1})
                    .exec();

                for (eachcontractversion of contractversion) {
                    contractversions.push(eachcontractversion);
                }
            }

            const referencedocuments = await ReferenceDocument.find({contractRequest: path}).lean().exec();

            //const roleAttorney = await Role.findOne({name: 'Attorney'}).exec();

            //const attorneys = await User.find({role: roleAttorney,_id: { $ne: userid }, isActive: true}).lean().exec();

            //const user = await User.findById(req.user).lean().exec();

            res.render('thirdpartynegotiation', {
                //user_fullname:req.user.fullName,
                //user_role:req.user.roleName,
                //user: user,
                contractrequest: contractrequest,
                feedback: feedback,
                latestversioncontracts: latestversioncontracts,
                referencedocuments: referencedocuments,
                contractversions: contractversions,
                //attorneys: attorneys,
                //conversation: conversation,
                //messages: messages
            });

        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = negotiationcontroller;