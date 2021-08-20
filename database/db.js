const { Pool } = require('pg');
let db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'JobPortal',
    password: 'SouraBh@12',
    port: 5432,
});

module.exports = db;
