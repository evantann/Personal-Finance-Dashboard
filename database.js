const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "FinanceApp",
});

async function createTables() {
    const createUsersTable = `CREATE TABLE IF NOT EXISTS users (
        user_id INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(225) NOT NULL,
        password VARCHAR(225) NOT NULL,
        PRIMARY KEY (user_id),
        UNIQUE KEY unique_username (username))`;

    const createItemsTable = `CREATE TABLE IF NOT EXISTS items (
        item_id VARCHAR(255) NOT NULL,
        user_id INT DEFAULT NULL,
        access_token VARCHAR(255) DEFAULT NULL,
        transaction_cursor VARCHAR(255) DEFAULT NULL,
        institution VARCHAR(255) DEFAULT NULL,
        PRIMARY KEY (item_id))`;

    const createAccountsTable = `CREATE TABLE IF NOT EXISTS accounts (
        account_id VARCHAR(255) NOT NULL,
        item_id VARCHAR(255) DEFAULT NULL,
        account_name VARCHAR(255) DEFAULT NULL,
        subtype VARCHAR(255) DEFAULT NULL,
        type VARCHAR(255) DEFAULT NULL,
        PRIMARY KEY (account_id))`;

    const createTransactionsTable = `CREATE TABLE IF NOT EXISTS transactions (
        transaction_id VARCHAR(255) NOT NULL,
        user_id INT DEFAULT NULL,   
        account_id VARCHAR(255) DEFAULT NULL,
        category VARCHAR(255) DEFAULT NULL,
        subcategory VARCHAR(255) DEFAULT NULL,
        date DATETIME DEFAULT NULL,
        transaction_name VARCHAR(255) DEFAULT NULL,
        vendor VARCHAR(255) DEFAULT NULL,
        amount FLOAT DEFAULT NULL,
        PRIMARY KEY (transaction_id))`;

    await pool.promise().query(createUsersTable);
    await pool.promise().query(createItemsTable);
    await pool.promise().query(createAccountsTable);
    await pool.promise().query(createTransactionsTable);
}

async function getUserByUsername(username) {
    return pool.promise().query("SELECT * FROM users WHERE username = ? LIMIT 1", [username]);
}

async function getItemByUserID(user_id) {
    return pool.promise().query("SELECT * FROM items WHERE user_id = ? LIMIT 1", [user_id]);
}

async function addUser(username, password) {
    pool.promise().query("INSERT INTO users(username, password) VALUES(?, ?)", [username, password,]);
}

async function addItem(user_id, access_token, item_id) {
    pool.promise().query(
        "INSERT INTO items(user_id, access_token, item_id) VALUES(?, ?, ?)",
        [user_id, access_token, item_id]);
}

async function addInstitutionForItem(item_id, institution) {
    pool.promise().query(
        "UPDATE items SET institution = ? WHERE item_id = ?",
        [institution, item_id]);
}

async function addAccount(account_id, item_id, account_name, subtype, type) {
    pool.promise().query(
        "INSERT INTO accounts(account_id, item_id, account_name, subtype, type) VALUES (?, ?, ?, ?, ?)",
        [account_id, item_id, account_name, subtype, type]);
}

async function addTransaction(transactionObj) {
    pool.promise().query(
        "INSERT IGNORE INTO transactions(transaction_id, user_id, account_id, category, subcategory, date, transaction_name, vendor, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            transactionObj.id,
            transactionObj.userId,
            transactionObj.accountId,
            transactionObj.category,
            transactionObj.subcategory,
            transactionObj.date,
            transactionObj.name,
            transactionObj.vendor,
            transactionObj.amount,
        ]
    );
}

async function modifyTransaction(transactionObj) {
    return pool.promise().query(
        "UPDATE transactions SET account_id = ?, category = ?, subcategory = ?, date = ?, transaction_name = ?, vendor = ?, amount = ? WHERE id = ?",
        [
            transactionObj.accountId,
            transactionObj.category,
            transactionObj.subcategory,
            transactionObj.date,
            transactionObj.name,
            transactionObj.vendor,
            transactionObj.amount,
            transactionObj.id,
        ]
    );
}

async function deleteTransaction(transaction_id) {
    return pool.promise().query("DELETE FROM transactions WHERE id = ?", [transaction_id]);
}

async function updateCursor(cursor, itemId) {
    pool.promise().query("UPDATE items SET transaction_cursor = ? WHERE item_id = ?", [cursor, itemId]);
}


async function getAllTransactions(user_id) {
    return pool.promise().query("SELECT * FROM transactions WHERE user_id = ?", [user_id]);
}

createTables();

module.exports = {
    getUserByUsername,
    getItemByUserID,
    addUser,
    addItem,
    addInstitutionForItem,
    addAccount,
    addTransaction,
    modifyTransaction,
    deleteTransaction,
    updateCursor,
    getAllTransactions,
};