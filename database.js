const mysql = require('mysql2')
const dotenv = require('dotenv')
const { transactionObj } = require("./transactionObject")

dotenv.config()

const pool = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'FinanceApp'
})

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

async function updateCursor(cursor, itemId) {
    pool.promise().query('UPDATE items SET transaction_cursor = ? WHERE item_id = ?', [cursor, itemId])
}

module.exports = {
    getUserByEmail,
    getItemByUserID,
    createUser,
    createItem,
    addTransaction,
    updateCursor
}