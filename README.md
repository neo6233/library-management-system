# Library Management System

A simple full-stack Library Management System built with Node.js, Express, MongoDB, and plain HTML/CSS/vanilla JavaScript for the frontend.

## Features

- Manage books and movies (add, update, list)
- Issue and return items
- Track fines and overdue items
- Membership management
- Simple JWT-based authentication for admin actions

## Tech stack

- Backend: Node.js, Express, Mongoose (MongoDB)
- Frontend: Plain HTML, CSS, JavaScript (files in project root and `frontend/`)
- Auth: JSON Web Tokens (JWT)

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or hosted)
- Optional: `npm` or `yarn`

## Quick start

1. Install dependencies

```bash
npm install
```

2. Configure environment

Create a `.env` file in the project root (or set environment variables):

```
MONGODB_URI=mongodb://localhost:27017/library
JWT_SECRET=your_jwt_secret
PORT=3000
```

3. Start the server

The project provides a `start` script that runs the backend server:

```bash
npm run start
```

In development you can use nodemon:

```bash
npm run dev
```

4. Open the frontend

Open any of the HTML pages in your browser (for example, `index.html` or `frontend/index.html`). If the server is running on a different port, ensure fetch calls in frontend pages point to the correct API base URL.

## API (high level)

- `POST /api/auth` - login to receive JWT
- `GET /api/books` - list books
- `GET /api/books/available` - available books
- `POST /api/books` - add a book (auth required)
- `PUT /api/movies` - update a movie/book record (auth required)
- `POST /api/issue` - issue an item
- `GET /api/issue/active` - list active issues
- `GET /api/fine/member/:membershipId` - fetch fines for a member
- `PUT /api/fine/pay/:fineId` - pay a fine

Many frontend pages call these endpoints directly. Authenticated endpoints expect the JWT in the `x-auth-token` request header.

## Notes & troubleshooting

- Ensure `localStorage.token` is populated by logging in through the frontend `user-login.html` or `admin-login.html` pages; many admin endpoints require that token to be present in the `x-auth-token` header.
- If you run the server on a different host/port, update the fetch base URLs in the frontend JS files (`frontend/js/*.js`) or serve the frontend from the same origin.
- The project includes scripts and routes in `backend/`; see `backend/server.js` to change port or middleware.

## Contributing

1. Create a branch
2. Make changes and test server + frontend
3. Open a pull request

## License

This project does not include a license file. Add one if you intend to publish.
