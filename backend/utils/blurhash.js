/**
 * BlurHash Utility for generating and managing blurhash strings
 */
const { encode } = require('blurhash');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Generate a BlurHash from an image file or URL
 * @param {string} imagePath - Path or URL to the image
 * @param {number} componentX - Number of components on X-axis (default: 4)
 * @param {number} componentY - Number of components on Y-axis (default: 3)
 * @returns {Promise<string>} - BlurHash string
 */
async function generateBlurHash(imagePath, componentX = 4, componentY = 3) {
  try {
    // Handle both local files and URLs
    let imageBuffer;
    
    if (imagePath.startsWith('http')) {
      // For remote URLs
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      imageBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      // For local files, handle relative paths
      const fullPath = imagePath.startsWith('/') 
        ? imagePath 
        : path.join(process.cwd(), imagePath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Image file not found: ${fullPath}`);
      }
      
      imageBuffer = await fs.promises.readFile(fullPath);
    }

    // Resize image to make processing faster
    const { data, info } = await sharp(imageBuffer)
      .resize(32, 32, { fit: 'inside' })
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    // Generate blurhash
    const blurhash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      componentX,
      componentY
    );

    return blurhash;
  } catch (error) {
    console.error('Error generating BlurHash:', error);
    // Return a default blurhash for error cases (gray placeholder)
    return 'LMN0x]00%M%M_4%M~qof00M{M{of';
  }
}

/**
 * Updates a database record with a blurhash for its associated image
 * @param {Object} db - Database connection
 * @param {string} table - Table name
 * @param {string} idField - ID field name
 * @param {string} idValue - ID value
 * @param {string} imageField - Image URL field name
 * @param {string} blurhashField - BlurHash field name
 * @returns {Promise<boolean>} - Success status
 */
async function updateRecordWithBlurHash(db, table, idField, idValue, imageField, blurhashField) {
  try {
    // Get the image URL
    const [rows] = await db.query(
      `SELECT ${imageField} FROM ${table} WHERE ${idField} = ?`,
      [idValue]
    );
    
    if (!rows || rows.length === 0 || !rows[0][imageField]) {
      console.error(`No image found for ${table} with ${idField}=${idValue}`);
      return false;
    }
    
    const imageUrl = rows[0][imageField];
    
    // Generate the blurhash
    const blurhash = await generateBlurHash(imageUrl);
    
    // Update the record
    await db.query(
      `UPDATE ${table} SET ${blurhashField} = ? WHERE ${idField} = ?`,
      [blurhash, idValue]
    );
    
    return true;
  } catch (error) {
    console.error('Error updating record with BlurHash:', error);
    return false;
  }
}

module.exports = {
  generateBlurHash,
  updateRecordWithBlurHash
};
