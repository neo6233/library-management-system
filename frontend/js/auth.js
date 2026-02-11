// Authentication Module

const API_URL = 'http://localhost:5000/api';

// Login function
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect based on role
            if (data.user.isAdmin || data.user.role === 'admin') {
                window.location.href = 'admin-home.html';
            } else {
                window.location.href = 'user-home.html';
            }
        } else {
            errorDiv.textContent = data.msg || 'Invalid credentials';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Server error. Please try again.';
        errorDiv.style.display = 'block';
    }
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }
    
    return { token, user };
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'logout.html';
}

document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

// Load user info in sidebar
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInfoDiv = document.getElementById('userInfo');
    
    if (userInfoDiv) {
        userInfoDiv.innerHTML = `
            <h4>${user.name || 'User'}</h4>
            <p>${user.userId || ''}</p>
            <p>Role: ${user.isAdmin ? 'Admin' : 'User'}</p>
        `;
    }
}

// Update date time
function updateDateTime() {
    const dateTimeElement = document.getElementById('currentDateTime');
    if (dateTimeElement) {
        const now = new Date();
        dateTimeElement.textContent = now.toLocaleString();
    }
}

setInterval(updateDateTime, 1000);

// Load user info on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    updateDateTime();
});