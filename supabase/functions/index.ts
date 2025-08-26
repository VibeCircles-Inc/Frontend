import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    // Extract path from URL, handling both direct calls and path-based calls
    let path = url.pathname.replace('/functions/v1/', '')
    
    // If no path is specified (direct function call), use the first part of the URL
    if (!path || path === 'index') {
      // For direct function calls, we'll use a default or extract from body
      path = 'default'
    }
    
    const method = req.method

    // Parse request body for POST/PUT requests
    let body = {}
    if (method === 'POST' || method === 'PUT') {
      try {
        body = await req.json()
      } catch (e) {
        // Handle cases where body might be empty or not JSON
      }
    }

    // Route to appropriate handler based on path or body action
    let endpoint = path
    
    // If it's a direct function call, try to get endpoint from body
    if (path === 'default' && body && body.endpoint) {
      endpoint = body.endpoint
    }
    
    switch (endpoint) {
      case 'auth':
        return await handleAuth(supabaseClient, method, body, req.headers)
      
      case 'posts':
        return await handlePosts(supabaseClient, method, body, req.headers, url)
      
      case 'users':
        return await handleUsers(supabaseClient, method, body, req.headers, url)
      
      case 'media':
        return await handleMedia(supabaseClient, method, body, req.headers, url)
      
      case 'messages':
        return await handleMessages(supabaseClient, method, body, req.headers, url)
      
      case 'notifications':
        return await handleNotifications(supabaseClient, method, body, req.headers, url)
      
      case 'events':
        return await handleEvents(supabaseClient, method, body, req.headers, url)
      
      case 'groups':
        return await handleGroups(supabaseClient, method, body, req.headers, url)
      
      case 'settings':
        return await handleSettings(supabaseClient, method, body, req.headers, url)
      
      default:
        return new Response(
          JSON.stringify({ 
            message: 'VibeCircles API is running',
            available_endpoints: [
              'auth', 'posts', 'users', 'media', 'messages', 
              'notifications', 'events', 'groups', 'settings'
            ],
            usage: {
              direct_call: 'Add "endpoint" field to request body',
              path_based: 'Use URL path like /functions/v1/auth',
              example: {
                endpoint: 'auth',
                action: 'login',
                email: 'test@example.com',
                password: 'password'
              }
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 200 
          }
        )
    }

  } catch (error) {
    console.error('Edge Function Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

// Authentication handler
async function handleAuth(supabaseClient: any, method: string, body: any, headers: Headers) {
  const { action, ...data } = body

  switch (action) {
    case 'login':
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })
      
      if (authError) throw authError
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: authData.user, 
          session: authData.session 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'register':
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.fullName
          }
        }
      })
      
      if (signUpError) throw signUpError
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: signUpData.user 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'logout':
      const { error: logoutError } = await supabaseClient.auth.signOut()
      
      if (logoutError) throw logoutError
      
      return new Response(
        JSON.stringify({ success: true, message: 'Logged out successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Invalid auth action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
  }
}

// Posts handler
async function handlePosts(supabaseClient: any, method: string, body: any, headers: Headers, url: URL) {
  // Get user from JWT token
  const user = await getUserFromToken(supabaseClient, headers)
  
  const { action, ...data } = body

  switch (action) {
    case 'create':
      const { data: post, error: createError } = await supabaseClient
        .from('posts')
        .insert({
          user_id: user.id,
          content: data.content,
          media_urls: data.mediaUrls || [],
          privacy: data.privacy || 'public'
        })
        .select()
        .single()
      
      if (createError) throw createError
      
      return new Response(
        JSON.stringify({ success: true, post }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'get_feed':
      const { data: posts, error: feedError } = await supabaseClient
        .from('posts')
        .select(`
          *,
          profiles!posts(user_id) (id, username, full_name, avatar_url),
          likes (id, user_id),
          comments (id, content, created_at, profiles!comments(user_id) (username, avatar_url))
        `)
        .eq('privacy', 'public')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (feedError) throw feedError
      
      return new Response(
        JSON.stringify({ success: true, posts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Invalid posts action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
  }
}

// Users handler
async function handleUsers(supabaseClient: any, method: string, body: any, headers: Headers, url: URL) {
  const user = await getUserFromToken(supabaseClient, headers)
  
  const { action, ...data } = body

  switch (action) {
    case 'get_profile':
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', data.userId || user.id)
        .single()
      
      if (profileError) throw profileError
      
      return new Response(
        JSON.stringify({ success: true, profile }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'update_profile':
      const { data: updatedProfile, error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          username: data.username,
          full_name: data.fullName,
          bio: data.bio,
          avatar_url: data.avatarUrl,
          cover_url: data.coverUrl
        })
        .eq('id', user.id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      return new Response(
        JSON.stringify({ success: true, profile: updatedProfile }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Invalid users action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
  }
}

// Media handler
async function handleMedia(supabaseClient: any, method: string, body: any, headers: Headers, url: URL) {
  const user = await getUserFromToken(supabaseClient, headers)
  
  const { action, ...data } = body

  switch (action) {
    case 'upload':
      // This would integrate with Cloudflare R2
      // For now, return a placeholder response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Media upload endpoint - R2 integration needed',
          action: 'upload'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Invalid media action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
  }
}

// Messages handler
async function handleMessages(supabaseClient: any, method: string, body: any, headers: Headers, url: URL) {
  const user = await getUserFromToken(supabaseClient, headers)
  
  const { action, ...data } = body

  switch (action) {
    case 'send':
      const { data: message, error: messageError } = await supabaseClient
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: data.receiverId,
          content: data.content,
          media_url: data.mediaUrl
        })
        .select()
        .single()
      
      if (messageError) throw messageError
      
      return new Response(
        JSON.stringify({ success: true, message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'get_conversation':
      const { data: messages, error: convError } = await supabaseClient
        .from('messages')
        .select(`
          *,
          profiles!messages(sender_id) (id, username, avatar_url),
          profiles!messages(receiver_id) (id, username, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true })
      
      if (convError) throw convError
      
      return new Response(
        JSON.stringify({ success: true, messages }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Invalid messages action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
  }
}

// Notifications handler
async function handleNotifications(supabaseClient: any, method: string, body: any, headers: Headers, url: URL) {
  const user = await getUserFromToken(supabaseClient, headers)
  
  const { action, ...data } = body

  switch (action) {
    case 'get':
      const { data: notifications, error: notifError } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (notifError) throw notifError
      
      return new Response(
        JSON.stringify({ success: true, notifications }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'mark_read':
      const { error: updateError } = await supabaseClient
        .from('notifications')
        .update({ is_read: true })
        .eq('id', data.notificationId)
        .eq('user_id', user.id)
      
      if (updateError) throw updateError
      
      return new Response(
        JSON.stringify({ success: true, message: 'Notification marked as read' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Invalid notifications action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
  }
}

// Events handler
async function handleEvents(supabaseClient: any, method: string, body: any, headers: Headers, url: URL) {
  const user = await getUserFromToken(supabaseClient, headers)
  
  const { action, ...data } = body

  switch (action) {
    case 'create':
      const { data: event, error: eventError } = await supabaseClient
        .from('events')
        .insert({
          title: data.title,
          description: data.description,
          location: data.location,
          start_date: data.startDate,
          end_date: data.endDate,
          privacy: data.privacy || 'public',
          created_by: user.id
        })
        .select()
        .single()
      
      if (eventError) throw eventError
      
      return new Response(
        JSON.stringify({ success: true, event }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'get':
      const { data: events, error: eventsError } = await supabaseClient
        .from('events')
        .select(`
          *,
          profiles!events(created_by) (id, username, avatar_url)
        `)
        .eq('privacy', 'public')
        .order('start_date', { ascending: true })
      
      if (eventsError) throw eventsError
      
      return new Response(
        JSON.stringify({ success: true, events }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Invalid events action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
  }
}

// Groups handler
async function handleGroups(supabaseClient: any, method: string, body: any, headers: Headers, url: URL) {
  const user = await getUserFromToken(supabaseClient, headers)
  
  const { action, ...data } = body

  switch (action) {
    case 'create':
      const { data: group, error: groupError } = await supabaseClient
        .from('groups')
        .insert({
          name: data.name,
          description: data.description,
          privacy: data.privacy || 'public',
          created_by: user.id
        })
        .select()
        .single()
      
      if (groupError) throw groupError
      
      return new Response(
        JSON.stringify({ success: true, group }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'get':
      const { data: groups, error: groupsError } = await supabaseClient
        .from('groups')
        .select(`
          *,
          profiles!groups(created_by) (id, username, avatar_url)
        `)
        .eq('privacy', 'public')
        .order('created_at', { ascending: false })
      
      if (groupsError) throw groupsError
      
      return new Response(
        JSON.stringify({ success: true, groups }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Invalid groups action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
  }
}

// Settings handler
async function handleSettings(supabaseClient: any, method: string, body: any, headers: Headers, url: URL) {
  const user = await getUserFromToken(supabaseClient, headers)
  
  const { action, ...data } = body

  switch (action) {
    case 'get':
      const { data: settings, error: settingsError } = await supabaseClient
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (settingsError) throw settingsError
      
      return new Response(
        JSON.stringify({ success: true, settings }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    case 'update':
      const { data: updatedSettings, error: updateError } = await supabaseClient
        .from('user_settings')
        .update({
          email_notifications: data.emailNotifications,
          push_notifications: data.pushNotifications,
          friend_requests: data.friendRequests,
          post_privacy: data.postPrivacy,
          profile_visibility: data.profileVisibility
        })
        .eq('id', user.id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      return new Response(
        JSON.stringify({ success: true, settings: updatedSettings }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    default:
      return new Response(
        JSON.stringify({ error: 'Invalid settings action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
  }
}

// Helper function to get user from JWT token
async function getUserFromToken(supabaseClient: any, headers: Headers) {
  const authHeader = headers.get('Authorization')
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  
  if (userError || !user) {
    throw new Error('Invalid token')
  }

  return user
}
