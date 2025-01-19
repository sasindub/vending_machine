const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables from .env

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
});

module.exports = db;
