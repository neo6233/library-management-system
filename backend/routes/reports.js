const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Book = require('../models/book');
const Movie = require('../models/Movie');
const Membership = require('../models/Membership');
const Issue = require('../models/Issue');
const Fine = require('../models/Fine');

// @route   GET api/reports/master-books
// @desc    Get master list of books
router.get('/master-books', auth, async (req, res) => {
    try {
        const books = await Book.find().sort({ category: 1, name: 1 });
        res.json(books);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports/master-movies
// @desc    Get master list of movies
router.get('/master-movies', auth, async (req, res) => {
    try {
        const movies = await Movie.find().sort({ category: 1, name: 1 });
        res.json(movies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports/master-memberships
// @desc    Get master list of memberships
router.get('/master-memberships', auth, async (req, res) => {
    try {
        const memberships = await Membership.find().sort({ createdAt: -1 });
        res.json(memberships);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports/active-issues
// @desc    Get active issues
router.get('/active-issues', auth, async (req, res) => {
    try {
        const issues = await Issue.find({ 
            status: 'Issued' 
        }).sort({ issueDate: -1 });
        res.json(issues);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports/overdue-returns
// @desc    Get overdue returns
router.get('/overdue-returns', auth, async (req, res) => {
    try {
        const today = new Date();
        const issues = await Issue.find({
            status: 'Issued',
            returnDate: { $lt: today }
        }).sort({ returnDate: 1 });
        
        // Calculate fines
        const overdueWithFine = issues.map(issue => {
            const diffTime = today - new Date(issue.returnDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const fineAmount = diffDays * 5;
            
            return {
                ...issue.toObject(),
                daysOverdue: diffDays,
                fineAmount
            };
        });
        
        res.json(overdueWithFine);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;