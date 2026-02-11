const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Book = require('../models/Book');

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
        
        console.log('POST /api/books - Received:', { name, author, category, cost, procurementDate, quantity });
        
        // Validate required fields
        if (!name || !author || !category || cost === undefined || quantity === undefined) {
            console.log('Validation failed - missing fields');
            return res.status(400).json({ msg: 'Missing required fields: name, author, category, cost, quantity' });
        }
        
        const serialNo = await generateSerialNo(category);
        console.log('Generated serialNo:', serialNo);
        
        const newBook = new Book({
            serialNo,
            name,
            author,
            category,
            cost: parseFloat(cost),
            procurementDate: procurementDate ? new Date(procurementDate) : Date.now(),
            quantity: parseInt(quantity) || 1,
            availableCopies: parseInt(quantity) || 1,
            type: 'Book'
        });
        
        console.log('Book object created:', newBook);
        
        const book = await newBook.save();
        console.log('Book saved successfully:', book);
        res.json(book);
    } catch (err) {
        console.error('Error in POST /api/books:', err.message);
        console.error('Full error:', err);
        res.status(500).json({ msg: 'Server error while adding book: ' + err.message });
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
        res.status(500).json({ msg: 'Server error while fetching books' });
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
        res.status(500).json({ msg: 'Server error while fetching available books' });
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
        res.status(500).json({ msg: 'Server error while searching books' });
    }
});

// @route   PUT api/books
// @desc    Update a book (by serialNo or original name+author)
router.put('/', [auth, auth.isAdmin], async (req, res) => {
    try {
        const { serialNo, originalName, originalAuthor, name, author, category, cost, procurementDate, quantity } = req.body;

        console.log('PUT /api/books payload:', { serialNo, originalName, originalAuthor, name, author, category, cost, procurementDate, quantity });

        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        let book;
        if (serialNo) {
            book = await Book.findOne({ serialNo });
        }

        // try exact match by original name/author if serialNo didn't find
        if (!book && originalName && originalAuthor) {
            book = await Book.findOne({ name: originalName, author: originalAuthor });
        }

        // try case-insensitive trimmed regex match as a fallback
        if (!book && originalName && originalAuthor) {
            const nameRegex = new RegExp('^' + escapeRegex((originalName || '').trim()) + '$', 'i');
            const authorRegex = new RegExp('^' + escapeRegex((originalAuthor || '').trim()) + '$', 'i');
            book = await Book.findOne({ name: nameRegex, author: authorRegex });
        }

        if (!book) return res.status(404).json({ msg: 'Book not found' });

        if (name) book.name = name;
        if (author) book.author = author;
        if (category) book.category = category;
        if (cost !== undefined) book.cost = cost;
        if (procurementDate) book.procurementDate = procurementDate;
        if (quantity !== undefined) {
            const diff = quantity - book.quantity;
            book.quantity = quantity;
            book.availableCopies = Math.max(0, book.availableCopies + diff);
        }

        await book.save();
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error while updating book' });
    }
});

// @route   PUT api/books/:serialNo
// @desc    Update book by serial number
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
        res.status(500).json({ msg: 'Server error while updating book' });
    }
});

module.exports = router;