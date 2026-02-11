const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Book = require('../models/book');

// Generate serial number for books
const generateSerialNo = async (category) => {
    const prefix = {
        'Science': 'SC',
        'Economics': 'EC',
        'Fiction': 'FC',
        'Children': 'CH',
        'Personal Development': 'PD'
    };
    
    const categoryPrefix = prefix[category] || 'BK';
    const count = await Book.countDocuments({ category }) + 1;
    return `${categoryPrefix}(B/M)${count.toString().padStart(6, '0')}`;
};

// @route   POST api/books
// @desc    Add new book
router.post('/', [auth, auth.isAdmin], async (req, res) => {
    try {
        const { name, author, category, cost, procurementDate, quantity } = req.body;
        
        const serialNo = await generateSerialNo(category);
        
        const newBook = new Book({
            serialNo,
            name,
            author,
            category,
            cost,
            procurementDate: procurementDate || Date.now(),
            quantity: quantity || 1,
            availableCopies: quantity || 1,
            type: 'Book'
        });
        
        const book = await newBook.save();
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/books
// @desc    Get all books
router.get('/', auth, async (req, res) => {
    try {
        const books = await Book.find().sort({ name: 1 });
        res.json(books);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/books/available
// @desc    Get available books
router.get('/available', auth, async (req, res) => {
    try {
        const books = await Book.find({ 
            status: 'Available',
            availableCopies: { $gt: 0 }
        }).sort({ name: 1 });
        res.json(books);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/books/search
// @desc    Search books by name or author
router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ msg: 'Search query required' });
        }
        
        const books = await Book.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } }
            ]
        });
        
        res.json(books);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/books/:serialNo
// @desc    Update book
router.put('/:serialNo', [auth, auth.isAdmin], async (req, res) => {
    try {
        const { name, author, category, status, cost } = req.body;
        
        let book = await Book.findOne({ serialNo: req.params.serialNo });
        
        if (!book) {
            return res.status(404).json({ msg: 'Book not found' });
        }
        
        book.name = name || book.name;
        book.author = author || book.author;
        book.category = category || book.category;
        book.status = status || book.status;
        book.cost = cost || book.cost;
        
        await book.save();
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;