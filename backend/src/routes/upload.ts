import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import crypto from 'crypto';
import path from 'path';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file before compression
  },
  fileFilter: (req, file, cb) => {
    // Allow common web + phone image formats
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, HEIC/HEIF) are allowed'));
    }
  }
});

// Helper: Convert HEIC/HEIF to JPEG buffer
const convertHeicToJpeg = async (buffer: Buffer, mimeType: string) => {
  if (mimeType === 'image/heic' || mimeType === 'image/heif') {
    // Convert Node Buffer to ArrayBuffer
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    const converted = await heicConvert({
      buffer: arrayBuffer, // HEIC file as ArrayBuffer
      format: 'JPEG',
      quality: 0.8
    });

    // heicConvert returns a Buffer, which is fine to pass to sharp
    return Buffer.from(converted);
  }
  return buffer; // already a supported format
};


// Upload multiple images for ads
router.post('/images', authenticateToken, upload.array('images', 5), async (req: any, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = files.map(async (file) => {
      // Convert HEIC/HEIF to JPEG if needed
      const bufferToProcess = await convertHeicToJpeg(file.buffer, file.mimetype);

      // Compress & resize image using Sharp
      const processedBuffer = await sharp(bufferToProcess)
        .resize({ width: 1920, withoutEnlargement: true }) // max width 1920px
        .jpeg({ quality: 80 }) // compress to ~80% quality
        .toBuffer();

      // Generate unique filename with .jpg extension
      const fileName = `${crypto.randomUUID()}.jpg`;
      const filePath = `ad-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('ad-images')
        .upload(filePath, processedBuffer, {
          contentType: 'image/jpeg',
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
        originalSizeKB: (file.size / 1024).toFixed(1),
        compressedSizeKB: (processedBuffer.length / 1024).toFixed(1)
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.json({
      message: 'Files uploaded and compressed successfully',
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
