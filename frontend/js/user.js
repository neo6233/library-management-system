// User Management Module (Admin Only)

// Check if user is admin
function checkAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.isAdmin && user.role !== 'admin') {
        window.location.href = 'user-home.html';
        return false;
    }
    return true;
}

// Load users list
async function loadUsers() {
    if (!checkAdmin()) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/maintenance/users`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Load users error:', error);
    }
}

function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    
    if (!usersList) return;
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Admin</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.userId}</td>
                <td>${user.name}</td>
                <td>${user.role}</td>
                <td>${user.isAdmin ? 'Yes' : 'No'}</td>
                <td>
                    <span class="${user.active ? 'status-available' : 'status-issued'}">
                        ${user.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button onclick="editUser('${user.userId}')" class="btn btn-secondary">Edit</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    usersList.innerHTML = html;
}

// Add User
document.getElementById('addUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!checkAdmin()) return;
    
    const userType = document.querySelector('input[name="userType"]:checked').value;
    
    const userData = {
        name: document.getElementById('name').value,
        userId: document.getElementById('userId').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        isAdmin: document.getElementById('isAdmin').checked,
        active: document.getElementById('active').checked
    };
    
    // Validation
    if (!userData.name) {
        showError('Name is mandatory');
        return;
    }
    
    if (userType === 'new' && !userData.password) {
        showError('Password is required for new user');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/maintenance/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            window.location.href = 'confirmation.html';
        } else {
            const data = await response.json();
            showError(data.msg);
        }
    } catch (error) {
        console.error('Add user error:', error);
        showError('Server error');
    }
});

// Update User
async function loadUserForEdit() {
    const userId = document.getElementById('editUserId').value;
    
    if (!userId) {
        showError('User ID is required');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/maintenance/users`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        const users = await response.json();
        const user = users.find(u => u.userId === userId);
        
        if (user) {
            document.getElementById('name').value = user.name;
            document.getElementById('role').value = user.role;
            document.getElementById('isAdmin').checked = user.isAdmin;
            document.getElementById('active').checked = user.active;
        } else {
            showError('User not found');
        }
    } catch (error) {
        console.error('Load user error:', error);
        showError('Server error');
    }
}

document.getElementById('updateUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!checkAdmin()) return;
    
    const userId = document.getElementById('editUserId').value;
    
    const userData = {
        name: document.getElementById('name').value,
        role: document.getElementById('role').value,
        isAdmin: document.getElementById('isAdmin').checked,
        active: document.getElementById('active').checked
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/maintenance/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            window.location.href = 'confirmation.html';
        } else {
            const data = await response.json();
            showError(data.msg);
        }
    } catch (error) {
        console.error('Update user error:', error);
        showError('Server error');
    }
});

// Toggle between New and Existing User
document.querySelectorAll('input[name="userType"]')?.forEach(radio => {
    radio.addEventListener('change', function() {
        const passwordGroup = document.getElementById('passwordGroup');
        const editUserGroup = document.getElementById('editUserGroup');
        
        if (this.value === 'new') {
            if (passwordGroup) passwordGroup.style.display = 'block';
            if (editUserGroup) editUserGroup.style.display = 'none';
        } else {
            if (passwordGroup) passwordGroup.style.display = 'none';
            if (editUserGroup) editUserGroup.style.display = 'block';
        }
    });
});