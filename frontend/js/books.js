// Books Module

// Add Book/Movie
document.getElementById('addBookForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const itemType = document.querySelector('input[name="itemType"]:checked').value;
    const apiEndpoint = itemType === 'Book' ? 'books' : 'movies';
    
    const itemData = {
        name: document.getElementById('itemName').value,
        [itemType === 'Book' ? 'author' : 'director']: document.getElementById('creator').value,
        category: document.getElementById('category').value,
        cost: document.getElementById('cost').value,
        procurementDate: document.getElementById('procurementDate').value,
        quantity: document.getElementById('quantity').value || 1
    };
    
    // Validation
    if (!itemData.name) {
        showError('Name is required');
        return;
    }
    
    if (!itemData[itemType === 'Book' ? 'author' : 'director']) {
        showError(itemType === 'Book' ? 'Author name is required' : 'Director name is required');
        return;
    }
    
    if (!itemData.category) {
        showError('Category is required');
        return;
    }
    
    if (!itemData.cost) {
        showError('Cost is required');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${apiEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(itemData)
        });
        
        if (response.ok) {
            window.location.href = 'confirmation.html';
        } else {
            const data = await response.json();
            showError(data.msg);
        }
    } catch (error) {
        console.error('Add item error:', error);
        showError('Server error');
    }
});

// Update Book/Movie
async function loadItem() {
    const serialNo = document.getElementById('serialNo').value;
    const itemType = document.querySelector('input[name="itemType"]:checked').value;
    const apiEndpoint = itemType === 'Book' ? 'books' : 'movies';
    
    if (!serialNo) {
        showError('Serial Number is required');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        // Note: You'll need to add a GET endpoint for single item
        const response = await fetch(`${API_URL}/${apiEndpoint}/search?query=${serialNo}`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        const items = await response.json();
        const item = items.find(i => i.serialNo === serialNo);
        
        if (item) {
            document.getElementById('itemName').value = item.name;
            document.getElementById('creator').value = item.author || item.director;
            document.getElementById('category').value = item.category;
            document.getElementById('status').value = item.status;
            document.getElementById('cost').value = item.cost;
            document.getElementById('procurementDate').value = item.procurementDate.split('T')[0];
        } else {
            showError('Item not found');
        }
    } catch (error) {
        console.error('Load item error:', error);
        showError('Server error');
    }
}

document.getElementById('updateBookForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const serialNo = document.getElementById('serialNo').value;
    const itemType = document.querySelector('input[name="itemType"]:checked').value;
    const apiEndpoint = itemType === 'Book' ? 'books' : 'movies';
    
    const itemData = {
        name: document.getElementById('itemName').value,
        [itemType === 'Book' ? 'author' : 'director']: document.getElementById('creator').value,
        category: document.getElementById('category').value,
        status: document.getElementById('status').value,
        cost: document.getElementById('cost').value
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${apiEndpoint}/${serialNo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(itemData)
        });
        
        if (response.ok) {
            window.location.href = 'confirmation.html';
        } else {
            const data = await response.json();
            showError(data.msg);
        }
    } catch (error) {
        console.error('Update item error:', error);
        showError('Server error');
    }
});

// Toggle between Book and Movie fields
document.querySelectorAll('input[name="itemType"]')?.forEach(radio => {
    radio.addEventListener('change', function() {
        const creatorLabel = document.querySelector('label[for="creator"]');
        const creatorInput = document.getElementById('creator');
        
        if (this.value === 'Book') {
            creatorLabel.textContent = 'Author Name';
            creatorInput.placeholder = 'Enter author name';
        } else {
            creatorLabel.textContent = 'Director Name';
            creatorInput.placeholder = 'Enter director name';
        }
    });
});