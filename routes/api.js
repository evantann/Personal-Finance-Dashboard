const express = require('express')
const router = express.Router()
const db = require('../database')
const plaid = require('plaid')
const dotenv = require('dotenv')
const path = require('path')
const { TransactionObj } = require('../transactionObject')

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const config = new plaid.Configuration({
    basePath: plaid.PlaidEnvironments.sandbox,
    baseOptions: {
      headers:{
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET
      }
    }
})
    
const plaidClient = new plaid.PlaidApi(config)


// Generates link token
router.route('/getLinkToken').get( async (req, res) => {
try {
    const linkToken = await getLinkToken()
    res.status(200).json({ link_token: linkToken })
} catch (error) {
    console.error('Error generating link token:', error)
    res.status(500).json({ error: 'Error creating link token.' })
}
})


// Exchange public token for access token
router.route('/exchangePublicToken').post( async (req, res) => {
    const user_id = req.body.user_id
    const public_token = req.body.public_token
    const request = {
    public_token: public_token
}
try {
    const response = await plaidClient.itemPublicTokenExchange(request)
    const access_token = response.data.access_token
    const item_id = response.data.item_id
    await db.createItem(user_id, access_token, item_id)
    res.status(200).json({ msg: 'Bank account connected!' })
} catch (error) {
    console.error('Error exchanging public token:', error)
    res.status(500).json({ error: 'Error exchanging public token' })
}
})


router.route('/transactionsSync').get( async (req, res) => {
    try {
        const user_id = req.query.user_id
        results = await db.getItemByUserID(user_id)
        const { item_id : item_id } = results[0][0]
        response = await syncTransactions(item_id, user_id)
        res.json(response)
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


async function getLinkToken() {
const request = {
    user: {
    client_user_id: 'test123'
    },
    client_name: 'Personal Finance Dashboard',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'en',
    account_filters: {
        depository: {
            account_subtypes: ['checking']
        },
        credit: {
            account_subtypes: ['credit card']
        }
    },
}
try {
    const response = await plaidClient.linkTokenCreate(request)
    return response.data.link_token
} catch (error) {
    console.error('Error creating link token:', error)
    throw new Error('Error creating link token.')
    }
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