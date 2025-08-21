# VibeCircles Frontend-Backend Integration Guide

This guide explains how to connect your VibeCircles frontend to the backend and database.

## Overview

The integration consists of:
- **Frontend**: HTML/CSS/JavaScript files with authentication and API communication
- **Backend**: Node.js/Express API server
- **Database**: Supabase PostgreSQL database
- **Authentication**: JWT-based authentication system

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase account** and project
3. **Web server** (Apache, Nginx, or local development server)
4. **Git** for version control

## Step 1: Backend Setup

### 1.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 1.2 Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your Supabase credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:8080,https://yourdomain.com
```

### 1.3 Start the Backend Server

```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

## Step 2: Database Setup

### 2.1 Set up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the schema from `database/schema/vibecircles_schema.sql`
4. Configure Row Level Security (RLS) policies

### 2.2 Test Database Connection

```bash
cd backend
node scripts/setup.js
```

## Step 3: Frontend Configuration

### 3.1 API Configuration

The frontend is configured in `assets/js/api-config.js`. Update the backend URL if needed:

```javascript
this.BACKEND_URL = 'http://localhost:3000/api'; // Change this to your backend URL
```

### 3.2 Serve Frontend Files

You can serve the frontend using any of these methods:

#### Option A: Using Python (Simple)
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

#### Option B: Using Node.js
```bash
npx http-server -p 8080
```

#### Option C: Using PHP
```bash
php -S localhost:8080
```

#### Option D: Using Live Server (VS Code Extension)
1. Install Live Server extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Step 4: Testing the Integration

### 4.1 Test Backend Health

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "VibeCircles API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### 4.2 Test Frontend-Backend Connection

1. Open your browser to `http://localhost:8080`
2. You should be redirected to the login page
3. Create a new account or log in
4. Check the browser console for any errors

### 4.3 Test API Endpoints

Using the browser console or tools like Postman:

```javascript
// Test user registration
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    full_name: 'Test User'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Step 5: Production Deployment

### 5.1 Backend Deployment

1. **Environment Variables**: Set production environment variables
2. **Process Manager**: Use PM2 or similar
3. **Reverse Proxy**: Configure Nginx or Apache
4. **SSL**: Enable HTTPS

Example PM2 configuration:
```bash
pm2 start server.js --name vibecircles-backend
pm2 startup
pm2 save
```

### 5.2 Frontend Deployment

1. **Static Hosting**: Deploy to Netlify, Vercel, or similar
2. **CDN**: Use CloudFlare or similar for better performance
3. **Update API URLs**: Change backend URLs to production URLs

### 5.3 Database Configuration

1. **Production Database**: Use Supabase production project
2. **Backup Strategy**: Configure automated backups
3. **Monitoring**: Set up database monitoring

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Browser blocks requests due to CORS policy
**Solution**: Update CORS_ORIGIN in backend `.env` file

#### 2. Authentication Failures
**Problem**: Login/registration not working
**Solution**: 
- Check JWT_SECRET is set correctly
- Verify Supabase credentials
- Check database connection

#### 3. Database Connection Issues
**Problem**: Backend can't connect to database
**Solution**:
- Verify Supabase URL and keys
- Check network connectivity
- Ensure database is running

#### 4. Frontend Not Loading Data
**Problem**: Posts/users not appearing
**Solution**:
- Check browser console for errors
- Verify API endpoints are working
- Check authentication token

### Debug Mode

Enable debug logging in the backend:

```javascript
// In backend/server.js
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('Debug mode enabled');
}
```

### API Testing

Use the provided test endpoints:

```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123","full_name":"Test User"}'

# Test posts
curl http://localhost:3000/api/posts

# Test users
curl http://localhost:3000/api/users
```

## File Structure

```
vibecircles/
├── frontend/
│   ├── index.html              # Main application page
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   └── assets/
│       ├── js/
│       │   ├── api-config.js   # API communication
│       │   └── auth.js         # Authentication logic
│       ├── css/                # Stylesheets
│       └── images/             # Images and assets
├── backend/
│   ├── server.js               # Express server
│   ├── routes/                 # API routes
│   ├── middleware/             # Authentication middleware
│   └── config/                 # Database configuration
└── database/
    └── schema/                 # Database schema
```

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Never commit secrets to version control
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **CORS**: Configure CORS properly for your domains
6. **JWT Security**: Use strong JWT secrets and proper expiration

## Performance Optimization

1. **Caching**: Implement Redis for session storage
2. **CDN**: Use CDN for static assets
3. **Database Indexing**: Add proper indexes to database
4. **Image Optimization**: Compress and optimize images
5. **Code Splitting**: Split JavaScript bundles

## Monitoring and Logging

1. **Error Tracking**: Implement error tracking (Sentry, etc.)
2. **Performance Monitoring**: Monitor API response times
3. **User Analytics**: Track user behavior
4. **Database Monitoring**: Monitor database performance

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation in `database/docs/api-documentation.md`
3. Check the backend logs for error messages
4. Verify all environment variables are set correctly

## Next Steps

After successful integration:
1. Add more features (real-time chat, notifications)
2. Implement file upload functionality
3. Add search and filtering capabilities
4. Implement mobile responsiveness
5. Add unit and integration tests
