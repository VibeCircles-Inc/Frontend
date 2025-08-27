// VibeCircles Supabase Client Configuration
// This file handles all Supabase connections and API calls

class VibeCirclesSupabaseClient {
    constructor() {
        // Supabase configuration
        this.supabaseUrl = 'https://your-project-ref.supabase.co' // Replace with your actual Supabase URL
        this.supabaseAnonKey = 'your-anon-key' // Replace with your actual anon key
        
        // Initialize Supabase client
        this.supabase = null
        this.isInitialized = false
        
        // Real-time subscriptions
        this.subscriptions = new Map()
        
        // API endpoints
        this.apiEndpoints = {
            users: '/functions/v1/vibecircles-api/users',
            activities: '/functions/v1/vibecircles-api/activities',
            messages: '/functions/v1/vibecircles-api/messages',
            friendships: '/functions/v1/vibecircles-api/friendships',
            statistics: '/functions/v1/vibecircles-api/statistics',
            posts: '/functions/v1/vibecircles-api/posts',
            comments: '/functions/v1/vibecircles-api/comments',
            likes: '/functions/v1/vibecircles-api/likes',
            notifications: '/functions/v1/vibecircles-api/notifications',
            realtime: '/functions/v1/realtime-sync'
        }
        
        this.init()
    }

    async init() {
        try {
            // Load Supabase client dynamically
            if (typeof window !== 'undefined') {
                const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
                this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey)
                this.isInitialized = true
                console.log('✅ VibeCircles Supabase client initialized')
            }
        } catch (error) {
            console.error('❌ Failed to initialize Supabase client:', error)
        }
    }

    // Generic API call method
    async apiCall(endpoint, method = 'GET', data = null) {
        if (!this.isInitialized) {
            throw new Error('Supabase client not initialized')
        }

        try {
            const url = `${this.supabaseUrl}${endpoint}`
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.supabaseAnonKey}`
                }
            }

            if (data && method !== 'GET') {
                options.body = JSON.stringify(data)
            }

            const response = await fetch(url, options)
            
            if (!response.ok) {
                throw new Error(`API call failed: ${response.status} ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error(`API call error for ${endpoint}:`, error)
            throw error
        }
    }

    // User Management
    async getUsers() {
        return await this.apiCall(this.apiEndpoints.users)
    }

    async createUser(userData) {
        return await this.apiCall(this.apiEndpoints.users, 'POST', userData)
    }

    async updateUser(userId, userData) {
        return await this.apiCall(this.apiEndpoints.users, 'PUT', { id: userId, ...userData })
    }

    // Activity Management
    async getActivities() {
        return await this.apiCall(this.apiEndpoints.activities)
    }

    async createActivity(activityData) {
        return await this.apiCall(this.apiEndpoints.activities, 'POST', activityData)
    }

    // Message Management
    async getMessages() {
        return await this.apiCall(this.apiEndpoints.messages)
    }

    async sendMessage(messageData) {
        return await this.apiCall(this.apiEndpoints.messages, 'POST', messageData)
    }

    async markMessageAsRead(messageId) {
        return await this.apiCall(this.apiEndpoints.messages, 'PUT', { id: messageId })
    }

    // Friendship Management
    async getFriendships(userId) {
        return await this.apiCall(this.apiEndpoints.friendships, 'GET', { user_id: userId })
    }

    async sendFriendRequest(friendshipData) {
        return await this.apiCall(this.apiEndpoints.friendships, 'POST', friendshipData)
    }

    async updateFriendship(friendshipId, status) {
        return await this.apiCall(this.apiEndpoints.friendships, 'PUT', { id: friendshipId, status })
    }

    // Statistics Management
    async getStatistics(userId) {
        return await this.apiCall(this.apiEndpoints.statistics, 'GET', { user_id: userId })
    }

    async updateStatistics(statData) {
        return await this.apiCall(this.apiEndpoints.statistics, 'POST', statData)
    }

    // Post Management
    async getPosts() {
        return await this.apiCall(this.apiEndpoints.posts)
    }

    async createPost(postData) {
        return await this.apiCall(this.apiEndpoints.posts, 'POST', postData)
    }

    async updatePost(postId, postData) {
        return await this.apiCall(this.apiEndpoints.posts, 'PUT', { id: postId, ...postData })
    }

    // Comment Management
    async getComments(postId) {
        return await this.apiCall(this.apiEndpoints.comments, 'GET', { post_id: postId })
    }

    async addComment(commentData) {
        return await this.apiCall(this.apiEndpoints.comments, 'POST', commentData)
    }

    // Like Management
    async getLikes(postId) {
        return await this.apiCall(this.apiEndpoints.likes, 'GET', { post_id: postId })
    }

    async addLike(likeData) {
        return await this.apiCall(this.apiEndpoints.likes, 'POST', likeData)
    }

    async removeLike(userId, postId) {
        return await this.apiCall(this.apiEndpoints.likes, 'DELETE', { user_id: userId, post_id: postId })
    }

    // Notification Management
    async getNotifications(userId) {
        return await this.apiCall(this.apiEndpoints.notifications, 'GET', { user_id: userId })
    }

    async createNotification(notificationData) {
        return await this.apiCall(this.apiEndpoints.notifications, 'POST', notificationData)
    }

    async markNotificationAsRead(notificationId) {
        return await this.apiCall(this.apiEndpoints.notifications, 'PUT', { id: notificationId })
    }

    // Real-time Subscriptions
    async subscribeToChannel(channel, callback) {
        if (!this.supabase) {
            throw new Error('Supabase client not available')
        }

        try {
            const subscription = this.supabase
                .channel(channel)
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: channel 
                    }, 
                    (payload) => {
                        console.log(`Real-time update in ${channel}:`, payload)
                        if (callback) {
                            callback(payload)
                        }
                    }
                )
                .subscribe()

            this.subscriptions.set(channel, subscription)
            console.log(`✅ Subscribed to ${channel}`)
            
            return subscription
        } catch (error) {
            console.error(`❌ Failed to subscribe to ${channel}:`, error)
            throw error
        }
    }

    async unsubscribeFromChannel(channel) {
        const subscription = this.subscriptions.get(channel)
        if (subscription) {
            await this.supabase.removeChannel(subscription)
            this.subscriptions.delete(channel)
            console.log(`✅ Unsubscribed from ${channel}`)
        }
    }

    async subscribeToAllChannels(callback) {
        const channels = ['users', 'activities', 'messages', 'notifications', 'posts', 'comments', 'likes']
        
        for (const channel of channels) {
            await this.subscribeToChannel(channel, callback)
        }
    }

    async unsubscribeFromAllChannels() {
        for (const [channel] of this.subscriptions) {
            await this.unsubscribeFromChannel(channel)
        }
    }

    // Data Sync Methods
    async syncDataFromSupabase() {
        try {
            console.log('🔄 Syncing data from Supabase...')
            
            const [users, activities, messages, statistics, posts] = await Promise.all([
                this.getUsers(),
                this.getActivities(),
                this.getMessages(),
                this.getStatistics('550e8400-e29b-41d4-a716-446655440001'), // Default user
                this.getPosts()
            ])

            return {
                users: users.users || [],
                activities: activities.activities || [],
                messages: messages.messages || [],
                statistics: statistics.statistics || [],
                posts: posts.posts || []
            }
        } catch (error) {
            console.error('❌ Failed to sync data from Supabase:', error)
            throw error
        }
    }

    // Utility Methods
    async isConnected() {
        try {
            await this.getUsers()
            return true
        } catch (error) {
            return false
        }
    }

    getConnectionStatus() {
        return {
            initialized: this.isInitialized,
            connected: this.subscriptions.size > 0,
            subscriptions: Array.from(this.subscriptions.keys())
        }
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`❌ Error in ${context}:`, error)
        
        // You can add custom error handling here
        // For example, showing user-friendly error messages
        if (error.message.includes('network')) {
            console.warn('🌐 Network error - data may be cached locally')
        }
        
        return error
    }
}

// Create global instance
window.VibeCirclesSupabase = new VibeCirclesSupabaseClient()

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibeCirclesSupabaseClient
}
