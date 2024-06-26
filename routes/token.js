const express = require("express");
const router = express.Router();
const db = require("../database");
const { plaidClient } = require("../plaid");

// Generates link token
router.route("/getLinkToken").get(async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const linkToken = await getLinkToken(user_id);
    res.status(200).json({ link_token: linkToken });
  } catch (error) {
    console.error("Error generating link token:", error);
    res.status(500).json({ error: "Error creating link token." });
  }
});

// Exchange public token for access token
router.route("/exchangePublicToken").post(async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const public_token = req.body.public_token;
    const request = { public_token: public_token };
    const response = await plaidClient.itemPublicTokenExchange(request);
    const access_token = response.data.access_token;
    const item_id = response.data.item_id;
    await db.addItem(user_id, access_token, item_id);
    await populateBankName(item_id, access_token);
    await populateAccountNames(access_token);
    res.status(200).json({ msg: "Bank account connected!" });
  } catch (error) {
    console.error("Error exchanging public token:", error);
    res.status(500).json({ error: "Error exchanging public token" });
  }
});

async function getLinkToken(user_id) {
  const request = {
    user: {
      client_user_id: user_id.toString(),
    },
    client_name: "Personal Finance Dashboard",
    products: ["transactions"],
    country_codes: ["US"],
    language: "en",
    account_filters: {
      depository: {
        account_subtypes: ["checking"],
      },
      credit: {
        account_subtypes: ["credit card"],
      },
    },
  };
  try {
    const response = await plaidClient.linkTokenCreate(request);
    return response.data.link_token;
  } catch (error) {
    console.error("Error creating link token:", error);
    throw new Error("Error creating link token.");
  }
}

// gets the institution name of an item then adds it to the items table
// each item represents a login at a financial institution
const populateBankName = async (itemId, accessToken) => {
  try {
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });
    const institutionId = itemResponse.data.item.institution_id;
    if (institutionId == null) {
      return;
    }
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"],
    });
    const institutionName = institutionResponse.data.institution.name;
    await db.addInstitutionForItem(itemId, institutionName);
  } catch (error) {
    console.log(`Ran into an error! ${error}`);
  }
};

// gets the account names and id then adds them to the accounts table
const populateAccountNames = async (accessToken) => {
  try {
    const acctsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    const acctsData = acctsResponse.data;
    const itemId = acctsData.item.item_id;
    await Promise.all( // Promise.all() + map() is used to wait for all promises to resolve concurrently
      acctsData.accounts.map(async (acct) => {
        await db.addAccount(acct.account_id, itemId, acct.name);
      })
    );
  } catch (error) {
    console.log(`Ran into an error! ${error}`);
  }
};

module.exports = router;