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

router.route('/').get((req, res) => {
    res.render('link')
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
    }
    },
};
try {
    const response = await plaidClient.linkTokenCreate(request);
    return response.data.link_token;
} catch (error) {
    console.error('Error creating link token:', error);
    throw new Error('Error creating link token.');
}
}

router.route('/getLinkToken').get( async (req, res) => {
try {
    const linkToken = await getLinkToken();
    res.status(200).json({ link_token: linkToken });
} catch (error) {
    console.error('Error generating link token:', error);
    res.status(500).json({ error: 'Error creating link token.' });
}
});

router.route('/exchangePublicToken').post( async (req, res) => {
    const public_token = req.body.public_token
    const request = {
    public_token: public_token
};
try {
    const response = await plaidClient.itemPublicTokenExchange(request);
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;
    console.log(accessToken, itemId)
    res.status(200).json({ success: true });
} catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({ success: false, error: 'Error exchanging public token' });
}
});

router.route("/getTransactions").get( async (req, res) => {
    const access_token = req.query.access_token
    const startDate = moment().subtract(30, "days").format("YYYY-MM-DD")
    const endDate = moment().format("YYYY-MM-DD")

    const transactionResponse = await plaidClient.transactionsGet({
        access_token: access_token,
        start_date: startDate,
        end_date: endDate,
      })

    res.json(transactionResponse.data)
})

module.exports = router