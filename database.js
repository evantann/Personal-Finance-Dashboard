// mySQL connection pool - credentials to reuse database connection
const mysql = require('mysql2');

module.exports = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password:'@Natnave1232524',
    database: 'FinanceApp'
});