const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Fine = require('../models/Fine');
const Membership = require('../models/Membership');

// @route   GET api/fine/member/:membershipId
// @desc    Get fines by member
router.get('/member/:membershipId', auth, async (req, res) => {
    try {
        const fines = await Fine.find({
            membershipId: req.params.membershipId,
            finePaid: false
        }).sort({ returnDate: -1 });
        res.json(fines);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT api/fine/pay/:fineId
// @desc    Pay fine
router.put('/pay/:fineId', auth, async (req, res) => {
    try {
        const { paidDate, remarks } = req.body;
        
        const fine = await Fine.findOne({ fineId: req.params.fineId });
        
        if (!fine) {
            return res.status(404).json({ msg: 'Fine not found' });
        }
        
        fine.finePaid = true;
        fine.paidDate = paidDate || new Date();
        fine.remarks = remarks || fine.remarks;
        await fine.save();
        
        // Update membership pending amount
        const membership = await Membership.findOne({ 
            membershipId: fine.membershipId 
        });
        
        if (membership) {
            membership.amountPending -= fine.fineAmount;
            await membership.save();
        }
        
        res.json({ msg: 'Fine paid successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/fine/pending
// @desc    Get all pending fines
router.get('/pending', auth, async (req, res) => {
    try {
        const fines = await Fine.find({ 
            finePaid: false 
        }).sort({ returnDate: -1 });
        res.json(fines);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;