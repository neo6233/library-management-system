// Membership Module

// Add Membership
document.getElementById('addMembershipForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const membershipData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        contactNumber: document.getElementById('contactNumber').value,
        contactAddress: document.getElementById('contactAddress').value,
        aadharCardNo: document.getElementById('aadharCardNo').value,
        startDate: document.getElementById('startDate').value,
        membershipType: document.querySelector('input[name="membershipType"]:checked').value
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/membership`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(membershipData)
        });
        
        if (response.ok) {
            window.location.href = 'confirmation.html';
        } else {
            const data = await response.json();
            showError(data.msg);
        }
    } catch (error) {
        console.error('Add membership error:', error);
        showError('Server error');
    }
});

// Update Membership
async function loadMembership() {
    const membershipId = document.getElementById('membershipId').value;
    
    if (!membershipId) {
        showError('Membership Number is required');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/membership/${membershipId}`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (response.ok) {
            const membership = await response.json();
            
            document.getElementById('firstName').value = membership.firstName;
            document.getElementById('lastName').value = membership.lastName;
            document.getElementById('contactNumber').value = membership.contactNumber;
            document.getElementById('contactAddress').value = membership.contactAddress;
            document.getElementById('aadharCardNo').value = membership.aadharCardNo;
            document.getElementById('startDate').value = membership.startDate.split('T')[0];
            document.getElementById('endDate').value = membership.endDate.split('T')[0];
            
            // Enable extension options
            document.querySelectorAll('input[name="extensionType"]').forEach(radio => {
                radio.disabled = false;
            });
            document.querySelector('input[name="membershipRemove"]').disabled = false;
            
            // Set default extension
            document.getElementById('extension6months').checked = true;
        } else {
            showError('Membership not found');
        }
    } catch (error) {
        console.error('Load membership error:', error);
        showError('Server error');
    }
}

document.getElementById('updateMembershipForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const membershipId = document.getElementById('membershipId').value;
    const action = document.querySelector('input[name="membershipRemove"]').checked ? 'cancel' : 'extend';
    const extensionType = action === 'extend' ? 
        document.querySelector('input[name="extensionType"]:checked')?.value : null;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/membership/${membershipId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ action, extensionType })
        });
        
        if (response.ok) {
            window.location.href = 'confirmation.html';
        } else {
            const data = await response.json();
            showError(data.msg);
        }
    } catch (error) {
        console.error('Update membership error:', error);
        showError('Server error');
    }
});