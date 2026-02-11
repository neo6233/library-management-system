const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Issue = require('../models/Issue');
const Fine = require('../models/Fine');
const Book = require('../models/Book');
const Movie = require('../models/Movie');
const Membership = require('../models/Membership');

// Calculate fine (₹5 per day after due date)
const calculateFine = (returnDate, actualReturnDate) => {
    const dueDate = new Date(returnDate);
    const returnDateObj = new Date(actualReturnDate);
    
    if (returnDateObj <= dueDate) {
        return 0;
    }
    
    const diffTime = returnDateObj - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * 5;
};

// Generate fine ID
const generateFineId = async () => {
    const count = await Fine.countDocuments() + 1;
    return `FINE${count.toString().padStart(6, '0')}`;
};

// @route   POST api/return
// @desc    Return book/movie
router.post('/', auth, async (req, res) => {
    try {
        const { serialNo, membershipId, actualReturnDate, remarks } = req.body;
        
        // Find the issue
        const issue = await Issue.findOne({
            serialNo,
            membershipId,
            status: 'Issued'
        }).sort({ issueDate: -1 });
        
        if (!issue) {
            return res.status(404).json({ msg: 'Active issue not found' });
        }
        
        // Update issue
        issue.actualReturnDate = actualReturnDate;
        issue.status = 'Returned';
        issue.remarks = remarks || issue.remarks;
        await issue.save();
        
        // Update item availability
        let item;
        if (issue.itemType === 'Book') {
            item = await Book.findOne({ serialNo });
        } else {
            item = await Movie.findOne({ serialNo });
        }
        
        if (item) {
            item.availableCopies += 1;
            item.status = 'Available';
            await item.save();
        }
        
        // Calculate fine
        const fineAmount = calculateFine(issue.returnDate, actualReturnDate);
        
        if (fineAmount > 0) {
            const fineId = await generateFineId();
            
            const newFine = new Fine({
                fineId,
                issueId: issue.issueId,
                membershipId,
                serialNo,
                itemName: issue.itemName,
                issueDate: issue.issueDate,
                returnDate: issue.returnDate,
                actualReturnDate,
                daysOverdue: Math.ceil((new Date(actualReturnDate) - new Date(issue.returnDate)) / (1000 * 60 * 60 * 24)),
                fineAmount,
                finePaid: false,
                remarks: remarks || ''
            });
            
            await newFine.save();
            
            // Update membership pending amount
            const membership = await Membership.findOne({ membershipId });
            if (membership) {
                membership.amountPending += fineAmount;
                await membership.save();
            }
        }
        
        res.json({
            msg: 'Book returned successfully',
            fineAmount,
            redirectTo: 'pay-fine.html'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;