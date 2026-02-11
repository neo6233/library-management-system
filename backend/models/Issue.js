const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
    issueId: {
        type: String,
        required: true,
        unique: true
    },
    serialNo: {
        type: String,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    itemType: {
        type: String,
        enum: ['Book', 'Movie'],
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    membershipId: {
        type: String,
        required: true
    },
    memberName: {
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
    status: {
        type: String,
        enum: ['Issued', 'Returned', 'Overdue'],
        default: 'Issued'
    },
    remarks: {
        type: String,
        default: ''
    },
    issuedBy: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Issue', IssueSchema);