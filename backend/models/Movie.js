const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    serialNo: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    director: {
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
        default: 'Movie'
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

module.exports = mongoose.model('Movie', MovieSchema);