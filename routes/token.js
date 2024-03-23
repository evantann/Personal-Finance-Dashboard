const express = require('express')
const router = express.Router()
const db = require('../database')
const { plaidClient } = require('../plaid')

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