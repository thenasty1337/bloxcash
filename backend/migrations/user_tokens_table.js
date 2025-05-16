/**
 * Creates the user_tokens table for secure refresh token storage
 */

const { sql } = require('../database');

async function createTokensTable() {
  try {
    console.log('Creating user_tokens table...');
    
    await sql.query(`
      CREATE TABLE IF NOT EXISTS user_tokens (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        tokenHash VARCHAR(255) NOT NULL,
        family VARCHAR(36) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expiresAt TIMESTAMP NOT NULL,
        isRevoked BOOLEAN DEFAULT false,
        INDEX user_idx (userId),
        INDEX expires_idx (expiresAt),
        INDEX family_idx (family),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('user_tokens table created successfully');
    
    // Create a scheduled event to clean up expired tokens
    await sql.query(`
      CREATE EVENT IF NOT EXISTS clean_expired_tokens
      ON SCHEDULE EVERY 1 DAY
      DO
        DELETE FROM user_tokens 
        WHERE expiresAt < NOW() OR isRevoked = true;
    `);
    
    console.log('Token cleanup event created');
    
  } catch (error) {
    console.error('Error creating user_tokens table:', error);
    throw error;
  }
}

// Run this file directly to create the table
if (require.main === module) {
  createTokensTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { createTokensTable };
