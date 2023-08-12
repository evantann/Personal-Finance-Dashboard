const express = require('express')
const router = express.Router()
const db = require('../database')
const plaid = require('plaid')
const dotenv = require('dotenv')
const path = require('path')
const moment = require('moment')

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
    await db.promise().query(`UPDATE users SET access_token = '${access_token}' WHERE userid = '${user_id}'`)
    res.status(200).json({ success: true })
} catch (error) {
    console.error('Error exchanging public token:', error)
    res.status(500).json({ success: false, error: 'Error exchanging public token' })
}
})


router.route("/getTransactions").get( async (req, res) => {
    const access_token = req.query.access_token
    const start_date = moment().subtract(30, "days").format("YYYY-MM-DD")
    const end_date = moment().format("YYYY-MM-DD")
    const transactions = await plaidClient.transactionsGet({
        access_token: access_token,
        start_date: start_date,
        end_date: end_date,
      })

    res.json(transactions.data)
})


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


module.exports = router