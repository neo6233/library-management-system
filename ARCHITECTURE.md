# Library Management System - Architecture Overview

## Project Structure

```
library-management-system/
├── frontend/                          # Frontend Assets
│   ├── css/
│   │   └── style.css                 # Global styling
│   ├── js/
│   │   ├── admin.js                  # Admin-specific logic
│   │   ├── auth.js                   # Authentication helper
│   │   ├── books.js                  # Books/Movies operations
│   │   ├── maintenance.js            # Maintenance operations
│   │   ├── membership.js             # Membership operations
│   │   ├── reports.js                # Reports logic
│   │   ├── transactions.js           # Transaction operations
│   │   └── user.js                   # User-specific logic
│   └── index.html                    # Chart/Dashboard
│
├── backend/                          # Backend API Server
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication & role checking
│   ├── models/                       # MongoDB Schemas
│   │   ├── Book.js                  # Books & Movies unified model
│   │   ├── Fine.js                  # Fine management
│   │   ├── Issue.js                 # Issue tracking
│   │   ├── Membership.js            # Membership details
│   │   ├── Movie.js                 # Movies model
│   │   └── User.js                  # User/Admin accounts
│   ├── routes/                       # API Endpoints
│   │   ├── auth.js                  # Authentication endpoints
│   │   ├── books.js                 # Books CRUD & search
│   │   ├── fine.js                  # Fine calculation & payment
│   │   ├── issue.js                 # Issue operations
│   │   ├── maintenance.js           # Admin maintenance operations
│   │   ├── membership.js            # Membership operations
│   │   ├── movies.js                # Movies CRUD & search
│   │   ├── reports.js               # Reporting endpoints
│   │   └── return.js                # Book return operations
│   ├── scripts/
│   │   └── init-db.js               # Database initialization
│   └── server.js                    # Express server entry point
│
├── HTML Pages (Root)
│   ├── index.html                   # Login options & flow chart
│   ├── admin-login.html             # Admin login form
│   ├── user-login.html              # User login form
│   ├── admin-home.html              # Admin dashboard
│   ├── user-home.html               # User dashboard
│   │
│   ├── maintenance.html             # Maintenance menu (Admin)
│   ├── add-book.html                # Add book/movie form
│   ├── update-book.html             # Update book/movie form
│   ├── add-membership.html          # Add membership form
│   ├── update-membership.html       # Update membership form
│   ├── user-management.html         # Admin user management
│   │
│   ├── reports.html                 # Reports menu (User & Admin)
│   ├── master-list-books.html      # Books master list
│   ├── master-list-movies.html     # Movies master list
│   ├── master-list-membership.html # Memberships master list
│   ├── active-issues.html          # Active issues (Reports)
│   ├── overdue-returns.html        # Overdue items (Reports)
│   ├── issue-requests.html         # Pending requests (Reports)
│   │
│   ├── transactions.html            # Transactions menu (User & Admin)
│   ├── book-issue.html             # Issue a book/movie
│   ├── book-available.html         # Check availability
│   ├── return-book.html            # Return a book/movie
│   ├── pay-fine.html               # Pay fines
│   │
│   ├── confirmation.html            # Success confirmation
│   ├── cancel.html                  # Cancellation page
│   └── logout.html                  # Logout page
│
├── package.json                     # Dependencies
├── .env                             # Environment variables
└── README.md                        # Documentation

```

## Key API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User/Admin login
- `GET /verify` - Verify token

### Books (`/api/books`)
- `GET /` - List all books
- `POST /` - Add new book (Admin)
- `PUT /` - Update book (Admin) - NEW!
- `PUT /:serialNo` - Update by serial number
- `GET /search?query=` - Search books
- `GET /available` - Available books only

### Movies (`/api/movies`)
- `GET /` - List all movies
- `POST /` - Add new movie (Admin)
- `PUT /` - Update movie (Admin)
- `GET /search?query=` - Search movies
- `GET /available` - Available movies only

### Issues (`/api/issue`)
- `POST /` - Create new issue
- `GET /active` - Active issues
- `GET /overdue` - Overdue issues
- `GET /member/:membershipId` - Member issues

### Membership (`/api/membership`)
- `GET /` - All memberships
- `POST /` - Add membership (Admin)
- `PUT /:membershipId` - Update membership (Admin)
- `GET /status/:membershipId` - Check status

### Reports (`/api/reports`)
- `GET /master-books` - All books
- `GET /master-movies` - All movies
- `GET /master-memberships` - All memberships
- `GET /active-issues` - Active issues
- `GET /overdue-returns` - Overdue returns

### Maintenance (`/api/maintenance`)
- `POST /users` - Add user (Admin)
- `PUT /users/:userId` - Update user (Admin)
- `GET /users` - List users

### Return (`/api/return`)
- `POST /` - Return item
- `PUT /:issueId` - Update return

### Fine (`/api/fine`)
- `POST /` - Calculate fine
- `GET /` - Get fines
- `POST /pay` - Pay fine

## Authentication Flow

1. User/Admin enters credentials on login page
2. Backend validates against User model
3. JWT token generated and stored in localStorage
4. Token sent with every subsequent request via `x-auth-token` header
5. Middleware verifies token and user role
6. Admin-only routes check `user.isAdmin === true`

## Data Models

### User
```javascript
{
  name: String,
  userId: String (unique),
  password: String (hashed),
  role: String (user/admin),
  isAdmin: Boolean
}
```

### Book/Movie
```javascript
{
  serialNo: String (unique),
  name: String,
  author/director: String,
  category: String,
  cost: Number,
  procurementDate: Date,
  quantity: Number,
  availableCopies: Number,
  status: String (Available/Issued/Damaged/Lost),
  type: String (Book/Movie)
}
```

### Issue
```javascript
{
  issueId: String,
  serialNo: String,
  itemName: String,
  itemType: String,
  membershipId: String,
  issueDate: Date,
  returnDate: Date,
  status: String (Issued/Returned/Lost),
  issuedBy: String,
  remarks: String
}
```

### Membership
```javascript
{
  membershipId: String (unique),
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: String,
  joinDate: Date,
  status: String (Active/Suspended/Expired),
  amountPending: Number
}
```

### Fine
```javascript
{
  issueId: String,
  membershipId: String,
  amount: Number,
  paidAmount: Number,
  status: String (Pending/Paid),
  createdDate: Date,
  remarks: String
}
```

## Environment Variables (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library-management
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Key Technologies

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Server**: Express middleware for routing and auth

