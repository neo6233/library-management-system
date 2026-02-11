const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    serialNo: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Science', 'Economics', 'Fiction', 'Children', 'Personal Development'],
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'Issued', 'Damaged', 'Lost'],
        default: 'Available'
    },
    cost: {
        type: Number,
        required: true
    },
    procurementDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['Book', 'Movie'],
        default: 'Book'
    },
    quantity: {
        type: Number,
        default: 1
    },
    availableCopies: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', BookSchema);