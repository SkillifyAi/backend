const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String,
    email: String, 
    planType: {
        type: String,
        default: "Free"
    },
    planNumber: {
        type: Number,
        default: 1
    },
    alternativePlans: {
        type: Number,
        default: 0
    },
    plans: [{type: mongoose.Schema.Types.ObjectId, ref: 'Plan'}],
    plansCompleted: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
    resetToken: {
        type: String
    },
    image: {
        type: String,
        default: ""
    },
    phoneNumber: String,
    customerId: String
});

mongoose.model('User', UserSchema);