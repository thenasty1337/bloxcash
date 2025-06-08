const { sql } = require('./database');

async function createUserFavoritesTable() {
    try {
        console.log('Creating user_favorites table...');
        
        await sql.query(`
            CREATE TABLE IF NOT EXISTS user_favorites (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id CHAR(26) NOT NULL,
                game_id_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE INDEX unique_user_game (user_id, game_id_hash),
                INDEX idx_user_id (user_id),
                INDEX idx_game_id_hash (game_id_hash),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);
        
        console.log('✅ user_favorites table created successfully');
        console.log('✅ Indexes created for optimal performance:');
        console.log('   - Primary key on id');
        console.log('   - Unique index on (user_id, game_id_hash)');
        console.log('   - Index on user_id');
        console.log('   - Index on game_id_hash');
        console.log('   - Foreign key constraint on user_id');
        
    } catch (error) {
        console.error('❌ Error creating user_favorites table:', error);
        throw error;
    }
}

// Run the migration if this file is executed directly
if (require.main === module) {
    createUserFavoritesTable()
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { createUserFavoritesTable }; 