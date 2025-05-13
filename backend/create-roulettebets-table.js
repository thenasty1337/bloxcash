const { sql } = require('./database');

async function createRouletteTable() {
  try {
    await sql.query(`
      DROP TABLE IF EXISTS rouletteBets;
      CREATE TABLE rouletteBets (
        id bigint unsigned NOT NULL AUTO_INCREMENT,
        userId CHAR(26) NOT NULL,
        roundId bigint unsigned NOT NULL,
        color int NOT NULL,
        amount decimal(20,8) NOT NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY roundId_idx (roundId),
        KEY userId_idx (userId),
        CONSTRAINT fk_rouletteBets_roundId FOREIGN KEY (roundId) REFERENCES roulette (id) ON DELETE CASCADE,
        CONSTRAINT fk_rouletteBets_userId FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    
    console.log('Table rouletteBets created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating rouletteBets table:', err);
    process.exit(1);
  }
}

createRouletteTable(); 