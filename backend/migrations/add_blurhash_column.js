/**
 * Migration script to add BlurHash column to the spinshield_games table
 * Run this script using: node migrations/add_blurhash_column.js
 */
const { sql } = require('../database');
const { generateBlurHash } = require('../utils/blurhash');

async function runMigration() {
  let connection;
  try {
    connection = await sql.getConnection();
    await connection.beginTransaction();

    console.log('Starting migration to add BlurHash support...');

    // Check if the column already exists
    const [columns] = await connection.query('SHOW COLUMNS FROM spinshield_games LIKE "image_blurhash"');
    
    if (columns.length === 0) {
      // Add the image_blurhash column if it doesn't exist
      console.log('Adding image_blurhash column to spinshield_games table...');
      await connection.query('ALTER TABLE spinshield_games ADD COLUMN image_blurhash VARCHAR(100) DEFAULT NULL');
      console.log('Column added successfully!');
    } else {
      console.log('image_blurhash column already exists, skipping column creation.');
    }

    // Get all active games that don't have a blurhash value
    console.log('Finding slot games without BlurHash values...');
    const [games] = await connection.query(
      'SELECT game_id_hash, image_url, image_square, image_long, provider FROM spinshield_games WHERE active = 1 AND (image_blurhash IS NULL OR image_blurhash = "")'
    );

    console.log(`Found ${games.length} games without BlurHash values.`);

    // Generate and store BlurHash values for each game
    if (games.length > 0) {
      console.log('Generating BlurHash values for games...');
      
      for (const [index, game] of games.entries()) {
        // Use the same image prioritization logic as in the frontend
        const imageUrl = ['readyplay', 'wizard', 'retrogaming', 'caleta'].includes(game.provider?.toLowerCase())
          ? (game.image_url || game.image_square || '/public/slots/default.png')
          : (game.image_long || game.image_url || game.image_square || '/public/slots/default.png');
        
        // Handle relative and absolute URLs
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${process.env.SERVER_URL || 'http://localhost:3000'}${imageUrl}`;
        
        try {
          console.log(`[${index+1}/${games.length}] Generating BlurHash for ${game.game_id_hash}...`);
          const blurhash = await generateBlurHash(fullImageUrl);
          
          await connection.query(
            'UPDATE spinshield_games SET image_blurhash = ? WHERE game_id_hash = ?',
            [blurhash, game.game_id_hash]
          );
          
          console.log(`  ✓ Updated BlurHash for ${game.game_id_hash}`);
        } catch (error) {
          console.error(`  ✗ Failed to generate BlurHash for ${game.game_id_hash}:`, error.message);
        }
      }
    }

    await connection.commit();
    console.log('Migration completed successfully!');
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Migration failed:', error);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

// Run the migration
runMigration();
