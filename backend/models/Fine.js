const mongoose = require('mongoose');

const FineSchema = new mongoose.Schema({
    fineId: {
        type: String,
        required: true,
        unique: true
    },
    issueId: {
        type: String,
        required: true
    },
    membershipId: {
        type: String,
        required: true
    },
    serialNo: {
        type: String,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    issueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
    actualReturnDate: {
        type: Date
    },
    daysOverdue: {
        type: Number,
        default: 0
    },
    fineAmount: {
        type: Number,
        default: 0
    },
    finePaid: {
        type: Boolean,
        default: false
    },
    paidDate: {
        type: Date
    },
    remarks: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Fine', FineSchema);