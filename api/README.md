# VibeCircles API Documentation

This document describes the API endpoints for the VibeCircles social networking platform using Supabase as the backend.

## Base URL
All API endpoints are relative to your domain: `http://your-domain.com/api/`

## Authentication
Currently using custom authentication. User ID must be provided in requests where required.

## API Endpoints

### Users

#### Get All Users
```
GET /api/get_users.php
```

**Parameters:**
- `limit` (optional): Number of users to return (default: 50)
- `offset` (optional): Number of users to skip (default: 0)

**Example:**
```
GET /api/get_users.php?limit=10&offset=0
```

#### Get User by ID
```
GET /api/get_users.php?id={user_id}
```

**Example:**
```
GET /api/get_users.php?id=1
```

### Posts

#### Get All Posts
```
GET /api/get_posts.php
```

**Parameters:**
- `limit` (optional): Number of posts to return (default: 20)
- `offset` (optional): Number of posts to skip (default: 0)
- `user_id` (optional): Filter posts by user ID

**Example:**
```
GET /api/get_posts.php?limit=10&user_id=1
```

#### Get Post by ID
```
GET /api/get_posts.php?id={post_id}
```

**Example:**
```
GET /api/get_posts.php?id=1
```

#### Create New Post
```
POST /api/get_posts.php
```

**Request Body:**
```json
{
    "user_id": 1,
    "content": "Hello world!",
    "privacy": "public",
    "media_url": "assets/images/post/1.jpg",
    "group_id": null
}
```

### Comments

#### Get Comments for a Post
```
GET /api/get_comments.php?post_id={post_id}
```

**Parameters:**
- `post_id` (required): ID of the post
- `limit` (optional): Number of comments to return (default: 50)
- `offset` (optional): Number of comments to skip (default: 0)

**Example:**
```
GET /api/get_comments.php?post_id=1&limit=10
```

#### Create New Comment
```
POST /api/get_comments.php
```

**Request Body:**
```json
{
    "post_id": 1,
    "user_id": 1,
    "content": "Great post!"
}
```

#### Delete Comment
```
DELETE /api/get_comments.php?id={comment_id}&user_id={user_id}
```

**Example:**
```
DELETE /api/get_comments.php?id=1&user_id=1
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
    "success": true,
    "data": [...],
    "count": 10
}
```

### Error Response
```json
{
    "success": false,
    "error": "Error message",
    "details": {...}
}
```

## Testing the API

### Using cURL

#### Get Users
```bash
curl -X GET "http://your-domain.com/api/get_users.php?limit=5"
```

#### Create Post
```bash
curl -X POST "http://your-domain.com/api/get_posts.php" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "content": "Test post",
    "privacy": "public"
  }'
```

#### Get Comments
```bash
curl -X GET "http://your-domain.com/api/get_comments.php?post_id=1"
```

### Using JavaScript/Fetch

```javascript
// Get users
fetch('/api/get_users.php?limit=10')
  .then(response => response.json())
  .then(data => console.log(data));

// Create post
fetch('/api/get_posts.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_id: 1,
    content: 'Hello from JavaScript!',
    privacy: 'public'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Error Codes

- `200`: Success
- `201`: Created
- `204`: No Content (for deletions)
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

## Notes

1. All endpoints require the Supabase configuration to be properly set up
2. User authentication is handled through custom sessions
3. RLS (Row Level Security) is enabled on all tables
4. All timestamps are in UTC format
5. File uploads for media should be handled separately

## Next Steps

1. Update your frontend to use these new API endpoints
2. Test all endpoints thoroughly
3. Add more endpoints as needed (groups, friendships, etc.)
4. Implement proper authentication middleware
5. Add rate limiting and security measures
