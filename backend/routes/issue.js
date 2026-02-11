const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Issue = require('../models/Issue');
const Book = require('../models/Book');
const Movie = require('../models/Movie');
const Membership = require('../models/Membership');

// Generate issue ID
const generateIssueId = async () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await Issue.countDocuments() + 1;
    return `ISS-${year}${month}-${count.toString().padStart(4, '0')}`;
};

// @route   POST api/issue
// @desc    Issue book/movie
router.post('/', auth, async (req, res) => {
    try {
        console.log('POST /api/issue payload:', req.body);
        const { 
            serialNo, itemType, membershipId, 
            issueDate, returnDate, remarks 
        } = req.body;
        
        // Check if item exists and is available
        let item;
        if (itemType === 'Book') {
            item = await Book.findOne({ serialNo });
        } else {
            item = await Movie.findOne({ serialNo });
        }
        
        if (!item) {
            return res.status(404).json({ msg: 'Item not found' });
        }
        
        if (item.status !== 'Available' || item.availableCopies <= 0) {
            return res.status(400).json({ msg: 'Item is not available' });
        }
        
        // Check membership (optional). If no membershipId provided, treat as guest/walk-in.
        let membershipUsed = membershipId;
        let memberName = 'Guest';
        if (membershipId) {
            const membership = await Membership.findOne({ membershipId });
            if (!membership || membership.status !== 'Active') {
                return res.status(400).json({ msg: 'Invalid or inactive membership' });
            }
            // Check if membership has pending fine
            if (membership.amountPending > 0) {
                return res.status(400).json({ msg: 'Please clear pending fine first' });
            }
            membershipUsed = membership.membershipId;
            memberName = `${membership.firstName} ${membership.lastName}`;
        } else {
            membershipUsed = 'GUEST';
            memberName = 'Guest';
        }
        
        const issueId = await generateIssueId();
        
        const newIssue = new Issue({
            issueId,
            serialNo,
            itemName: item.name,
            itemType,
            authorName: item.author || item.director,
            membershipId: membershipUsed,
            memberName: memberName,
            issueDate,
            returnDate,
            remarks: remarks || '',
            issuedBy: req.user && req.user.userId ? req.user.userId : 'system',
            status: 'Issued'
        });
        
        // Update item availability
        item.availableCopies -= 1;
        if (item.availableCopies === 0) {
            item.status = 'Issued';
        }
        await item.save();
        
        const issue = await newIssue.save();
        res.json(issue);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error while issuing item' });
    }
});

// @route   GET api/issue/active
// @desc    Get active issues
router.get('/active', auth, async (req, res) => {
    try {
        const issues = await Issue.find({ 
            status: 'Issued' 
        }).sort({ issueDate: -1 });
        res.json(issues);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/issue/overdue
// @desc    Get overdue issues
router.get('/overdue', auth, async (req, res) => {
    try {
        const today = new Date();
        const issues = await Issue.find({
            status: 'Issued',
            returnDate: { $lt: today }
        }).sort({ returnDate: 1 });
        res.json(issues);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error while fetching overdue issues' });
    }
});

// @route   GET api/issue/member/:membershipId
// @desc    Get issues by member
router.get('/member/:membershipId', auth, async (req, res) => {
    try {
        const issues = await Issue.find({
            membershipId: req.params.membershipId
        }).sort({ issueDate: -1 });
        res.json(issues);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;