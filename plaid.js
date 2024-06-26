const plaid = require('plaid')

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

module.exports = { plaidClient }