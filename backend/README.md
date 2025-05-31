# NOVACASINO Backend

This directory contains the Express.js backend application for NOVACASINO.

## Structure
- `app.js` - Main application entry point
- `routes/` - API routes
- `database/` - Database connection and queries
- `socketio/` - WebSocket server implementation
- `views/` - EJS template views
- `utils/` - Utility functions
- `fairness/` - Provably fair algorithms
- `discord/` - Discord integration

## Database
MySQL database is used. Schema is defined in `full_schema.sql`.

## Development
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Start production server
npm start
```

## Environment Variables
Create a `.env` file with the following variables:
```
PORT=3000
SQL_USER=your_db_user
SQL_DB=your_database
SQL_PASS=your_password
SQL_PORT=3306
SESSION_SECRET=your_session_secret
``` 