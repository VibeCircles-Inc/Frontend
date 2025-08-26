// Media Upload Service for Cloudflare R2
const { r2Service } = require('./r2-client');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

// Upload configuration
const uploadConfig = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE) || 5242880, // 5MB
  maxVideoSize: parseInt(process.env.MAX_VIDEO_SIZE) || 52428800, // 50MB
  allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  allowedVideoTypes: (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/webm,video/ogg').split(','),
  imageQuality: parseInt(process.env.IMAGE_QUALITY) || 85,
  thumbnailSize: parseInt(process.env.THUMBNAIL_SIZE) || 300,
  mediumSize: 800,
  largeSize: 1200
};

// Media Upload Service Class
class MediaUploadService {
  constructor() {
    this.r2Service = r2Service;
    this.config = uploadConfig;
  }

  // Validate file
  validateFile(file, allowedTypes, maxSize) {
    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.formatBytes(maxSize)}`);
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check if file exists
    if (!file.buffer || file.buffer.length === 0) {
      errors.push('File buffer is empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Upload image with processing
  async uploadImage(file, userId, type = 'post', options = {}) {
    try {
      // Validate image
      const validation = this.validateFile(file, this.config.allowedImageTypes, this.config.maxImageSize);
      if (!validation.isValid) {
        throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate file key
      const timestamp = Date.now();
      const originalKey = this.r2Service.generateKey(type, userId, file.originalname, timestamp);
      
      // Process image
      const processedImages = await this.processImage(file.buffer, originalKey, options);
      
      // Upload all versions
      const uploadResults = [];
      
      for (const [size, imageBuffer] of Object.entries(processedImages)) {
        const key = size === 'original' ? originalKey : this.r2Service.generateThumbnailKey(originalKey, size);
        const contentType = this.getContentType(file.originalname);
        
        const result = await this.r2Service.uploadFile(key, imageBuffer, contentType, {
          userId: userId.toString(),
          type: type,
          size: size,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        });
        
        uploadResults.push({
          size: size,
          ...result
        });
      }

      return {
        success: true,
        originalKey: originalKey,
        urls: {
          original: this.r2Service.getPublicUrl(originalKey),
          thumbnail: this.r2Service.getPublicUrl(this.r2Service.generateThumbnailKey(originalKey, 'thumbnail')),
          medium: this.r2Service.getPublicUrl(this.r2Service.generateThumbnailKey(originalKey, 'medium')),
          large: this.r2Service.getPublicUrl(this.r2Service.generateThumbnailKey(originalKey, 'large'))
        },
        metadata: {
          originalName: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          userId: userId,
          type: type,
          uploadedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  // Upload video with processing
  async uploadVideo(file, userId, type = 'post', options = {}) {
    try {
      // Validate video
      const validation = this.validateFile(file, this.config.allowedVideoTypes, this.config.maxVideoSize);
      if (!validation.isValid) {
        throw new Error(`Video validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate file key
      const timestamp = Date.now();
      const originalKey = this.r2Service.generateKey('video', userId, file.originalname, timestamp);
      
      // Process video
      const processedVideo = await this.processVideo(file.buffer, originalKey, options);
      
      // Upload video and thumbnail
      const uploadResults = [];
      
      // Upload original video
      const videoResult = await this.r2Service.uploadFile(originalKey, processedVideo.video, file.mimetype, {
        userId: userId.toString(),
        type: 'video',
        originalName: file.originalname,
        uploadedAt: new Date().toISOString()
      });
      
      uploadResults.push({
        type: 'video',
        ...videoResult
      });

      // Upload thumbnail if generated
      if (processedVideo.thumbnail) {
        const thumbnailKey = this.r2Service.generateThumbnailKey(originalKey, 'thumbnail');
        const thumbnailResult = await this.r2Service.uploadFile(thumbnailKey, processedVideo.thumbnail, 'image/jpeg', {
          userId: userId.toString(),
          type: 'video-thumbnail',
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        });
        
        uploadResults.push({
          type: 'thumbnail',
          ...thumbnailResult
        });
      }

      return {
        success: true,
        originalKey: originalKey,
        urls: {
          video: this.r2Service.getPublicUrl(originalKey),
          thumbnail: processedVideo.thumbnail ? this.r2Service.getPublicUrl(this.r2Service.generateThumbnailKey(originalKey, 'thumbnail')) : null
        },
        metadata: {
          originalName: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          duration: processedVideo.duration,
          userId: userId,
          type: type,
          uploadedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Video upload error:', error);
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  // Upload avatar
  async uploadAvatar(file, userId) {
    try {
      const options = {
        resize: {
          width: 400,
          height: 400,
          fit: 'cover'
        },
        quality: 90
      };

      return await this.uploadImage(file, userId, 'avatar', options);
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
  }

  // Upload post media
  async uploadPostMedia(files, userId) {
    try {
      const results = [];
      
      for (const file of files) {
        if (this.isImage(file)) {
          const result = await this.uploadImage(file, userId, 'post');
          results.push(result);
        } else if (this.isVideo(file)) {
          const result = await this.uploadVideo(file, userId, 'post');
          results.push(result);
        } else {
          throw new Error(`Unsupported file type: ${file.mimetype}`);
        }
      }

      return {
        success: true,
        files: results
      };

    } catch (error) {
      console.error('Post media upload error:', error);
      throw new Error(`Failed to upload post media: ${error.message}`);
    }
  }

  // Process image with Sharp
  async processImage(buffer, originalKey, options = {}) {
    try {
      const sharpInstance = sharp(buffer);
      const metadata = await sharpInstance.metadata();
      
      const results = {
        original: buffer
      };

      // Generate thumbnail
      const thumbnailBuffer = await sharpInstance
        .resize(this.config.thumbnailSize, this.config.thumbnailSize, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: this.config.imageQuality })
        .toBuffer();
      
      results.thumbnail = thumbnailBuffer;

      // Generate medium size
      const mediumBuffer = await sharp(buffer)
        .resize(this.config.mediumSize, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: this.config.imageQuality })
        .toBuffer();
      
      results.medium = mediumBuffer;

      // Generate large size
      const largeBuffer = await sharp(buffer)
        .resize(this.config.largeSize, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: this.config.imageQuality })
        .toBuffer();
      
      results.large = largeBuffer;

      return results;

    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  // Process video with FFmpeg
  async processVideo(buffer, originalKey, options = {}) {
    try {
      // For now, return original video
      // In production, you might want to:
      // - Compress video
      // - Generate different resolutions
      // - Extract thumbnail
      // - Convert to different formats
      
      return {
        video: buffer,
        thumbnail: null,
        duration: null
      };

    } catch (error) {
      console.error('Video processing error:', error);
      throw new Error(`Failed to process video: ${error.message}`);
    }
  }

  // Delete media files
  async deleteMedia(keys) {
    try {
      const results = await this.r2Service.deleteFiles(keys);
      
      return {
        success: true,
        results: results
      };

    } catch (error) {
      console.error('Media deletion error:', error);
      throw new Error(`Failed to delete media: ${error.message}`);
    }
  }

  // Generate upload URL for client-side uploads
  async generateUploadUrl(type, userId, filename, contentType) {
    try {
      const key = this.r2Service.generateKey(type, userId, filename);
      const result = await this.r2Service.generateUploadUrl(key, contentType);
      
      return {
        success: true,
        uploadUrl: result.uploadUrl,
        key: key,
        expiresIn: result.expiresIn
      };

    } catch (error) {
      console.error('Upload URL generation error:', error);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  // Utility methods
  isImage(file) {
    return this.config.allowedImageTypes.includes(file.mimetype);
  }

  isVideo(file) {
    return this.config.allowedVideoTypes.includes(file.mimetype);
  }

  getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get media info
  async getMediaInfo(key) {
    try {
      const metadata = await this.r2Service.getFileMetadata(key);
      
      return {
        success: true,
        key: key,
        url: this.r2Service.getPublicUrl(key),
        ...metadata
      };

    } catch (error) {
      console.error('Media info error:', error);
      throw new Error(`Failed to get media info: ${error.message}`);
    }
  }

  // Batch upload
  async batchUpload(files, userId, type = 'post') {
    try {
      const results = [];
      
      for (const file of files) {
        try {
          if (this.isImage(file)) {
            const result = await this.uploadImage(file, userId, type);
            results.push(result);
          } else if (this.isVideo(file)) {
            const result = await this.uploadVideo(file, userId, type);
            results.push(result);
          } else {
            results.push({
              success: false,
              error: `Unsupported file type: ${file.mimetype}`,
              originalName: file.originalname
            });
          }
        } catch (error) {
          results.push({
            success: false,
            error: error.message,
            originalName: file.originalname
          });
        }
      }

      return {
        success: true,
        results: results
      };

    } catch (error) {
      console.error('Batch upload error:', error);
      throw new Error(`Failed to batch upload: ${error.message}`);
    }
  }
}

// Create singleton instance
const mediaUploadService = new MediaUploadService();

module.exports = {
  mediaUploadService,
  uploadConfig
};
