// Feed Ranking Service - ML-based content ranking
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { db } = require('../supabase-client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

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

// User preference tracking
const userPreferences = new Map(); // userId -> preferences
const contentScores = new Map(); // postId -> score

// Feed ranking endpoint
app.post('/rank-feed', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { posts, algorithm = 'hybrid' } = req.body;

    if (!posts || !Array.isArray(posts)) {
      return res.status(400).json({ error: 'Posts array required' });
    }

    // Get user preferences
    const preferences = await getUserPreferences(userId);
    
    // Rank posts based on algorithm
    let rankedPosts;
    switch (algorithm) {
      case 'engagement':
        rankedPosts = await rankByEngagement(posts, userId);
        break;
      case 'relevance':
        rankedPosts = await rankByRelevance(posts, preferences);
        break;
      case 'recency':
        rankedPosts = await rankByRecency(posts);
        break;
      case 'hybrid':
      default:
        rankedPosts = await rankByHybrid(posts, preferences, userId);
        break;
    }

    // Update user preferences based on feed interaction
    await updateUserPreferences(userId, rankedPosts);

    res.json({
      success: true,
      data: {
        posts: rankedPosts,
        algorithm: algorithm,
        user_preferences: preferences
      }
    });

  } catch (error) {
    console.error('Feed ranking error:', error);
    res.status(500).json({
      error: 'Failed to rank feed',
      message: error.message
    });
  }
});

// Get personalized feed
app.get('/feed/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, algorithm = 'hybrid' } = req.query;

    // Get user's accessible posts
    const posts = await getUserFeed(userId, parseInt(page), parseInt(limit));
    
    // Rank the posts
    const rankedPosts = await rankPosts(posts, userId, algorithm);

    res.json({
      success: true,
      data: {
        posts: rankedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: posts.length
        },
        algorithm: algorithm
      }
    });

  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      error: 'Failed to get feed',
      message: error.message
    });
  }
});

// Track user interaction
app.post('/track-interaction', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId, interactionType, duration } = req.body;

    if (!postId || !interactionType) {
      return res.status(400).json({ error: 'Post ID and interaction type required' });
    }

    // Record interaction
    await recordInteraction(userId, postId, interactionType, duration);

    // Update user preferences
    await updatePreferencesFromInteraction(userId, postId, interactionType);

    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });

  } catch (error) {
    console.error('Track interaction error:', error);
    res.status(500).json({
      error: 'Failed to track interaction',
      message: error.message
    });
  }
});

// Get content recommendations
app.get('/recommendations/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, type = 'posts' } = req.query;

    const preferences = await getUserPreferences(userId);
    const recommendations = await getRecommendations(userId, preferences, parseInt(limit), type);

    res.json({
      success: true,
      data: {
        recommendations: recommendations,
        type: type,
        user_preferences: preferences
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
});

// Ranking algorithms
async function rankByEngagement(posts, userId) {
  return posts.sort((a, b) => {
    const scoreA = calculateEngagementScore(a);
    const scoreB = calculateEngagementScore(b);
    return scoreB - scoreA;
  });
}

async function rankByRelevance(posts, preferences) {
  return posts.sort((a, b) => {
    const scoreA = calculateRelevanceScore(a, preferences);
    const scoreB = calculateRelevanceScore(b, preferences);
    return scoreB - scoreA;
  });
}

async function rankByRecency(posts) {
  return posts.sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

async function rankByHybrid(posts, preferences, userId) {
  return posts.map(post => {
    const engagementScore = calculateEngagementScore(post);
    const relevanceScore = calculateRelevanceScore(post, preferences);
    const recencyScore = calculateRecencyScore(post);
    
    // Weighted combination
    const finalScore = (
      engagementScore * 0.4 +
      relevanceScore * 0.4 +
      recencyScore * 0.2
    );
    
    return {
      ...post,
      ranking_score: finalScore
    };
  }).sort((a, b) => b.ranking_score - a.ranking_score);
}

// Scoring functions
function calculateEngagementScore(post) {
  const likes = post.like_count || 0;
  const comments = post.comment_count || 0;
  const shares = post.share_count || 0;
  
  // Engagement rate = (likes + comments * 2 + shares * 3) / time_since_post
  const timeSincePost = Math.max(1, (Date.now() - new Date(post.created_at)) / (1000 * 60 * 60)); // hours
  const engagementRate = (likes + comments * 2 + shares * 3) / timeSincePost;
  
  return Math.log(engagementRate + 1); // Log to prevent extreme values
}

function calculateRelevanceScore(post, preferences) {
  let score = 0;
  
  // Content type preference
  if (preferences.content_types && preferences.content_types[post.content_type]) {
    score += preferences.content_types[post.content_type] * 0.3;
  }
  
  // Author preference
  if (preferences.favorite_authors && preferences.favorite_authors.includes(post.user_id)) {
    score += 0.4;
  }
  
  // Topic preference
  if (preferences.topics && post.topics) {
    const matchingTopics = post.topics.filter(topic => 
      preferences.topics.includes(topic)
    );
    score += (matchingTopics.length / post.topics.length) * 0.3;
  }
  
  return score;
}

function calculateRecencyScore(post) {
  const hoursSincePost = (Date.now() - new Date(post.created_at)) / (1000 * 60 * 60);
  return Math.exp(-hoursSincePost / 24); // Exponential decay over 24 hours
}

// User preference management
async function getUserPreferences(userId) {
  // Check cache first
  if (userPreferences.has(userId)) {
    return userPreferences.get(userId);
  }

  // Get from database
  const { data: settings, error } = await db.user_settings.getById(userId);
  if (error) {
    console.error('Get user preferences error:', error);
    return getDefaultPreferences();
  }

  const preferences = {
    content_types: {
      text: 0.5,
      image: 0.8,
      video: 0.6,
      link: 0.3
    },
    favorite_authors: [],
    topics: [],
    engagement_threshold: 0.5,
    recency_weight: 0.2,
    relevance_weight: 0.4,
    engagement_weight: 0.4
  };

  // Update with user settings if available
  if (settings) {
    // Parse user preferences from settings
    // This would be customized based on your user settings schema
  }

  // Cache preferences
  userPreferences.set(userId, preferences);
  return preferences;
}

function getDefaultPreferences() {
  return {
    content_types: {
      text: 0.5,
      image: 0.8,
      video: 0.6,
      link: 0.3
    },
    favorite_authors: [],
    topics: [],
    engagement_threshold: 0.5,
    recency_weight: 0.2,
    relevance_weight: 0.4,
    engagement_weight: 0.4
  };
}

async function updateUserPreferences(userId, posts) {
  const preferences = await getUserPreferences(userId);
  
  // Update based on feed interaction
  posts.forEach(post => {
    // Update content type preferences
    if (post.content_type && preferences.content_types[post.content_type]) {
      preferences.content_types[post.content_type] += 0.01;
    }
    
    // Update favorite authors
    if (post.user_id && !preferences.favorite_authors.includes(post.user_id)) {
      preferences.favorite_authors.push(post.user_id);
    }
  });

  // Normalize preferences
  normalizePreferences(preferences);
  
  // Update cache
  userPreferences.set(userId, preferences);
  
  // Save to database periodically
  // await savePreferencesToDatabase(userId, preferences);
}

function normalizePreferences(preferences) {
  // Normalize content type preferences
  const total = Object.values(preferences.content_types).reduce((sum, val) => sum + val, 0);
  Object.keys(preferences.content_types).forEach(key => {
    preferences.content_types[key] = preferences.content_types[key] / total;
  });
}

async function recordInteraction(userId, postId, interactionType, duration = 0) {
  // Record interaction in database
  const interaction = {
    user_id: userId,
    post_id: postId,
    interaction_type: interactionType,
    duration: duration,
    timestamp: new Date().toISOString()
  };

  // This would be saved to an interactions table
  console.log('Recording interaction:', interaction);
}

async function updatePreferencesFromInteraction(userId, postId, interactionType) {
  const preferences = await getUserPreferences(userId);
  
  // Update preferences based on interaction type
  switch (interactionType) {
    case 'like':
      // Increase preference for this type of content
      break;
    case 'comment':
      // Higher weight for commenting
      break;
    case 'share':
      // Highest weight for sharing
      break;
    case 'view':
      // Moderate weight for viewing
      break;
  }
  
  userPreferences.set(userId, preferences);
}

// Feed generation
async function getUserFeed(userId, page, limit) {
  try {
    // Get user's feed using Supabase function
    const { data: posts, error } = await db.posts.getFeed(userId, limit, (page - 1) * limit);
    
    if (error) {
      throw error;
    }
    
    return posts || [];
  } catch (error) {
    console.error('Get user feed error:', error);
    return [];
  }
}

async function rankPosts(posts, userId, algorithm) {
  const preferences = await getUserPreferences(userId);
  
  switch (algorithm) {
    case 'engagement':
      return await rankByEngagement(posts, userId);
    case 'relevance':
      return await rankByRelevance(posts, preferences);
    case 'recency':
      return await rankByRecency(posts);
    case 'hybrid':
    default:
      return await rankByHybrid(posts, preferences, userId);
  }
}

// Recommendations
async function getRecommendations(userId, preferences, limit, type) {
  // This would implement a recommendation algorithm
  // For now, return recent posts from favorite authors
  const recommendations = [];
  
  if (preferences.favorite_authors.length > 0) {
    // Get recent posts from favorite authors
    // This would be implemented based on your database schema
  }
  
  return recommendations.slice(0, limit);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'feed-ranking',
    timestamp: new Date().toISOString(),
    cached_users: userPreferences.size,
    cached_scores: contentScores.size
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Feed ranking error:', error);
  res.status(500).json({
    error: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Feed ranking service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

module.exports = { app };
