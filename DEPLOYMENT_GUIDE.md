# VibeCircles Deployment Guide

## Complete Step-by-Step Deployment Process

This guide provides a comprehensive walkthrough for deploying your VibeCircles social networking platform to GitHub and Supabase.

---

## Phase 1: GitHub Setup and Upload

### Step 1: Prepare Your Project
1. **Organize your files** - Ensure all project files are in the correct structure
2. **Create .gitignore** - Add the following to `.gitignore`:
   ```
   # Environment files
   .env
   .env.*
   !.env.example
   
   # Database files
   *.db
   *.sqlite
   backup_*.sql
   
   # Logs
   logs/*
   !logs/.gitkeep
   
   # Cache
   cache/*
   !cache/.gitkeep
   
   # Uploads
   assets/images/uploads/*
   !assets/images/uploads/.gitkeep
   
   # IDE files
   .vscode/
   .idea/
   *.swp
   *.swo
   
   # OS files
   .DS_Store
   Thumbs.db
   
   # Temporary files
   *.tmp
   *.temp
   ```

### Step 2: Create GitHub Account
1. Go to [GitHub.com](https://github.com)
2. Click "Sign up" and create a new account
3. Verify your email address
4. Enable two-factor authentication (recommended)

### Step 3: Install Git
1. Download Git from [git-scm.com](https://git-scm.com)
2. Install with default settings
3. Open terminal/command prompt and verify:
   ```bash
   git --version
   ```

### Step 4: Configure Git
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 5: Create GitHub Repository
1. Log in to GitHub
2. Click the "+" icon → "New repository"
3. Fill in details:
   - **Repository name**: `vibecircles`
   - **Description**: `VibeCircles Social Networking Platform`
   - **Visibility**: Public or Private
   - **Initialize with**: Check "Add a README file"
4. Click "Create repository"

### Step 6: Clone and Upload
```bash
# Clone the repository
git clone https://github.com/yourusername/vibecircles.git
cd vibecircles

# Copy your project files into the directory
# (All HTML, CSS, JS, PHP, and database files)

# Add all files to Git
git add .

# Make initial commit
git commit -m "Initial commit: VibeCircles social networking platform"

# Push to GitHub
git push origin main
```

### Step 7: Verify Upload
1. Go to your GitHub repository page
2. Verify all files are present
3. Check the file structure is correct

---

## Phase 2: Supabase Setup

### Step 8: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub, Google, or email
4. Verify your email address

### Step 9: Create Supabase Project
1. Click "New Project"
2. Fill in details:
   - **Name**: `vibecircles`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier
3. Click "Create new project"
4. Wait for project creation (2-3 minutes)

### Step 10: Get Project Credentials
1. Go to Settings → API
2. Copy and save:
   - **Project URL**
   - **Anon Public Key**
   - **Service Role Key** (keep secret!)

### Step 11: Create Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Create new query
3. Copy and paste the PostgreSQL schema from `database/schema/vibecircles_schema.sql`
4. Execute the query

### Step 12: Insert Sample Data
1. Create another query in SQL Editor
2. Copy and paste sample data from `database/schema/sample_data.sql`
3. Execute the query

### Step 13: Set Up Row Level Security (RLS)
```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Enable RLS on other tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
```

---

## Phase 3: Environment Configuration

### Step 14: Create Environment Files
Create the following files in your project root:

#### .env.development
```env
# Database Configuration
DB_HOST=localhost
DB_NAME=vibecircles_dev
DB_USER=root
DB_PASS=password
DB_CHARSET=utf8mb4

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Application Settings
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_NAME=VibeCircles
APP_VERSION=1.0.0

# Security
APP_KEY=your-secret-key-here
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret

# Email Configuration
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@vibecircles.com
MAIL_FROM_NAME=VibeCircles

# File Upload
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,mp4,mov
UPLOAD_PATH=assets/images/uploads

# Cache Configuration
CACHE_DRIVER=file
CACHE_TTL=3600

# Logging
LOG_LEVEL=debug
LOG_PATH=logs/
```

#### .env.production
```env
# Database Configuration
DB_HOST=your-production-db-host
DB_NAME=vibecircles_prod
DB_USER=prod_user
DB_PASS=your-strong-production-password
DB_CHARSET=utf8mb4

# Supabase Configuration
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_KEY=your-production-service-key

# Application Settings
APP_ENV=production
APP_DEBUG=false
APP_URL=https://vibecircles.com
APP_NAME=VibeCircles
APP_VERSION=1.0.0

# Security
APP_KEY=your-production-secret-key
SESSION_SECRET=your-production-session-secret
JWT_SECRET=your-production-jwt-secret

# Email Configuration
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-production-sendgrid-key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@vibecircles.com
MAIL_FROM_NAME=VibeCircles

# File Upload
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,mp4,mov
UPLOAD_PATH=assets/images/uploads

# Cache Configuration
CACHE_DRIVER=redis
CACHE_TTL=3600

# Logging
LOG_LEVEL=error
LOG_PATH=logs/

# CDN Configuration
CDN_URL=https://cdn.vibecircles.com
CDN_ENABLED=true
```

### Step 15: Update Configuration Files
Create `config/Config.php`:
```php
<?php
class Config {
    private static $config = [];
    
    public static function load($environment = 'development') {
        $envFile = ".env.{$environment}";
        
        if (!file_exists($envFile)) {
            throw new Exception("Environment file {$envFile} not found");
        }
        
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            if (strpos($line, '#') === 0) continue;
            
            $parts = explode('=', $line, 2);
            if (count($parts) === 2) {
                $key = trim($parts[0]);
                $value = trim($parts[1]);
                
                if (preg_match('/^"(.*)"$/', $value, $matches)) {
                    $value = $matches[1];
                }
                
                self::$config[$key] = $value;
            }
        }
    }
    
    public static function get($key, $default = null) {
        return self::$config[$key] ?? $default;
    }
    
    public static function isProduction() {
        return self::get('APP_ENV') === 'production';
    }
    
    public static function isDevelopment() {
        return self::get('APP_ENV') === 'development';
    }
}
?>
```

### Step 16: Update Database Connection
Update `php/config/db.php`:
```php
<?php
require_once 'Config.php';

$environment = $_ENV['APP_ENV'] ?? 'development';
Config::load($environment);

$host = Config::get('DB_HOST');
$db   = Config::get('DB_NAME');
$user = Config::get('DB_USER');
$pass = Config::get('DB_PASS');
$charset = Config::get('DB_CHARSET', 'utf8mb4');

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     error_log("Database connection failed: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(['error' => 'Database connection failed']);
     exit;
}
?>
```

---

## Phase 4: Update API for Supabase

### Step 17: Create Supabase Configuration
Create `config/supabase.php`:
```php
<?php
define('SUPABASE_URL', Config::get('SUPABASE_URL'));
define('SUPABASE_ANON_KEY', Config::get('SUPABASE_ANON_KEY'));
define('SUPABASE_SERVICE_KEY', Config::get('SUPABASE_SERVICE_KEY'));

function getSupabaseConnection() {
    $url = SUPABASE_URL . '/rest/v1/';
    $headers = [
        'apikey: ' . SUPABASE_ANON_KEY,
        'Authorization: Bearer ' . SUPABASE_ANON_KEY,
        'Content-Type: application/json'
    ];
    
    return [
        'url' => $url,
        'headers' => $headers
    ];
}
?>
```

### Step 18: Update API Endpoints
Example: Update `php/api/get_users.php`:
```php
<?php
require_once '../config/supabase.php';

function getUsers() {
    $config = getSupabaseConnection();
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $config['url'] . 'users?select=*');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $config['headers']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

header('Content-Type: application/json');
echo json_encode(getUsers());
?>
```

---

## Phase 5: Testing and Verification

### Step 19: Test Local Setup
1. Start your local web server
2. Navigate to your project
3. Test basic functionality
4. Check database connections

### Step 20: Test Supabase Connection
Create `test_connection.php`:
```php
<?php
require_once 'config/supabase.php';

$config = getSupabaseConnection();
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $config['url'] . 'users?select=count');
curl_setopt($ch, CURLOPT_HTTPHEADER, $config['headers']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo "Connection successful!";
} else {
    echo "Connection failed. HTTP Code: " . $httpCode;
}
?>
```

### Step 21: Test API Endpoints
1. Test authentication endpoints
2. Test user management
3. Test post creation and retrieval
4. Test group functionality
5. Test friend requests

---

## Phase 6: Production Deployment

### Step 22: Choose Hosting Platform
Options:
- **Vercel**: For static sites with serverless functions
- **Netlify**: For static sites with form handling
- **Heroku**: For full-stack applications
- **DigitalOcean**: For VPS hosting
- **AWS**: For scalable cloud hosting

### Step 23: Deploy to Production
Example with Vercel:
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

### Step 24: Configure Domain
1. Purchase domain (e.g., vibecircles.com)
2. Configure DNS settings
3. Set up SSL certificate
4. Update environment variables

### Step 25: Set Up Monitoring
1. Configure error tracking (Sentry)
2. Set up performance monitoring
3. Configure uptime monitoring
4. Set up log aggregation

---

## Phase 7: Post-Deployment

### Step 26: Security Hardening
1. Enable HTTPS everywhere
2. Set secure headers
3. Configure CSP (Content Security Policy)
4. Enable rate limiting
5. Set up firewall rules

### Step 27: Performance Optimization
1. Enable CDN for static assets
2. Configure caching headers
3. Optimize images
4. Minify CSS/JS
5. Enable compression

### Step 28: Backup Strategy
1. Set up automated database backups
2. Configure file backups
3. Test restore procedures
4. Document recovery processes

### Step 29: Monitoring and Maintenance
1. Set up automated monitoring
2. Configure alerting
3. Schedule regular maintenance
4. Monitor performance metrics

---

## Troubleshooting

### Common Issues and Solutions

#### GitHub Issues
- **Authentication Error**: Use personal access token
- **Large File Error**: Use Git LFS
- **Permission Denied**: Check repository permissions

#### Supabase Issues
- **CORS Error**: Configure CORS in Supabase settings
- **Authentication Error**: Check API keys
- **Schema Error**: Verify PostgreSQL syntax

#### Environment Issues
- **Configuration Not Loading**: Check file paths and permissions
- **Database Connection Failed**: Verify credentials and network
- **API Endpoints Not Working**: Check CORS and authentication

### Useful Commands
```bash
# Git commands
git status
git log --oneline
git pull origin main
git push origin main

# Database commands
mysql -u username -p database_name < schema.sql
mysqldump -u username -p database_name > backup.sql

# Environment setup
cp .env.development .env
chmod 644 .env
```

---

## Security Checklist

- [ ] Environment variables are not committed to Git
- [ ] Strong passwords are used for all services
- [ ] HTTPS is enabled in production
- [ ] API keys are kept secure
- [ ] Regular security updates are applied
- [ ] Backup procedures are tested
- [ ] Monitoring and alerting are configured
- [ ] Access controls are properly configured

---

## Performance Checklist

- [ ] CDN is configured for static assets
- [ ] Database queries are optimized
- [ ] Caching is implemented
- [ ] Images are optimized
- [ ] CSS/JS are minified
- [ ] Compression is enabled
- [ ] Database indexes are created
- [ ] Monitoring is in place

---

## Next Steps

After successful deployment:
1. Set up CI/CD pipelines
2. Configure automated testing
3. Implement feature flags
4. Set up A/B testing
5. Plan for scaling
6. Document procedures
7. Train team members
8. Plan maintenance schedule

---

## Support and Resources

- **GitHub Documentation**: https://docs.github.com
- **Supabase Documentation**: https://supabase.com/docs
- **PHP Documentation**: https://www.php.net/docs.php
- **MySQL Documentation**: https://dev.mysql.com/doc/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

---

## Contact and Support

For additional support:
- Create issues in your GitHub repository
- Check the documentation in the `database/docs/` folder
- Review the troubleshooting section above
- Consider hiring a developer for complex issues

---

*This guide covers the complete deployment process for VibeCircles. Follow each step carefully and test thoroughly before moving to production.*
