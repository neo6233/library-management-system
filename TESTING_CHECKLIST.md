# Testing & Verification Checklist

Based on your flow diagram, verify the following functionality:

## 🔐 Authentication
- [ ] User can login with credentials (user/user)
- [ ] Admin can login with credentials (adm/adm)
- [ ] Invalid credentials show error
- [ ] Logout clears session and redirects to login
- [ ] Protected pages redirect to login if not authenticated

## 🏠 Home Pages
- [ ] Admin sees admin dashboard with stats
- [ ] User sees user dashboard with stats
- [ ] Sidebar navigation is correct for each role
- [ ] "Back to Chart" button works

## 🔧 Maintenance Menu (Admin Only)

### Memberships
- [ ] Add Membership form works with validation
- [ ] Update Membership finds and updates existing member
- [ ] Master List shows all memberships
- [ ] Can search by name or membership ID

### Books/Movies
- [ ] Add Book/Movie form works with proper validation
- [ ] Update Book/Movie finds item and updates
- [ ] Shows proper error if item not found
- [ ] SerialNo is auto-generated and stored
- [ ] Master List - Books shows all books
- [ ] Master List - Movies shows all movies
- [ ] Can search by title, author, or director

### Users
- [ ] Add User creates new admin/user account
- [ ] Update User modifies existing user
- [ ] Cannot create duplicate userId
- [ ] Role can be changed between user/admin

## 📊 Reports (User & Admin Access)

### Active Issues
- [ ] Lists all currently issued items
- [ ] Shows member name, issue date, return date
- [ ] Accessible to both users and admins
- [ ] Can navigate back to home/transactions

### Overdue Returns
- [ ] Lists items with return date passed
- [ ] Calculates days overdue
- [ ] Calculates fine amount (days × 5)
- [ ] Accessible to both users and admins

### Master Lists
- [ ] Books list shows all books with details
- [ ] Movies list shows all movies with details
- [ ] Memberships list shows all members
- [ ] Can edit from these lists
- [ ] Can search/filter in each list

### Pending Issues Request
- [ ] Shows requests for new issue IDs
- [ ] Allows admin to approve/deny
- [ ] Updates user appropriately

## 📋 Transactions (User & Admin Access)

### Check Book Availability
- [ ] Search by title/author/ISBN
- [ ] Shows available copies
- [ ] Shows cost and category
- [ ] Can proceed to issue if available

### Issue Book/Movie
- [ ] Selects member or guest
- [ ] Selects item to issue
- [ ] Sets issue and return dates
- [ ] Checks member's pending fine
- [ ] Updates item's availableCopies
- [ ] Creates Issue record
- [ ] Shows success confirmation

### Return Book/Movie
- [ ] Searches for active issue
- [ ] Shows original issue details
- [ ] Allows selecting return date
- [ ] Calculates if overdue
- [ ] Updates Issue status to Returned
- [ ] Restores availableCopies
- [ ] Shows return confirmation

### Pay Fine
- [ ] Lists pending fines for member
- [ ] Shows fine amount and days overdue
- [ ] Records payment
- [ ] Updates membership pending amount
- [ ] Shows payment confirmation

## 🔄 Data Integrity

### Add → Update → Delete Flow
- [ ] Add item appears in list immediately
- [ ] Edit item updates in database
- [ ] Search finds newly added items
- [ ] Master lists are current
- [ ] No ghost/orphan records

### Cross-Module Data Consistency
- [ ] Book issued → availableCopies decreases
- [ ] Book returned → availableCopies increases
- [ ] Overdue fine calculated correctly
- [ ] Member suspension blocks new issues
- [ ] Membership history tracked

## 🛠️ Error Handling

### Network Errors
- [ ] Server error shows clear message
- [ ] 404 errors show specific reason
- [ ] 401/403 redirect to login appropriately
- [ ] Timeout handled gracefully

### Validation Errors
- [ ] Required fields validated before submit
- [ ] Duplicate records prevented
- [ ] Invalid dates rejected
- [ ] Negative amounts rejected

### Form Errors
- [ ] Missing data shows inline errors
- [ ] Server errors display in error div
- [ ] Error messages are user-friendly
- [ ] Form remains accessible after error

## 📱 Responsive Design
- [ ] Layout works on desktop
- [ ] Sidebars and navs are accessible
- [ ] Forms are readable on all sizes
- [ ] Tables are scrollable if needed
- [ ] Buttons are easy to click

## 🔒 Security

### Authentication
- [ ] Passwords not stored in localStorage
- [ ] Token used for all protected requests
- [ ] Token expires properly
- [ ] Cannot access admin pages as user

### Authorization
- [ ] Add/Update operations require auth
- [ ] Admin operations check role
- [ ] Reports accessible by both roles
- [ ] Transactions accessible by both roles
- [ ] Maintenance only for admin

## ⚡ Performance

### Load Times
- [ ] Login page loads quickly
- [ ] Dashboards load within 2 seconds
- [ ] Master lists load with pagination
- [ ] Search responds within 1 second

### Data Operations
- [ ] Add takes < 2 seconds
- [ ] Update takes < 2 seconds
- [ ] Search is indexed and fast
- [ ] Reports generate quickly

## 📖 Navigation Flow

### Admin Flow
```
Admin Login → Admin Home → Maintenance/Reports/Transactions
  ├── Maintenance
  │   ├── Add/Update Membership
  │   ├── Add/Update Books/Movies
  │   └── User Management
  ├── Reports
  │   ├── Active Issues
  │   ├── Overdue Returns
  │   ├── Master Lists
  │   └── Issue Requests
  └── Transactions
      ├── Check Availability
      ├── Issue Item
      ├── Return Item
      └── Pay Fine
```

### User Flow
```
User Login → User Home → Reports/Transactions
  ├── Reports
  │   ├── Active Issues
  │   ├── Overdue Returns
  │   └── Master Lists (View Only)
  └── Transactions
      ├── Check Availability
      ├── Issue Item
      ├── Return Item
      └── Pay Fine
```

---

## Notes for Testing

1. **Test Data**: Use provided credentials (adm/adm for admin, user/user for user)
2. **Database**: Ensure MongoDB is running on localhost:27017
3. **Server**: Start with `npm start` in backend folder
4. **Network**: Monitor browser console for any errors
5. **Logs**: Check server console for detailed error messages

