// API Configuration for VibeCircles Frontend
// This file handles all communication between frontend and backend

class VibeCirclesAPI {
    constructor() {
        // API Base URLs - change these based on your setup
        this.BACKEND_URL = 'http://localhost:3000/api'; // Node.js backend
        this.PHP_API_URL = '/api'; // PHP API endpoints
        
        // Default headers
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
        
        // Get stored token
        this.token = localStorage.getItem('vibecircles_token');
        if (this.token) {
            this.defaultHeaders['Authorization'] = `Bearer ${this.token}`;
        }
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('vibecircles_token', token);
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('vibecircles_token');
        delete this.defaultHeaders['Authorization'];
    }

    // Generic request method
    async makeRequest(url, options = {}) {
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication Methods
    async login(email, password) {
        const response = await this.makeRequest(`${this.BACKEND_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    async register(userData) {
        const response = await this.makeRequest(`${this.BACKEND_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    async logout() {
        try {
            await this.makeRequest(`${this.BACKEND_URL}/auth/logout`, {
                method: 'POST'
            });
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.clearToken();
        }
    }

    async getCurrentUser() {
        return await this.makeRequest(`${this.BACKEND_URL}/auth/me`);
    }

    // User Methods
    async getUsers(limit = 50, offset = 0, search = '') {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        });
        
        if (search) {
            params.append('search', search);
        }

        return await this.makeRequest(`${this.BACKEND_URL}/users?${params}`);
    }

    async getUserProfile(userId) {
        return await this.makeRequest(`${this.BACKEND_URL}/users/${userId}`);
    }

    async updateProfile(userId, profileData) {
        return await this.makeRequest(`${this.BACKEND_URL}/users/${userId}/profile`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Post Methods
    async getPosts(limit = 20, offset = 0, userId = null) {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        });
        
        if (userId) {
            params.append('user_id', userId.toString());
        }

        return await this.makeRequest(`${this.BACKEND_URL}/posts?${params}`);
    }

    async getPost(postId) {
        return await this.makeRequest(`${this.BACKEND_URL}/posts/${postId}`);
    }

    async createPost(postData) {
        return await this.makeRequest(`${this.BACKEND_URL}/posts`, {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    }

    async updatePost(postId, postData) {
        return await this.makeRequest(`${this.BACKEND_URL}/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    }

    async deletePost(postId) {
        return await this.makeRequest(`${this.BACKEND_URL}/posts/${postId}`, {
            method: 'DELETE'
        });
    }

    async likePost(postId) {
        return await this.makeRequest(`${this.BACKEND_URL}/posts/${postId}/like`, {
            method: 'POST'
        });
    }

    // Comment Methods
    async getComments(postId, limit = 50, offset = 0) {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        });

        return await this.makeRequest(`${this.BACKEND_URL}/posts/${postId}/comments?${params}`);
    }

    async addComment(postId, commentData) {
        return await this.makeRequest(`${this.BACKEND_URL}/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
    }

    async deleteComment(commentId) {
        return await this.makeRequest(`${this.BACKEND_URL}/comments/${commentId}`, {
            method: 'DELETE'
        });
    }

    // Friend Methods
    async getFriends(userId) {
        return await this.makeRequest(`${this.BACKEND_URL}/users/${userId}/friends`);
    }

    async sendFriendRequest(userId) {
        return await this.makeRequest(`${this.BACKEND_URL}/users/${userId}/friend-request`, {
            method: 'POST'
        });
    }

    async respondToFriendRequest(userId, action) {
        return await this.makeRequest(`${this.BACKEND_URL}/users/${userId}/friend-request`, {
            method: 'PUT',
            body: JSON.stringify({ action }) // 'accept' or 'reject'
        });
    }

    async removeFriend(userId) {
        return await this.makeRequest(`${this.BACKEND_URL}/users/${userId}/friend`, {
            method: 'DELETE'
        });
    }

    // File Upload Method
    async uploadFile(file, type = 'image') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        return await this.makeRequest(`${this.BACKEND_URL}/upload`, {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData
        });
    }

    // Health Check
    async healthCheck() {
        return await this.makeRequest(`${this.BACKEND_URL}/health`);
    }
}

// Create global API instance
const api = new VibeCirclesAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
} else {
    window.VibeCirclesAPI = api;
    window.api = api;
}
