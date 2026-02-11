const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/maintenance/users
// @desc    Add new user (Admin only)
router.post('/users', [auth, auth.isAdmin], async (req, res) => {
    try {
        const { name, userId, password, role, isAdmin } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ userId });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        
        user = new User({
            name,
            userId,
            password,
            role: role || 'user',
            isAdmin: isAdmin || false
        });
        
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/maintenance/users/:userId
// @desc    Update user (Admin only)
router.put('/users/:userId', [auth, auth.isAdmin], async (req, res) => {
    try {
        const { name, role, isAdmin, active } = req.body;
        
        let user = await User.findOne({ userId: req.params.userId });
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        user.name = name || user.name;
        user.role = role || user.role;
        user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
        user.active = active !== undefined ? active : user.active;
        
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/maintenance/users
// @desc    Get all users (Admin only)
router.get('/users', [auth, auth.isAdmin], async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;