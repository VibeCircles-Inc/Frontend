// Media Upload Routes for Cloudflare R2
const express = require('express');
const multer = require('multer');
const { mediaUploadService } = require('./upload-service');
const { db } = require('./supabase-client');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    files: 10 // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  }
});

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

    const user = await db.auth.getUser(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Upload avatar
router.post('/avatar', authenticateUser, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await mediaUploadService.uploadAvatar(req.file, req.user.id);
    
    // Update user profile in database
    await db.profiles.update(req.user.id, {
      avatar_url: result.urls.thumbnail
    });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: result
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload post media
router.post('/post', authenticateUser, upload.array('media', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const result = await mediaUploadService.uploadPostMedia(req.files, req.user.id);

    res.json({
      success: true,
      message: 'Media uploaded successfully',
      data: result
    });

  } catch (error) {
    console.error('Post media upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload album photos
router.post('/album/:albumId', authenticateUser, upload.array('photos', 20), async (req, res) => {
  try {
    const { albumId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos uploaded'
      });
    }

    const result = await mediaUploadService.batchUpload(req.files, req.user.id, 'album');

    // Save photo records to database
    const photoRecords = result.results
      .filter(r => r.success)
      .map(r => ({
        album_id: albumId,
        user_id: req.user.id,
        url: r.urls.original,
        thumbnail_url: r.urls.thumbnail,
        caption: req.body.caption || '',
        alt_text: req.body.alt_text || '',
        width: r.metadata.width,
        height: r.metadata.height,
        file_size: r.metadata.size
      }));

    // Insert photos into database
    const { data: photos, error } = await db.photos.insertMany(photoRecords);
    
    if (error) {
      throw new Error(`Failed to save photos to database: ${error.message}`);
    }

    res.json({
      success: true,
      message: 'Album photos uploaded successfully',
      data: {
        photos: photos,
        uploads: result.results
      }
    });

  } catch (error) {
    console.error('Album upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Generate upload URL for client-side uploads
router.post('/upload-url', authenticateUser, async (req, res) => {
  try {
    const { type, filename, contentType } = req.body;
    
    if (!type || !filename || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'Type, filename, and contentType are required'
      });
    }

    const result = await mediaUploadService.generateUploadUrl(type, req.user.id, filename, contentType);

    res.json({
      success: true,
      message: 'Upload URL generated successfully',
      data: result
    });

  } catch (error) {
    console.error('Upload URL generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete media
router.delete('/:key', authenticateUser, async (req, res) => {
  try {
    const { key } = req.params;
    
    // Verify user owns the media
    const mediaInfo = await mediaUploadService.getMediaInfo(key);
    if (mediaInfo.metadata.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own media'
      });
    }

    const result = await mediaUploadService.deleteMedia([key]);

    res.json({
      success: true,
      message: 'Media deleted successfully',
      data: result
    });

  } catch (error) {
    console.error('Media deletion error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get media info
router.get('/:key/info', authenticateUser, async (req, res) => {
  try {
    const { key } = req.params;
    
    const result = await mediaUploadService.getMediaInfo(key);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Media info error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Batch delete media
router.delete('/batch', authenticateUser, async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Keys array is required'
      });
    }

    // Verify user owns all media
    for (const key of keys) {
      const mediaInfo = await mediaUploadService.getMediaInfo(key);
      if (mediaInfo.metadata.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: `You can only delete your own media: ${key}`
        });
      }
    }

    const result = await mediaUploadService.deleteMedia(keys);

    res.json({
      success: true,
      message: 'Media deleted successfully',
      data: result
    });

  } catch (error) {
    console.error('Batch deletion error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's media
router.get('/user/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    
    // Build query
    let query = db.photos.select('*').eq('user_id', userId);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    query = query.order('created_at', { ascending: false })
                 .range((page - 1) * limit, page * limit - 1);

    const { data: photos, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch photos: ${error.message}`);
    }

    res.json({
      success: true,
      data: {
        photos: photos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: photos.length
        }
      }
    });

  } catch (error) {
    console.error('User media fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files'
      });
    }
  }
  
  console.error('Media route error:', error);
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

module.exports = router;
