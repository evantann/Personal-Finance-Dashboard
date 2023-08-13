const mysql = require('mysql2');
const dotenv = require('dotenv')

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
    return pool.promise().query('SELECT access_token, item_id FROM items WHERE user_id = ? LIMIT 1', [user_id])
}

async function createUser(email, password) {
    pool.promise().query('INSERT INTO users(email, password) VALUES(?, ?)', [email, password])
}

async function getUserID(email) {
    return pool.promise().query('SELECT user_id from users WHERE email = ?', [email])
}

async function createItem(user_id, access_token, item_id) {
    pool.promise().query('INSERT INTO items(user_id, access_token, item_id) VALUES(?, ?, ?)', [user_id, access_token, item_id])
}

module.exports = {
    getUserByEmail,
    getItemByUserID,
    createUser,
    getUserID,
    createItem
}