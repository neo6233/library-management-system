// Transactions Module

// Book Availability Search
async function searchBooks() {
    const query = document.getElementById('searchQuery').value;
    
    if (!query) {
        alert('Please enter book name or author');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/books/search?query=${query}`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        const books = await response.json();
        displaySearchResults(books);
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Display search results with radio buttons
function displaySearchResults(books) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (books.length === 0) {
        resultsDiv.innerHTML = '<p class="no-results">No books found</p>';
        return;
    }
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Book Name</th>
                    <th>Author</th>
                    <th>Serial Number</th>
                    <th>Available</th>
                    <th>Select</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    books.forEach(book => {
        if (book.availableCopies > 0) {
            html += `
                <tr>
                    <td>${book.name}</td>
                    <td>${book.author}</td>
                    <td>${book.serialNo}</td>
                    <td><span class="status-available">Y</span></td>
                    <td>
                        <input type="radio" name="selectedBook" value="${book.serialNo}" 
                               data-name="${book.name}" data-author="${book.author}">
                    </td>
                </tr>
            `;
        }
    });
    
    html += '</tbody></table>';
    resultsDiv.innerHTML = html;
}

// Book Issue Form
document.getElementById('issueForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bookName = document.getElementById('bookName').value;
    const author = document.getElementById('author').value;
    const issueDate = document.getElementById('issueDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const membershipEl = document.getElementById('membershipId');
    const membershipId = membershipEl ? (membershipEl.value.trim() || 'GUEST') : 'GUEST';
    
    // Validation
    const selectedSerial = document.getElementById('selectedSerialNo').value || '';
    if (!selectedSerial) {
        showError('Please select a book first (use Search Books).');
        return;
    }
    if (!bookName) {
        showError('Book name is required');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (issueDate < today) {
        showError('Issue date cannot be lesser than today');
        return;
    }
    
    const maxReturnDate = new Date(issueDate);
    maxReturnDate.setDate(maxReturnDate.getDate() + 15);
    const maxReturnDateStr = maxReturnDate.toISOString().split('T')[0];
    
    if (returnDate > maxReturnDateStr) {
        showError('Return date cannot be greater than 15 days from issue date');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const base = (typeof API_URL !== 'undefined') ? API_URL : '';
        const endpoint = base + '/issue';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'x-auth-token': token } : {})
            },
            body: JSON.stringify({
                serialNo: selectedSerial,
                itemType: 'Book',
                membershipId,
                issueDate,
                returnDate,
                remarks: document.getElementById('remarks').value
            })
        });

        if (response.ok) {
            window.location.href = 'confirmation.html';
            return;
        }

        let msg = `Request failed (${response.status})`;
        try { const data = await response.json(); if (data && data.msg) msg = data.msg; } catch (e) {}

        // Special handling for auth
        if (response.status === 401) {
            showError(msg + '. Please login again.');
            return;
        }

        showError(msg);
    } catch (error) {
        console.error('Issue error:', error);
        showError('Server error. Please try again later.');
    }
});

// Auto-populate author when book is selected
function selectBook(serialNo, name, author) {
    document.getElementById('selectedSerialNo').value = serialNo;
    document.getElementById('bookName').value = name;
    document.getElementById('author').value = author;
    document.getElementById('author').readOnly = true;
}

// Set default return date (15 days from issue date)
document.getElementById('issueDate')?.addEventListener('change', function() {
    const issueDate = new Date(this.value);
    const returnDate = new Date(issueDate);
    returnDate.setDate(returnDate.getDate() + 15);
    
    const year = returnDate.getFullYear();
    const month = String(returnDate.getMonth() + 1).padStart(2, '0');
    const day = String(returnDate.getDate()).padStart(2, '0');
    
    document.getElementById('returnDate').value = `${year}-${month}-${day}`;
});

// Return Book
document.getElementById('returnForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const serialNo = document.getElementById('serialNo').value;
    const membershipId = document.getElementById('membershipId').value;
    const actualReturnDate = document.getElementById('actualReturnDate').value;
    
    if (!serialNo) {
        showError('Serial number is required');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/return`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                serialNo,
                membershipId,
                actualReturnDate,
                remarks: document.getElementById('remarks').value
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            if (data.fineAmount > 0) {
                // Redirect to pay fine page
                window.location.href = 'pay-fine.html';
            } else {
                window.location.href = 'confirmation.html';
            }
        } else {
            showError(data.msg);
        }
    } catch (error) {
        console.error('Return error:', error);
        showError('Server error');
    }
});

// Load issue details for return
async function loadIssueDetails() {
    const serialNo = document.getElementById('serialNo').value;
    const membershipId = document.getElementById('membershipId').value;
    
    if (!serialNo || !membershipId) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/issue/member/${membershipId}`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        const issues = await response.json();
        const normalize = s => (s || '').toString().trim().toLowerCase();

        // Prefer exact match on serialNo with accepted statuses, fallback to relaxed matches
        let issue = issues.find(i => normalize(i.serialNo) === normalize(serialNo) && ['issued','overdue'].includes((i.status||'').toLowerCase()));
        if (!issue) issue = issues.find(i => normalize(i.serialNo) === normalize(serialNo));
        if (!issue) {
            // try matching by serial subsets (remove non-alphanumerics)
            const clean = s => (s||'').toString().replace(/[^a-z0-9]/gi,'').toLowerCase();
            const cSerial = clean(serialNo);
            issue = issues.find(i => clean(i.serialNo) === cSerial || cSerial.includes(clean(i.serialNo)) || clean(i.serialNo).includes(cSerial));
        }

        if (issue) {
            document.getElementById('bookName').value = issue.itemName || '';
            document.getElementById('author').value = issue.authorName || '';
            document.getElementById('issueDate').value = (issue.issueDate || '').split && issue.issueDate.split('T') ? issue.issueDate.split('T')[0] : '';
            document.getElementById('returnDate').value = (issue.returnDate || '').split && issue.returnDate.split('T') ? issue.returnDate.split('T')[0] : '';
            
            document.getElementById('bookName').readOnly = true;
            document.getElementById('author').readOnly = true;
            document.getElementById('issueDate').readOnly = true;
        } else {
            console.warn('No matching issue found for', { serialNo, membershipId, issuesCount: issues.length });
        }
    } catch (error) {
        console.error('Load issue error:', error);
    }
}

// Pay Fine
async function loadMemberFines() {
    const membershipId = document.getElementById('membershipId').value;
    
    if (!membershipId) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/fine/member/${membershipId}`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        const fines = await response.json();
        displayFines(fines);
    } catch (error) {
        console.error('Load fines error:', error);
    }
}

function displayFines(fines) {
    const finesDiv = document.getElementById('finesList');
    
    if (fines.length === 0) {
        finesDiv.innerHTML = '<p>No pending fines</p>';
        return;
    }
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Book Name</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Days Overdue</th>
                    <th>Fine Amount</th>
                    <th>Pay</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    fines.forEach(fine => {
        html += `
            <tr>
                <td>${fine.itemName}</td>
                <td>${new Date(fine.returnDate).toLocaleDateString()}</td>
                <td>${new Date(fine.actualReturnDate).toLocaleDateString()}</td>
                <td>${fine.daysOverdue}</td>
                <td class="fine-amount">₹${fine.fineAmount}</td>
                <td>
                          <input type="checkbox" class="fine-checkbox" 
                              data-fine-id="${fine.fineId}" 
                              data-amount="${fine.fineAmount}"
                              data-book="${fine.itemName}">
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    finesDiv.innerHTML = html;
}

document.getElementById('payFineForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const allBoxes = document.querySelectorAll('.fine-checkbox');
    let checkboxes = document.querySelectorAll('.fine-checkbox:checked');

    // If no fine checkboxes exist at all, attempt to load fines once and give a clearer message
    if (allBoxes.length === 0) {
        const membershipId = document.getElementById('membershipId').value;
        if (membershipId) {
            await loadMemberFines();
        }
        const reloadedBoxes = document.querySelectorAll('.fine-checkbox');
        if (reloadedBoxes.length === 0) {
            showError('No pending fines found for this membership.');
            return;
        }
        checkboxes = document.querySelectorAll('.fine-checkbox:checked');
    }

    // If fines exist but none are selected, prompt user to select at least one
    if (checkboxes.length === 0) {
        showError('Please select at least one fine to pay');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        for (let checkbox of checkboxes) {
            const fineId = checkbox.dataset.fineId;
            
            await fetch(`${API_URL}/fine/pay/${fineId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    paidDate: new Date(),
                    remarks: document.getElementById('remarks').value
                })
            });
        }
        
        window.location.href = 'confirmation.html';
    } catch (error) {
        console.error('Pay fine error:', error);
        showError('Server error');
    }
});

// Error display
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}