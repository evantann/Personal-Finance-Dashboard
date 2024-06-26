const express = require('express');
const router = express.Router();
const db = require('../database');
const { plaidClient } = require('../plaid');
const { TransactionObj } = require('../transactionObject');

router.route('/transactionsSync').get(async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const results = await db.getItemByUserID(user_id);
        const { item_id, access_token, transaction_cursor } = results[0][0];
        await syncTransactions(item_id, user_id, access_token, transaction_cursor);
        const response = await db.getAllTransactions(user_id);
        res.json(response[0]);
    } catch (error) {
        console.error('Cannot get transactions:', error);
        res.json({ error: 'Cannot get transactions' });
    }
});

async function syncTransactions(item_id, user_id, access_token, transaction_cursor) {
    const summary = { added: 0, removed: 0, modified: 0 };
    const allData = await fetchNewSyncData(access_token, transaction_cursor);

    for (const txnObj of allData.added) {
        const result = await db.addTransaction(
            TransactionObj.createTransactionObject(txnObj, user_id)
        );
        if (result) summary.added += result.changes;
    }

    for (const txnObj of allData.modified) {
        const result = await db.modifyTransaction(
            TransactionObj.createTransactionObject(txnObj, user_id)
        );
        if (result) summary.modified += result.changes;
    }

    for (const txnObj of allData.removed) {
        const result = await db.markTransactionAsRemoved(txnObj.transaction_id);
        if (result) summary.removed += result.changes;
    }

    await db.updateCursor(allData.nextCursor, item_id);
    return summary;
}

async function fetchNewSyncData(access_token, initial_cursor) {
    let keepGoing = true;
    const allData = {
        added: [],
        modified: [],
        removed: [],
        nextCursor: initial_cursor
    };

    while (keepGoing) {
        const results = await plaidClient.transactionsSync({
            access_token,
            cursor: allData.nextCursor,
        });

        const newData = results.data;
        allData.added.push(...newData.added); // ... (spread operator) iterates over the array and push adds each element to the new array
        allData.modified.push(...newData.modified);
        allData.removed.push(...newData.removed);
        allData.nextCursor = newData.next_cursor;
        keepGoing = newData.has_more;
    }

    return allData;
}

module.exports = router;