// Chat Service - Real-time messaging with WebSocket
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { db } = require('../supabase-client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

// Store active connections
const connections = new Map(); // userId -> WebSocket
const userRooms = new Map(); // userId -> Set of roomIds

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// WebSocket connection handler
wss.on('connection', async (ws, req) => {
  console.log('New WebSocket connection');

  let userId = null;
  let userProfile = null;

  // Authenticate WebSocket connection
  try {
    const token = req.url.split('token=')[1];
    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
    
    // Get user profile
    const { data: profile, error } = await db.profiles.getById(userId);
    if (error || !profile) {
      ws.close(1008, 'User not found');
      return;
    }
    
    userProfile = profile;
    
    // Store connection
    connections.set(userId, ws);
    userRooms.set(userId, new Set());
    
    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      userId: userId,
      timestamp: new Date().toISOString()
    }));

    // Broadcast user online status
    broadcastToFriends(userId, {
      type: 'user_online',
      userId: userId,
      timestamp: new Date().toISOString()
    });

    console.log(`User ${userId} connected`);

  } catch (error) {
    console.error('WebSocket authentication error:', error);
    ws.close(1008, 'Authentication failed');
    return;
  }

  // Handle incoming messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'send_message':
          await handleSendMessage(userId, message);
          break;
          
        case 'typing_start':
          await handleTypingStart(userId, message);
          break;
          
        case 'typing_stop':
          await handleTypingStop(userId, message);
          break;
          
        case 'read_messages':
          await handleReadMessages(userId, message);
          break;
          
        case 'join_room':
          await handleJoinRoom(userId, message);
          break;
          
        case 'leave_room':
          await handleLeaveRoom(userId, message);
          break;
          
        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type'
          }));
      }
    } catch (error) {
      console.error('Message handling error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  // Handle connection close
  ws.on('close', () => {
    if (userId) {
      connections.delete(userId);
      userRooms.delete(userId);
      
      // Broadcast user offline status
      broadcastToFriends(userId, {
        type: 'user_offline',
        userId: userId,
        timestamp: new Date().toISOString()
      });
      
      console.log(`User ${userId} disconnected`);
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Message handlers
async function handleSendMessage(senderId, message) {
  try {
    const { receiverId, content, messageType = 'text', mediaUrl } = message;
    
    // Validate receiver exists
    const { data: receiver, error: receiverError } = await db.profiles.getById(receiverId);
    if (receiverError || !receiver) {
      sendToUser(senderId, {
        type: 'error',
        message: 'Receiver not found'
      });
      return;
    }

    // Save message to database
    const { data: savedMessage, error: saveError } = await db.messages.send(
      senderId,
      receiverId,
      content,
      mediaUrl
    );

    if (saveError) {
      sendToUser(senderId, {
        type: 'error',
        message: 'Failed to save message'
      });
      return;
    }

    // Send to sender (confirmation)
    sendToUser(senderId, {
      type: 'message_sent',
      message: savedMessage,
      timestamp: new Date().toISOString()
    });

    // Send to receiver
    sendToUser(receiverId, {
      type: 'new_message',
      message: savedMessage,
      sender: {
        id: senderId,
        username: userProfile?.username,
        full_name: userProfile?.full_name,
        avatar_url: userProfile?.avatar_url
      },
      timestamp: new Date().toISOString()
    });

    // Create notification
    await createNotification(receiverId, 'new_message', {
      sender_id: senderId,
      message_id: savedMessage.id,
      content: content.substring(0, 100) // Truncate for notification
    });

  } catch (error) {
    console.error('Send message error:', error);
    sendToUser(senderId, {
      type: 'error',
      message: 'Failed to send message'
    });
  }
}

async function handleTypingStart(userId, message) {
  const { receiverId } = message;
  
  sendToUser(receiverId, {
    type: 'typing_start',
    userId: userId,
    timestamp: new Date().toISOString()
  });
}

async function handleTypingStop(userId, message) {
  const { receiverId } = message;
  
  sendToUser(receiverId, {
    type: 'typing_stop',
    userId: userId,
    timestamp: new Date().toISOString()
  });
}

async function handleReadMessages(userId, message) {
  try {
    const { senderId } = message;
    
    // Mark messages as read in database
    await db.messages.markAsRead(userId, senderId);
    
    // Notify sender that messages were read
    sendToUser(senderId, {
      type: 'messages_read',
      userId: userId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Read messages error:', error);
  }
}

async function handleJoinRoom(userId, message) {
  const { roomId } = message;
  
  const userRoomsSet = userRooms.get(userId) || new Set();
  userRoomsSet.add(roomId);
  userRooms.set(userId, userRoomsSet);
  
  sendToUser(userId, {
    type: 'room_joined',
    roomId: roomId,
    timestamp: new Date().toISOString()
  });
}

async function handleLeaveRoom(userId, message) {
  const { roomId } = message;
  
  const userRoomsSet = userRooms.get(userId);
  if (userRoomsSet) {
    userRoomsSet.delete(roomId);
  }
  
  sendToUser(userId, {
    type: 'room_left',
    roomId: roomId,
    timestamp: new Date().toISOString()
  });
}

// Utility functions
function sendToUser(userId, data) {
  const ws = connections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcastToFriends(userId, data) {
  // Get user's friends and send to all online friends
  db.friendships.getFriends(userId)
    .then(friends => {
      friends.forEach(friend => {
        sendToUser(friend.id, data);
      });
    })
    .catch(error => {
      console.error('Broadcast to friends error:', error);
    });
}

async function createNotification(userId, type, data) {
  try {
    await db.notifications.create({
      user_id: userId,
      type: type,
      title: getNotificationTitle(type),
      message: getNotificationMessage(type, data),
      data: data
    });
  } catch (error) {
    console.error('Create notification error:', error);
  }
}

function getNotificationTitle(type) {
  switch (type) {
    case 'new_message':
      return 'New Message';
    default:
      return 'Notification';
  }
}

function getNotificationMessage(type, data) {
  switch (type) {
    case 'new_message':
      return `${data.content}...`;
    default:
      return 'You have a new notification';
  }
}

// REST API endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    connections: connections.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/online-users', authenticateToken, (req, res) => {
  const onlineUsers = Array.from(connections.keys());
  res.json({
    online_users: onlineUsers,
    count: onlineUsers.length
  });
});

app.get('/user-status/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const isOnline = connections.has(userId);
  
  res.json({
    userId: userId,
    online: isOnline,
    last_seen: isOnline ? new Date().toISOString() : null
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('API error:', error);
  res.status(500).json({
    error: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`Active connections: ${connections.size}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, wss, connections };
