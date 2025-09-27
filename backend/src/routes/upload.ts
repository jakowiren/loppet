import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import crypto from 'crypto';
import path from 'path';

const router = express.Router();

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP images are allowed'));
    }
  },
});

// Safe filename generator
const generateSafeFilename = (originalName: string) => {
  const ext = path.extname(originalName).toLowerCase(); // keep extension lowercased
  const uuid = crypto.randomUUID();
  return `${uuid}${ext}`; // e.g., 123e4567-e89b-12d3-a456-426614174000.jpeg
};

// Upload images
router.post('/images', authenticateToken, upload.array('images', 5), async (req: any, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const fileName = generateSafeFilename(file.originalname);
        const filePath = `ad-images/${fileName}`;

        console.log('Uploading file:', {
          originalName: file.originalname,
          safeFileName: fileName,
          filePath,
          size: file.size,
        });

        const { data, error } = await supabase.storage
          .from('ad-images')
          .upload(filePath, Buffer.from(file.buffer), {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          console.error('Supabase upload error:', error);
          throw new Error(`Upload failed for ${file.originalname}: ${error.message}`);
        }

        const { data: urlData } = supabase.storage.from('ad-images').getPublicUrl(filePath);
        return {
          originalName: file.originalname,
          fileName,
          url: urlData.publicUrl,
          size: file.size,
        };
      })
    );

    res.json({
      message: 'Files uploaded successfully',
      images: uploadResults,
    });
  } catch (err: any) {
    console.error('Image upload error:', err);
    res.status(500).json({
      error: 'Failed to upload images',
      details: err.message,
    });
  }
});

// Delete image
router.delete('/images/:fileName', authenticateToken, async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = `ad-images/${fileName}`;

    const { error } = await supabase.storage.from('ad-images').remove([filePath]);
    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ error: 'Failed to delete image' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;
