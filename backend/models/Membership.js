const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
    membershipId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    contactAddress: {
        type: String,
        required: true
    },
    aadharCardNo: {
        type: String,
        required: true,
        unique: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    membershipType: {
        type: String,
        enum: ['6 months', '1 year', '2 years'],
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Cancelled', 'Expired'],
        default: 'Active'
    },
    amountPending: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Membership', MembershipSchema);