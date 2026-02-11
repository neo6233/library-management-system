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
    
    // Find the highest existing serial number for this category
    const lastMovie = await Movie.findOne({ 
        serialNo: new RegExp(`^${categoryPrefix}\\(B/M\\)`) 
    }).sort({ serialNo: -1 });
    
    let nextNumber = 1;
    if (lastMovie && lastMovie.serialNo) {
        // Extract the number from the serial number
        const match = lastMovie.serialNo.match(/(\d+)$/);
        if (match) {
            nextNumber = parseInt(match[1]) + 1;
        }
    }
    
    return `${categoryPrefix}(B/M)${nextNumber.toString().padStart(6, '0')}`;
};

// @route   POST api/movies
// @desc    Add new movie
router.post('/', [auth, auth.isAdmin], async (req, res) => {
    try {
        const { name, director, category, cost, procurementDate, quantity } = req.body;
        
        console.log('POST /api/movies - Received:', { name, director, category, cost, procurementDate, quantity });
        
        // Validate required fields
        if (!name || !director || !category || cost === undefined || quantity === undefined) {
            console.log('Validation failed - missing fields');
            return res.status(400).json({ msg: 'Missing required fields: name, director, category, cost, quantity' });
        }
        
        const serialNo = await generateSerialNo(category);
        console.log('Generated serialNo:', serialNo);
        
        const newMovie = new Movie({
            serialNo,
            name,
            director,
            category,
            cost: parseFloat(cost),
            procurementDate: procurementDate ? new Date(procurementDate) : Date.now(),
            quantity: parseInt(quantity) || 1,
            availableCopies: parseInt(quantity) || 1,
            type: 'Movie'
        });
        
        console.log('Movie object created:', newMovie);
        
        const movie = await newMovie.save();
        console.log('Movie saved successfully:', movie);
        res.json(movie);
    } catch (err) {
        console.error('Error in POST /api/movies:', err.message);
        console.error('Full error:', err);
        res.status(500).json({ msg: 'Server error while adding movie: ' + err.message });
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
        res.status(500).json({ msg: 'Server error while fetching movies' });
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
        res.status(500).json({ msg: 'Server error while fetching available movies' });
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
        res.status(500).json({ msg: 'Server error while searching movies' });
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
        res.status(500).json({ msg: 'Server error while updating movie' });
    }
});

module.exports = router;