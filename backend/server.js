const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config({ path: './backend/.env' });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/membership', require('./routes/membership'));
app.use('/api/issue', require('./routes/issue'));
app.use('/api/return', require('./routes/return'));
app.use('/api/fine', require('./routes/fine'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/maintenance', require('./routes/maintenance'));

// Serve frontend
app.get('/', (req, res) => {
  //  res.sendFile(path.join(__dirname, '../index.html'));
    console.log("hello")
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin-login.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, '../user-login.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Library Management System Server running on port ${PORT}`);
});