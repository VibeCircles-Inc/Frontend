# VibeCircles Social Network

A modern social networking platform built with HTML, CSS, JavaScript, and PHP.

## Features

- User authentication and registration
- Social networking features (posts, comments, likes)
- Group management and membership
- File upload and media management
- Responsive design with multiple themes
- Real-time chat functionality
- Profile customization

## Project Structure

```
vibecircles/
├── assets/                 # Static assets (CSS, JS, images, fonts)
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── images/            # Images and media
│   ├── fonts/             # Font files
│   ├── scss/              # SCSS source files
│   └── svg/               # SVG icons and graphics
├── components/            # Reusable HTML components
├── html/                  # HTML pages
│   ├── group/             # Group-related pages
│   ├── pages/             # General pages (login, register, etc.)
│   └── profile/           # User profile pages
├── php/                   # PHP backend files
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication files
│   └── config/            # Configuration files
├── database/              # Database-related files
├── index.html             # Main landing page
├── config.php             # Application configuration
├── .htaccess              # Apache configuration
└── vibecircles_schema.sql # Database schema
```

## Setup Instructions

### Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- Composer (optional, for dependency management)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd vibecircles
   ```

2. **Set up the database**
   - Create a new MySQL database
   - Import the schema: `mysql -u username -p database_name < vibecircles_schema.sql`

3. **Configure the application**
   - Copy `config.php` to `config.local.php` (if you want local overrides)
   - Update database credentials in `config.php` or set environment variables:
     ```bash
     export DB_HOST=localhost
     export DB_NAME=vibecircles
     export DB_USER=your_username
     export DB_PASS=your_password
     ```

4. **Set up the web server**
   - Point your web server to the project directory
   - Ensure PHP has write permissions to the `assets/images/` directory
   - Make sure mod_rewrite is enabled (for .htaccess)

5. **Test the installation**
   - Visit your domain in a web browser
   - Try registering a new user
   - Test the file upload functionality

## Configuration

### Environment Variables

The application uses environment variables for configuration:

- `DB_HOST`: Database host (default: localhost)
- `DB_NAME`: Database name (default: vibecircles)
- `DB_USER`: Database username (default: root)
- `DB_PASS`: Database password (default: empty)
- `APP_URL`: Application URL (default: http://localhost)
- `APP_ENV`: Environment (development/production)

### File Upload Settings

- Maximum file size: 10MB
- Allowed image types: JPG, PNG, GIF, WebP
- Upload directory: `assets/images/`

## Security Features

- CSRF protection
- SQL injection prevention (prepared statements)
- XSS protection
- File upload validation
- Secure session handling
- Content Security Policy headers

## API Endpoints

### Authentication
- `POST /php/auth/login.php` - User login
- `POST /php/auth/logout.php` - User logout
- `POST /php/auth/register.php` - User registration

### Posts
- `GET /php/api/get_posts.php` - Get posts
- `POST /php/api/add_post.php` - Create new post
- `POST /php/api/add_comment.php` - Add comment

### Users
- `GET /php/api/get_users.php` - Get users
- `GET /php/api/get_user.php` - Get specific user
- `POST /php/api/add_friend.php` - Send friend request

### Groups
- `GET /php/api/get_groups.php` - Get groups
- `POST /php/api/join_group.php` - Join group

### Media
- `POST /php/api/upload_media.php` - Upload images

## Development

### Code Style

- Use consistent indentation (4 spaces)
- Follow PSR-12 coding standards for PHP
- Use meaningful variable and function names
- Add comments for complex logic

### Adding New Features

1. Create the database tables if needed
2. Add PHP API endpoints in `/php/api/`
3. Create HTML pages in `/html/`
4. Add JavaScript functionality in `/assets/js/`
5. Style with CSS/SCSS in `/assets/css/`

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check database credentials in `config.php`
   - Ensure MySQL service is running
   - Verify database exists

2. **File uploads not working**
   - Check write permissions on `assets/images/`
   - Verify PHP file upload settings
   - Check file size limits

3. **Assets not loading**
   - Verify .htaccess is working
   - Check file paths are correct
   - Ensure web server can access assets directory

### Error Logs

- PHP errors: Check your web server's error log
- Database errors: Check MySQL error log
- Application errors: Check browser console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on the project repository.
