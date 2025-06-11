#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * This script generates multiple sizes and formats of images for optimal web performance.
 * It creates WebP versions and different sizes (150w, 300w, 600w) for responsive loading.
 * 
 * Usage: node scripts/optimize-images.js
 * 
 * Requirements:
 * - npm install sharp
 * - Original images should be in high resolution (at least 600px wide)
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const INPUT_DIR = './frontend/public/assets/games';
const OUTPUT_DIR = './frontend/public/assets/games';
const SIZES = [150, 300, 600]; // Different widths for responsive images
const QUALITY = {
  webp: 85,
  jpeg: 90,
  png: 90
};

async function optimizeImage(inputPath, outputDir, filename) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Processing: ${filename}`);
    console.log(`  Original: ${metadata.width}x${metadata.height}, ${Math.round(metadata.size / 1024)}KB`);
    
    const baseName = path.parse(filename).name;
    const extension = path.parse(filename).ext.toLowerCase();
    
    for (const width of SIZES) {
      if (width > metadata.width) {
        console.log(`  Skipping ${width}w (larger than original)`);
        continue;
      }
      
      // Generate WebP version
      const webpOutput = path.join(outputDir, `${baseName}-${width}w.webp`);
      await image
        .resize(width, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: QUALITY.webp })
        .toFile(webpOutput);
      
      // Generate original format version
      const originalOutput = path.join(outputDir, `${baseName}-${width}w${extension}`);
      
      if (extension === '.png') {
        await image
          .resize(width, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .png({ quality: QUALITY.png })
          .toFile(originalOutput);
      } else {
        await image
          .resize(width, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({ quality: QUALITY.jpeg })
          .toFile(originalOutput);
      }
      
      // Get file sizes for logging
      const webpStats = await fs.stat(webpOutput);
      const originalStats = await fs.stat(originalOutput);
      
      console.log(`  ${width}w: WebP ${Math.round(webpStats.size / 1024)}KB, ${extension.slice(1).toUpperCase()} ${Math.round(originalStats.size / 1024)}KB`);
    }
    
    console.log(`  ✅ Completed: ${filename}\n`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
}

async function main() {
  try {
    console.log('🖼️  Starting image optimization...\n');
    
    // Check if sharp is installed
    try {
      require('sharp');
    } catch (error) {
      console.error('❌ Sharp is not installed. Please run: npm install sharp');
      process.exit(1);
    }
    
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    // Get list of image files
    const files = await fs.readdir(INPUT_DIR);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file) && 
      !/-\d+w\.(jpg|jpeg|png|webp)$/i.test(file) // Skip already processed files
    );
    
    if (imageFiles.length === 0) {
      console.log('No images found to process.');
      return;
    }
    
    console.log(`Found ${imageFiles.length} images to process:\n`);
    
    // Process each image
    for (const filename of imageFiles) {
      const inputPath = path.join(INPUT_DIR, filename);
      await optimizeImage(inputPath, OUTPUT_DIR, filename);
    }
    
    console.log('🎉 Image optimization completed!');
    console.log('\n📊 Summary:');
    console.log(`- Processed ${imageFiles.length} original images`);
    console.log(`- Generated ${imageFiles.length * SIZES.length * 2} optimized variants`);
    console.log('- Created WebP versions for better compression');
    console.log('- Generated responsive sizes: 150w, 300w, 600w');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main(); 