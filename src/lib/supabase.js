// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// =============================================================================
// AUTHENTICATION HELPERS
// =============================================================================

export const auth = {
  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  // Sign up with email and password
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Reset password
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  },

  // Update password
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  },

  // Update user metadata
  async updateUser(updates) {
    const { data, error } = await supabase.auth.updateUser(updates)
    if (error) throw error
    return data
  }
}

// =============================================================================
// REAL-TIME SUBSCRIPTIONS
// =============================================================================

export const realtime = {
  // Subscribe to posts
  subscribeToPosts(callback) {
    return supabase
      .channel('posts')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts' 
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to messages
  subscribeToMessages(userId, callback) {
    return supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `sender_id=eq.${userId} OR receiver_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to notifications
  subscribeToNotifications(userId, callback) {
    return supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to comments
  subscribeToComments(callback) {
    return supabase
      .channel('comments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments' 
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to likes
  subscribeToLikes(callback) {
    return supabase
      .channel('likes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'likes' 
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to friend requests
  subscribeToFriendRequests(userId, callback) {
    return supabase
      .channel('friend_requests')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'friendships',
          filter: `friend_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  // Unsubscribe from all channels
  unsubscribeAll() {
    supabase.removeAllChannels()
  }
}

// =============================================================================
// DATABASE HELPERS
// =============================================================================

export const db = {
  // Profiles
  profiles: {
    async get(userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data
    },

    async update(userId, updates) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Posts
  posts: {
    async getFeed(page = 1, limit = 20) {
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts(user_id) (id, username, full_name, avatar_url),
          likes (id, user_id),
          comments (id, content, created_at, profiles!comments(user_id) (username, avatar_url))
        `)
        .eq('privacy', 'public')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      return data
    },

    async create(post) {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // Messages
  messages: {
    async getConversation(userId1, userId2) {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages(sender_id) (id, username, avatar_url),
          profiles!messages(receiver_id) (id, username, avatar_url)
        `)
        .or(`sender_id.eq.${userId1},receiver_id.eq.${userId1}`)
        .or(`sender_id.eq.${userId2},receiver_id.eq.${userId2}`)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    }
  }
}

// =============================================================================
// STORAGE HELPERS
// =============================================================================

export const storage = {
  // Upload file to Supabase Storage
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    if (error) throw error
    return data
  },

  // Get public URL for file
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  // Delete file from storage
  async deleteFile(bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    if (error) throw error
  }
}

export default supabase
