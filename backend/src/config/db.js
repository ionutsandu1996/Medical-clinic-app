// Import Pool from pg library - it handles multiple connections to PostgresSQL
const { Pool } = require('pg');

// Load env variables from .env
require('dotenv').config();

// Create connexions pool with data from .env
const pool = new Pool({
    // Postgress server address
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,

    //database name
    database: process.env.DB_NAME,
    
    // credentials
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Test the conenction at the app startup

pool.connect((err, client, release) => {
    if (err) {
        //Show error if we cannot connect
        console.error('Error connecting to PostgresSQL', err.message);
        return;
    }

    // Confirm successful connction
    console.log('Connected to PostgresSQL database!');
    
    // Release the client back to the pool
    release();
})

module.exports = pool;