const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Book = require('../models/book');
const Movie = require('../models/Movie');
const Membership = require('../models/Membership');
const Issue = require('../models/Issue');
const Fine = require('../models/Fine');

const initDB = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear all existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Book.deleteMany({});
        await Movie.deleteMany({});
        await Membership.deleteMany({});
        await Issue.deleteMany({});
        await Fine.deleteMany({});
        console.log('✅ Existing data cleared');

        // Drop indexes to remove any old unique constraints
        try {
            await mongoose.connection.collection('books').dropIndexes();
            console.log('✅ Dropped books indexes');
        } catch (err) {
            console.log('ℹ️  No indexes to drop or already dropped');
        }

        try {
            await mongoose.connection.collection('movies').dropIndexes();
            console.log('✅ Dropped movies indexes');
        } catch (err) {
            console.log('ℹ️  No indexes to drop or already dropped');
        }

        // Create admin user
        console.log('👑 Creating admin user...');
        const adminUser = new User({
            name: 'Administrator',
            userId: 'adm',
            password: 'adm',
            role: 'admin',
            isAdmin: true,
            active: true
        });
        await adminUser.save();
        console.log('✅ Admin user created');

        // Create regular user
        console.log('👤 Creating regular user...');
        const regularUser = new User({
            name: 'Library User',
            userId: 'user',
            password: 'user',
            role: 'user',
            isAdmin: false,
            active: true
        });
        await regularUser.save();
        console.log('✅ Regular user created');

        // Create sample books
        console.log('📚 Creating sample books...');
        const sampleBooks = [
            {
                serialNo: 'SC(B/M)000001',
                name: 'Introduction to Physics',
                author: 'Dr. Smith',
                category: 'Science',
                status: 'Available',
                cost: 499,
                procurementDate: new Date('2024-01-15'),
                type: 'Book',
                quantity: 3,
                availableCopies: 3
            },
            {
                serialNo: 'SC(B/M)000002',
                name: 'Advanced Chemistry',
                author: 'Dr. Johnson',
                category: 'Science',
                status: 'Available',
                cost: 599,
                procurementDate: new Date('2024-01-20'),
                type: 'Book',
                quantity: 2,
                availableCopies: 2
            },
            {
                serialNo: 'EC(B/M)000001',
                name: 'Principles of Economics',
                author: 'Prof. Williams',
                category: 'Economics',
                status: 'Available',
                cost: 449,
                procurementDate: new Date('2024-02-01'),
                type: 'Book',
                quantity: 2,
                availableCopies: 2
            },
            {
                serialNo: 'FC(B/M)000001',
                name: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                category: 'Fiction',
                status: 'Available',
                cost: 399,
                procurementDate: new Date('2024-01-10'),
                type: 'Book',
                quantity: 4,
                availableCopies: 4
            },
            {
                serialNo: 'CH(B/M)000001',
                name: 'Harry Potter and the Sorcerer\'s Stone',
                author: 'J.K. Rowling',
                category: 'Children',
                status: 'Available',
                cost: 599,
                procurementDate: new Date('2024-01-05'),
                type: 'Book',
                quantity: 5,
                availableCopies: 5
            },
            {
                serialNo: 'PD(B/M)000001',
                name: 'Atomic Habits',
                author: 'James Clear',
                category: 'Personal Development',
                status: 'Available',
                cost: 499,
                procurementDate: new Date('2024-02-10'),
                type: 'Book',
                quantity: 3,
                availableCopies: 3
            }
        ];

        await Book.insertMany(sampleBooks);
        console.log(`✅ ${sampleBooks.length} sample books created`);

        // Create sample movies
        console.log('🎬 Creating sample movies...');
        const sampleMovies = [
            {
                serialNo: 'SC(B/M)000003',
                name: 'Cosmos: A Spacetime Odyssey',
                director: 'Ann Druyan',
                category: 'Science',
                status: 'Available',
                cost: 299,
                procurementDate: new Date('2024-01-25'),
                type: 'Movie',
                quantity: 2,
                availableCopies: 2
            },
            {
                serialNo: 'FC(B/M)000002',
                name: 'The Shawshank Redemption',
                director: 'Frank Darabont',
                category: 'Fiction',
                status: 'Available',
                cost: 199,
                procurementDate: new Date('2024-01-18'),
                type: 'Movie',
                quantity: 2,
                availableCopies: 2
            },
            {
                serialNo: 'CH(B/M)000002',
                name: 'The Lion King',
                director: 'Roger Allers',
                category: 'Children',
                status: 'Available',
                cost: 149,
                procurementDate: new Date('2024-02-05'),
                type: 'Movie',
                quantity: 3,
                availableCopies: 3
            }
        ];

        await Movie.insertMany(sampleMovies);
        console.log(`✅ ${sampleMovies.length} sample movies created`);

        // Create sample membership
        console.log('👥 Creating sample membership...');
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-06-30');
        
        const sampleMembership = new Membership({
            membershipId: 'MEM000001',
            firstName: 'John',
            lastName: 'Doe',
            contactNumber: '9876543210',
            contactAddress: '123 Main Street, Cityville',
            aadharCardNo: '123456789012',
            startDate: startDate,
            endDate: endDate,
            membershipType: '6 months',
            status: 'Active',
            amountPending: 0
        });

        await sampleMembership.save();
        console.log('✅ Sample membership created (MEM000001)');

        // Create another sample membership
        const sampleMembership2 = new Membership({
            membershipId: 'MEM000002',
            firstName: 'Jane',
            lastName: 'Smith',
            contactNumber: '9876543211',
            contactAddress: '456 Oak Avenue, Townsville',
            aadharCardNo: '987654321098',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2025-01-31'),
            membershipType: '1 year',
            status: 'Active',
            amountPending: 0
        });

        await sampleMembership2.save();
        console.log('✅ Sample membership created (MEM000002)');

        console.log('\n🎉 Database initialization completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Users: 2 created (1 admin, 1 regular)`);
        console.log(`   - Books: ${sampleBooks.length} created`);
        console.log(`   - Movies: ${sampleMovies.length} created`);
        console.log(`   - Memberships: 2 created`);
        
        console.log('\n🔐 Login Credentials:');
        console.log('   ┌─────────┬─────────────┬──────────┐');
        console.log('   │ Role    │ User ID     │ Password │');
        console.log('   ├─────────┼─────────────┼──────────┤');
        console.log('   │ Admin   │ adm         │ adm      │');
        console.log('   │ User    │ user        │ user     │');
        console.log('   └─────────┴─────────────┴──────────┘');
        
        console.log('\n📋 Sample Membership IDs:');
        console.log('   - MEM000001 (John Doe)');
        console.log('   - MEM000002 (Jane Smith)');
        
        console.log('\n📚 Sample Book Serial Numbers:');
        sampleBooks.slice(0, 3).forEach(book => {
            console.log(`   - ${book.serialNo}: ${book.name}`);
        });
        
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error initializing database:', error.message);
        if (error.code === 11000) {
            console.error('⚠️  Duplicate key error. Please drop the database and try again.');
            console.error('   Run: mongoose.connection.db.dropDatabase()');
        }
        console.error(error.stack);
        process.exit(1);
    }
};

initDB();