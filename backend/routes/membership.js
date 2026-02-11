const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Membership = require('../models/Membership');

// Generate membership ID
const generateMembershipId = async () => {
    const count = await Membership.countDocuments() + 1;
    return `MEM${count.toString().padStart(6, '0')}`;
};

// Calculate end date based on membership type
const calculateEndDate = (startDate, type) => {
    const endDate = new Date(startDate);
    switch(type) {
        case '6 months':
            endDate.setMonth(endDate.getMonth() + 6);
            break;
        case '1 year':
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
        case '2 years':
            endDate.setFullYear(endDate.getFullYear() + 2);
            break;
    }
    return endDate;
};

// @route   POST api/membership
// @desc    Add new membership
router.post('/', [auth, auth.isAdmin], async (req, res) => {
    try {
        const { 
            firstName, lastName, contactNumber, contactAddress, 
            aadharCardNo, startDate, membershipType 
        } = req.body;
        
        // Check if Aadhar already exists
        const existingMember = await Membership.findOne({ aadharCardNo });
        if (existingMember) {
            return res.status(400).json({ msg: 'Aadhar Card Number already registered' });
        }
        
        const membershipId = await generateMembershipId();
        const endDate = calculateEndDate(startDate, membershipType);
        
        const newMembership = new Membership({
            membershipId,
            firstName,
            lastName,
            contactNumber,
            contactAddress,
            aadharCardNo,
            startDate,
            endDate,
            membershipType
        });
        
        const membership = await newMembership.save();
        res.json(membership);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/membership/:membershipId
// @desc    Update membership (extend or cancel)
router.put('/:membershipId', [auth, auth.isAdmin], async (req, res) => {
    try {
        const { action, extensionType } = req.body;
        
        let membership = await Membership.findOne({ 
            membershipId: req.params.membershipId 
        });
        
        if (!membership) {
            return res.status(404).json({ msg: 'Membership not found' });
        }
        
        if (action === 'extend') {
            const extension = extensionType || '6 months';
            const newEndDate = calculateEndDate(membership.endDate, extension);
            membership.endDate = newEndDate;
            membership.membershipType = extension;
            membership.status = 'Active';
        } else if (action === 'cancel') {
            membership.status = 'Cancelled';
            membership.endDate = new Date();
        }
        
        await membership.save();
        res.json(membership);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/membership
// @desc    Get all memberships
router.get('/', auth, async (req, res) => {
    try {
        const memberships = await Membership.find().sort({ createdAt: -1 });
        res.json(memberships);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/membership/active
// @desc    Get active memberships
router.get('/active', auth, async (req, res) => {
    try {
        const memberships = await Membership.find({ 
            status: 'Active' 
        }).sort({ name: 1 });
        res.json(memberships);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/membership/:membershipId
// @desc    Get membership by ID
router.get('/:membershipId', auth, async (req, res) => {
    try {
        const membership = await Membership.findOne({ 
            membershipId: req.params.membershipId 
        });
        
        if (!membership) {
            return res.status(404).json({ msg: 'Membership not found' });
        }
        
        res.json(membership);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;