// Authentication Module for VibeCircles Frontend
// Handles login, registration, and session management

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        // Check if user is already logged in
        const token = localStorage.getItem('vibecircles_token');
        if (token) {
            try {
                const response = await api.getCurrentUser();
                if (response.success) {
                    this.currentUser = response.data.user;
                    this.isAuthenticated = true;
                    this.updateUI();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Failed to get current user:', error);
                this.logout();
            }
        }
    }

    async login(email, password) {
        try {
            const response = await api.login(email, password);
            
            if (response.success) {
                this.currentUser = response.data.user;
                this.isAuthenticated = true;
                this.updateUI();
                this.showNotification('Login successful!', 'success');
                return true;
            } else {
                this.showNotification(response.message || 'Login failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
            return false;
        }
    }

    async register(userData) {
        try {
            const response = await api.register(userData);
            
            if (response.success) {
                this.currentUser = response.data.user;
                this.isAuthenticated = true;
                this.updateUI();
                this.showNotification('Registration successful!', 'success');
                return true;
            } else {
                this.showNotification(response.message || 'Registration failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
            return false;
        }
    }

    async logout() {
        try {
            await api.logout();
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.currentUser = null;
            this.isAuthenticated = false;
            localStorage.removeItem('vibecircles_token');
            this.updateUI();
            this.showNotification('Logged out successfully', 'info');
            
            // Redirect to login page if not already there
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = '/login.html';
            }
        }
    }

    updateUI() {
        // Update navigation based on authentication status
        const authElements = document.querySelectorAll('[data-auth]');
        const guestElements = document.querySelectorAll('[data-guest]');
        const userElements = document.querySelectorAll('[data-user]');

        if (this.isAuthenticated) {
            // Show authenticated user elements
            authElements.forEach(el => el.style.display = 'block');
            guestElements.forEach(el => el.style.display = 'none');
            
            // Update user-specific elements
            userElements.forEach(el => {
                if (el.dataset.user === 'name') {
                    el.textContent = this.currentUser?.full_name || this.currentUser?.username || 'User';
                } else if (el.dataset.user === 'avatar') {
                    el.src = this.currentUser?.avatar_url || './assets/images/user/1.jpg';
                } else if (el.dataset.user === 'email') {
                    el.textContent = this.currentUser?.email || '';
                }
            });

            // Update logout button
            const logoutBtn = document.querySelector('[data-action="logout"]');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        } else {
            // Show guest elements
            authElements.forEach(el => el.style.display = 'none');
            guestElements.forEach(el => el.style.display = 'block');
            userElements.forEach(el => el.style.display = 'none');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
            }
        `;
        document.head.appendChild(style);

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
    }

    // Check if user is authenticated
    requireAuth() {
        if (!this.isAuthenticated) {
            this.showNotification('Please log in to access this page', 'error');
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isLoggedIn() {
        return this.isAuthenticated;
    }
}

// Create global auth instance
const auth = new AuthManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = auth;
} else {
    window.AuthManager = auth;
    window.auth = auth;
}
