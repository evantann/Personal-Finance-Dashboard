const express = require('express')
const router = express.Router()
const db = require('../database')
const { plaidClient } = require('../plaid')
const { TransactionObj } = require('../transactionObject')

router.route('/transactionsSync').get(async (req, res) => {
    try {
        const user_id = req.session.user_id
        results = await db.getItemByUserID(user_id)
        const { item_id: item_id } = results[0][0]
        await syncTransactions(item_id, user_id)
        response = await db.getAllTransactions(user_id)
        res.json(response[0])
        } catch (error) {
        console.error('Cannot get transactions')
        res.json({ error: 'Cannot get transactions' })
    }
})

// converts transactions to txnObj then adds to database
async function syncTransactions(item_id, user_id) {
    const summary = { added: 0, removed: 0, modified: 0 }
    results = await db.getItemByUserID(user_id)
    const {
        access_token: access_token,
        transaction_cursor: transaction_cursor
    } = results[0][0]
    const allData = await fetchNewSyncData(access_token, transaction_cursor)

    allData.added.map(async (txnObj) => {
        const result = await db.addTransaction(
            TransactionObj.createTransactionObject(txnObj, user_id)
        )
        if (result) {
            summary.added += result.changes
        }
    })

    allData.modified.map(async (txnObj) => {
        const result = await db.modifyTransaction(
            TransactionObj.createTransactionObject(txnObj, userId)
        )
        if (result) {
            summary.modified += result.changes
        }
    })

    allData.removed.map(async (txnObj) => {
        const result = await db.markTransactionAsRemoved(txnObj.transaction_id)
        if (result) {
            summary.removed += result.changes
        }
    })

    await db.updateCursor(allData.nextCursor, item_id);

    return allData
}


// calls transactionsSync() to get latest transactions
async function fetchNewSyncData(access_token, initial_cursor) {
    let keepGoing = true
    const allData = {
        added: [],
        modified: [],
        removed: [],
        nextCursor: initial_cursor
    }
    do {
        const results = await plaidClient.transactionsSync({
            access_token: access_token,
            cursor: allData.nextCursor,
            options: {
                include_personal_finance_category: true
            }
        })
        
        const newData = results.data
        allData.added = allData.added.concat(newData.added)
        allData.modified = allData.modified.concat(newData.modified)
        allData.removed = allData.removed.concat(newData.removed)
        allData.nextCursor = newData.next_cursor
        keepGoing = newData.has_more
    } while (keepGoing === true)
    return allData
}

module.exports = router