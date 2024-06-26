const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const pool = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'FinanceApp'
})

async function createTables() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            email VARCHAR(225) DEFAULT NULL,
            password VARCHAR(225) DEFAULT NULL,
            user_id INT NOT NULL AUTO_INCREMENT,
            PRIMARY KEY (user_id),
            UNIQUE KEY unique_email (email)
        )
    `;

    const createItemsTable = `
        CREATE TABLE IF NOT EXISTS items (
            item_id VARCHAR(255) NOT NULL,
            user_id INT DEFAULT NULL,
            access_token VARCHAR(255) DEFAULT NULL,
            transaction_cursor VARCHAR(255) DEFAULT NULL,
            bank_name VARCHAR(255) DEFAULT NULL,
            PRIMARY KEY (item_id)
        )
    `;

    const createTransactionsTable = `
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(45) NOT NULL,
            user_id INT DEFAULT NULL,
            account_id VARCHAR(45) DEFAULT NULL,
            category VARCHAR(45) DEFAULT NULL,
            date DATETIME DEFAULT NULL,
            authorized_date DATETIME DEFAULT NULL,
            name VARCHAR(45) DEFAULT NULL,
            amount FLOAT DEFAULT NULL,
            PRIMARY KEY (id)
        )
    `;

    await pool.promise().query(createUsersTable);
    await pool.promise().query(createItemsTable);
    await pool.promise().query(createTransactionsTable);

    console.log('Database tables ensured.');
}

createTables();

async function getUserByEmail(email) {
    return pool.promise().query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
}

async function getItemByUserID(user_id) {
    return pool.promise().query('SELECT * FROM items WHERE user_id = ? LIMIT 1', [user_id])
}

async function createUser(email, password) {
    pool.promise().query('INSERT INTO users(email, password) VALUES(?, ?)', [email, password])
}

async function createItem(user_id, access_token, item_id) {
    pool.promise().query('INSERT INTO items(user_id, access_token, item_id) VALUES(?, ?, ?)', [user_id, access_token, item_id])
}

async function addTransaction(transactionObj) {
    pool.promise().query('INSERT IGNORE INTO transactions(id, user_id, account_id, category, date, authorized_date, name, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        transactionObj.id,
        transactionObj.userId,
        transactionObj.accountId,
        transactionObj.category,
        transactionObj.date,
        transactionObj.authorizedDate,
        transactionObj.name,
        transactionObj.amount
    ]
)}

async function modifyTransaction(transactionObj) {
    return pool.promise().query('UPDATE transactions SET account_id = ?, category = ?, date = ?, authorized_date = ?, name = ?, amount = ? WHERE id = ?', [
        transactionObj.accountId,
        transactionObj.category,
        transactionObj.date,
        transactionObj.authorizedDate,
        transactionObj.name,
        transactionObj.amount,
        transactionObj.id
    ])
}

async function markTransactionAsRemoved(transaction_id) {
    return pool.promise().query('DELETE FROM transactions WHERE id = ?', [transaction_id])
}

async function updateCursor(cursor, itemId) {
    pool.promise().query('UPDATE items SET transaction_cursor = ? WHERE item_id = ?', [cursor, itemId])
}

async function getAllTransactions(user_id) {
    return pool.promise().query('SELECT * FROM transactions WHERE user_id = ?', [user_id])
}

module.exports = {
    getUserByEmail,
    getItemByUserID,
    createUser,
    createItem,
    addTransaction,
    modifyTransaction,
    markTransactionAsRemoved,
    updateCursor,
    getAllTransactions
}