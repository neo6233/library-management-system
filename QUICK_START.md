# Quick Start & Reference Guide

## Starting the Application

### Prerequisites
- Node.js installed
- MongoDB running on localhost:27017

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Create .env file in backend folder with:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library-management
JWT_SECRET=your-secret-key

# 3. Start the server
npm start

# 4. Open browser
http://localhost:5000
```

## Login Credentials

### Admin Account
- **User ID**: adm
- **Password**: adm
- **Access**: Everything (Maintenance, Reports, Transactions)

### User Account
- **User ID**: user
- **Password**: user
- **Access**: Reports (view), Transactions (view)

## Feature Quick Links

| Feature | URL | Access | Purpose |
|---------|-----|--------|---------|
| Login | / | Everyone | Entry point |
| Admin Dashboard | /admin-home.html | Admin | Overview & stats |
| User Dashboard | /user-home.html | User | Overview & stats |
| Maintenance | /maintenance.html | Admin | Management hub |
| Reports | /reports.html | Both | Data viewing |
| Transactions | /transactions.html | Both | Operations |

## Common Tasks

### Add a New Movie
1. Login as Admin
2. Click "Maintenance" → "Add Book/Movie"
3. Select "Movie" 
4. Fill in: Title, Director, Category, Cost, Quantity, Date
5. Click "Add"
6. Confirm success

### Issue a Book to Member
1. Login as User/Admin
2. Click "Transactions" → "Issue Book"
3. Select item (search available)
4. Select member
5. Set return date
6. Submit
7. Confirm success

### View Overdue Items
1. Login (any account)
2. Click "Reports" → "Overdue Returns"
3. View list with days overdue and fine amount

### Search for Items
- From any Master List (Books/Movies/Memberships)
- Use search box at top
- Results update instantly

### Calculate Fine
- Fine = Days Overdue × $5
- Auto-calculated in "Overdue Returns" report
- Can be paid in "Pay Fine" transaction

## API Endpoints Reference

### Quick Access
```
GET  /api/books/search?query=harry
GET  /api/movies/search?query=inception
GET  /api/reports/active-issues
GET  /api/reports/overdue-returns
POST /api/issue (Issue new item)
POST /api/return (Return item)
POST /api/fine/pay (Pay fine)
```

## Database Models

### Simplified View
```
User
├─ userId
├─ name
└─ role (admin/user)

Book/Movie
├─ serialNo
├─ name
├─ author/director
└─ availableCopies

Issue
├─ issueId
├─ serialNo
├─ membershipId
├─ issueDate
└─ returnDate

Membership
├─ membershipId
├─ firstName, lastName
└─ amountPending

Fine
├─ issueId
├─ membershipId
├─ amount
└─ status
```

## Troubleshooting

### "Movie not found" Error
**Cause**: Trying to edit an item that doesn't exist in database
**Solution**: Refresh the page and try again. Ensure item was added successfully.

### "Token is not valid"
**Cause**: Session expired or invalid credentials
**Solution**: Logout and login again

### "Server Error" in Response
**Cause**: Backend issue
**Solution**: Check server console for detailed error message

### Items not appearing in list
**Cause**: Data not saved to database
**Solution**: Check error messages in form, retry with valid data

### Can't add item as non-admin
**Cause**: Add/Update operations require admin role
**Solution**: Login with admin account (adm/adm)

## File Locations Cheat Sheet

| What | Where |
|------|-------|
| Main server | `backend/server.js` |
| Login logic | `backend/routes/auth.js` |
| Add/Update items | `backend/routes/books.js` `backend/routes/movies.js` |
| Reports data | `backend/routes/reports.js` |
| Frontend JS | `frontend/js/` |
| Styles | `frontend/css/style.css` |
| HTML pages | Root folder (*.html) |

## Response Format

All API responses follow this format:

### Success
```json
{
  "_id": "...",
  "serialNo": "FC(B/M)000001",
  "name": "Inception",
  "director": "Christopher Nolan",
  "category": "Fiction",
  "cost": 250,
  "quantity": 5,
  "availableCopies": 4,
  "procurementDate": "2025-10-10",
  "status": "Available"
}
```

### Error
```json
{
  "msg": "Movie not found"
}
```

## Common Error Messages & Solutions

| Message | Meaning | Solution |
|---------|---------|----------|
| "Movie not found" | Item doesn't exist in DB | Refresh and re-add item |
| "Book not found" | Item doesn't exist in DB | Refresh and re-add item |
| "No token, authorization denied" | Not authenticated | Login again |
| "Access denied. Admin only." | Non-admin tried admin operation | Use admin account |
| "Invalid or inactive membership" | Member not found/not active | Check member ID |
| "Please clear pending fine first" | Can't issue with unpaid fine | Member must pay fine |
| "Item is not available" | Out of stock | Try another item |

## Performance Tips

1. **Fast Search**: Use specific keywords (not vague)
2. **Bulk Operations**: Use Master Lists for viewing all data
3. **Reports**: Load one report at a time
4. **Mobile**: Use landscape view for better layout

## Security Notes

✅ Passwords never stored in browser (localStorage only has token)
✅ All operations require valid JWT token
✅ Admin operations verified on server side
✅ Database queries sanitized against injection
✅ File uploads validated (if added)

---

## Need Help?

1. Check TESTING_CHECKLIST.md for detailed workflow
2. Check FIXES_SUMMARY.md for recent changes
3. Check ARCHITECTURE.md for system design
4. Review server console logs for error details
5. Check browser console (F12) for client errors

---

**Last Updated**: February 11, 2026
**Version**: 1.0 - Flow Diagram Aligned
**Status**: ✅ All critical fixes applied

