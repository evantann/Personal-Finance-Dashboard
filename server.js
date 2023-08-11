const plaid = require('plaid')
const express = require('express')
const dotenv = require('dotenv')
const app = express()
const userRouter = require("./routes/users")

dotenv.config()
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use("/users", userRouter)

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

app.get('/', (req, res) => {
  res.render('link')
})

app.get('/asdf', (req, res) => {
  res.render('asdf')
})

async function getLinkToken() {
const request = {
  user: {
    client_user_id: 'test123'
  },
  client_name: 'Personal Finance Dashboard',
  products: ['auth', 'transactions'],
  country_codes: ['US'],
  language: 'en',
  redirect_uri: 'http://localhost:8080/asdf',
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

app.get('/getLinkToken', async (req, res) => {
try {
  const linkToken = await getLinkToken();
  res.status(200).json({ link_token: linkToken });
} catch (error) {
  console.error('Error generating link token:', error);
  res.status(500).json({ error: 'Error creating link token.' });
}
});

app.post('/exchangePublicToken', async (req, res) => {
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

app.listen(8080)