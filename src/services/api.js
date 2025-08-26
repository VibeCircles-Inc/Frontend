// VibeCircles API Service - Supabase Edge Functions
// This service replaces the old Railway microservices

class APIService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_EDGE_FUNCTION_URL || 'https://your-project-id.supabase.co/functions/v1/index'
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    this.token = null
  }

  // Set authentication token
  setToken(token) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  // Get stored token
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  // Clear token
  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  // =============================================================================
  // AUTHENTICATION
  // =============================================================================

  async login(email, password) {
    try {
      const response = await this.request('auth', {
        action: 'login',
        email,
        password
      })
      
      if (response.success && response.session?.access_token) {
        this.setToken(response.session.access_token)
      }
      
      return response
    } catch (error) {
      throw new Error(error.message || 'Login failed')
    }
  }

  async register(email, password, username, fullName) {
    try {
      const response = await this.request('auth', {
        action: 'register',
        email,
        password,
        username,
        fullName
      })
      
      return response
    } catch (error) {
      throw new Error(error.message || 'Registration failed')
    }
  }

  async logout() {
    try {
      const response = await this.request('auth', {
        action: 'logout'
      })
      
      this.clearToken()
      return response
    } catch (error) {
      this.clearToken() // Clear token even if logout fails
      throw new Error(error.message || 'Logout failed')
    }
  }

  // =============================================================================
  // POSTS
  // =============================================================================

  async createPost(content, mediaUrls = [], privacy = 'public') {
    return this.request('posts', {
      action: 'create',
      content,
      mediaUrls,
      privacy
    })
  }

  async getFeed(page = 1, limit = 20) {
    return this.request('posts', {
      action: 'get_feed',
      page,
      limit
    })
  }

  async likePost(postId) {
    return this.request('posts', {
      action: 'like',
      postId
    })
  }

  async unlikePost(postId) {
    return this.request('posts', {
      action: 'unlike',
      postId
    })
  }

  async commentOnPost(postId, content) {
    return this.request('posts', {
      action: 'comment',
      postId,
      content
    })
  }

  // =============================================================================
  // USERS
  // =============================================================================

  async getProfile(userId = null) {
    return this.request('users', {
      action: 'get_profile',
      userId
    })
  }

  async updateProfile(data) {
    return this.request('users', {
      action: 'update_profile',
      ...data
    })
  }

  async searchUsers(searchTerm) {
    return this.request('users', {
      action: 'search',
      searchTerm
    })
  }

  async sendFriendRequest(friendId) {
    return this.request('users', {
      action: 'send_friend_request',
      friendId
    })
  }

  async acceptFriendRequest(friendshipId) {
    return this.request('users', {
      action: 'accept_friend_request',
      friendshipId
    })
  }

  async getFriends() {
    return this.request('users', {
      action: 'get_friends'
    })
  }

  // =============================================================================
  // MEDIA
  // =============================================================================

  async uploadMedia(file, type = 'post') {
    return this.request('media', {
      action: 'upload',
      file: await this.fileToBase64(file),
      type,
      filename: file.name
    })
  }

  async generateUploadUrl(type, filename, contentType) {
    return this.request('media', {
      action: 'generate_upload_url',
      type,
      filename,
      contentType
    })
  }

  async deleteMedia(key) {
    return this.request('media', {
      action: 'delete',
      key
    })
  }

  // =============================================================================
  // MESSAGES
  // =============================================================================

  async sendMessage(receiverId, content, mediaUrl = null) {
    return this.request('messages', {
      action: 'send',
      receiverId,
      content,
      mediaUrl
    })
  }

  async getConversation(userId) {
    return this.request('messages', {
      action: 'get_conversation',
      userId
    })
  }

  async getConversations() {
    return this.request('messages', {
      action: 'get_conversations'
    })
  }

  // =============================================================================
  // NOTIFICATIONS
  // =============================================================================

  async getNotifications() {
    return this.request('notifications', {
      action: 'get'
    })
  }

  async markNotificationAsRead(notificationId) {
    return this.request('notifications', {
      action: 'mark_read',
      notificationId
    })
  }

  async markAllNotificationsAsRead() {
    return this.request('notifications', {
      action: 'mark_all_read'
    })
  }

  // =============================================================================
  // EVENTS
  // =============================================================================

  async createEvent(data) {
    return this.request('events', {
      action: 'create',
      ...data
    })
  }

  async getEvents() {
    return this.request('events', {
      action: 'get'
    })
  }

  async getEvent(eventId) {
    return this.request('events', {
      action: 'get_event',
      eventId
    })
  }

  async rsvpToEvent(eventId, status) {
    return this.request('events', {
      action: 'rsvp',
      eventId,
      status
    })
  }

  // =============================================================================
  // GROUPS
  // =============================================================================

  async createGroup(data) {
    return this.request('groups', {
      action: 'create',
      ...data
    })
  }

  async getGroups() {
    return this.request('groups', {
      action: 'get'
    })
  }

  async getGroup(groupId) {
    return this.request('groups', {
      action: 'get_group',
      groupId
    })
  }

  async joinGroup(groupId) {
    return this.request('groups', {
      action: 'join',
      groupId
    })
  }

  // =============================================================================
  // SETTINGS
  // =============================================================================

  async getSettings() {
    return this.request('settings', {
      action: 'get'
    })
  }

  async updateSettings(data) {
    return this.request('settings', {
      action: 'update',
      ...data
    })
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  async request(endpoint, data = {}) {
    const url = this.baseURL
    const token = this.getToken()
    
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        endpoint,
        ...data
      })
    }

    try {
      const response = await fetch(url, config)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      return result
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  // =============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // =============================================================================

  subscribeToPosts(callback) {
    // This would use Supabase Realtime
    // Implementation depends on your frontend framework
    console.log('Subscribe to posts - implement with Supabase Realtime')
  }

  subscribeToMessages(callback) {
    // This would use Supabase Realtime
    console.log('Subscribe to messages - implement with Supabase Realtime')
  }

  subscribeToNotifications(callback) {
    // This would use Supabase Realtime
    console.log('Subscribe to notifications - implement with Supabase Realtime')
  }
}

// Create singleton instance
const apiService = new APIService()

export default apiService
