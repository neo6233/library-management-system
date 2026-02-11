const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Movie = require('../models/Movie');

// Generate serial number for movies
const generateSerialNo = async (category) => {
    const prefix = {
        'Science': 'SC',
        'Economics': 'EC',
        'Fiction': 'FC',
        'Children': 'CH',
        'Personal Development': 'PD'
    };
    
    const categoryPrefix = prefix[category] || 'MV';
    const count = await Movie.countDocuments({ category }) + 1;
    return `${categoryPrefix}(B/M)${count.toString().padStart(6, '0')}`;
};

// @route   POST api/movies
// @desc    Add new movie
router.post('/', [auth, auth.isAdmin], async (req, res) => {
    try {
        const { name, director, category, cost, procurementDate, quantity } = req.body;
        
        const serialNo = await generateSerialNo(category);
        
        const newMovie = new Movie({
            serialNo,
            name,
            director,
            category,
            cost,
            procurementDate: procurementDate || Date.now(),
            quantity: quantity || 1,
            availableCopies: quantity || 1,
            type: 'Movie'
        });
        
        const movie = await newMovie.save();
        res.json(movie);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/movies
// @desc    Get all movies
router.get('/', auth, async (req, res) => {
    try {
        const movies = await Movie.find().sort({ name: 1 });
        res.json(movies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/movies/available
// @desc    Get available movies
router.get('/available', auth, async (req, res) => {
    try {
        const movies = await Movie.find({ 
            status: 'Available',
            availableCopies: { $gt: 0 }
        }).sort({ name: 1 });
        res.json(movies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/movies/search
// @desc    Search movies by name or director
router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ msg: 'Search query required' });
        }
        
        const movies = await Movie.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { director: { $regex: query, $options: 'i' } }
            ]
        });
        
        res.json(movies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/movies
// @desc    Update a movie (by serialNo or original name+director)
router.put('/', [auth, auth.isAdmin], async (req, res) => {
    try {
        const { serialNo, originalName, originalDirector, name, director, category, cost, procurementDate, quantity } = req.body;

        console.log('PUT /api/movies payload:', { serialNo, originalName, originalDirector, name, director, category, cost, procurementDate, quantity });

        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        let movie;
        if (serialNo) {
            movie = await Movie.findOne({ serialNo });
        }

        // try exact match by original name/director if serialNo didn't find
        if (!movie && originalName && originalDirector) {
            movie = await Movie.findOne({ name: originalName, director: originalDirector });
        }

        // try case-insensitive trimmed regex match as a fallback
        if (!movie && originalName && originalDirector) {
            const nameRegex = new RegExp('^' + escapeRegex((originalName || '').trim()) + '$', 'i');
            const directorRegex = new RegExp('^' + escapeRegex((originalDirector || '').trim()) + '$', 'i');
            movie = await Movie.findOne({ name: nameRegex, director: directorRegex });
        }

        if (!movie) return res.status(404).json({ msg: 'Movie not found' });

        if (name) movie.name = name;
        if (director) movie.director = director;
        if (category) movie.category = category;
        if (cost !== undefined) movie.cost = cost;
        if (procurementDate) movie.procurementDate = procurementDate;
        if (quantity !== undefined) {
            const diff = quantity - movie.quantity;
            movie.quantity = quantity;
            movie.availableCopies = Math.max(0, movie.availableCopies + diff);
        }

        await movie.save();
        res.json(movie);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;