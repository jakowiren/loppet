import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import crypto from 'crypto';
import path from 'path';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  }
});

// Upload multiple images for ads
router.post('/images', authenticateToken, upload.array('images', 5), async (req: any, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = files.map(async (file) => {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${crypto.randomUUID()}${fileExtension}`;
      const filePath = `ad-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('ad-images')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Upload failed for ${file.originalname}: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath);

      return {
        originalName: file.originalname,
        fileName,
        url: publicUrl,
        size: file.size
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.json({
      message: 'Files uploaded successfully',
      images: uploadResults
    });

  } catch (error: any) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload images',
      details: error.message 
    });
  }
});

// Delete image (for cleanup/editing)
router.delete('/images/:fileName', authenticateToken, async (req: any, res) => {
  try {
    const { fileName } = req.params;
    const filePath = `ad-images/${fileName}`;

    const { error } = await supabase.storage
      .from('ad-images')
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ error: 'Failed to delete image' });
    }

    res.json({ message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;