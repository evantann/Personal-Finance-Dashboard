class SimpleTransaction {
    constructor(
      id,
      userId,
      accountId,
      category,
      date,
      authorizedDate,
      name,
      amount,
      currencyCode,
      pendingTransactionId
    ) {
      this.id = id;
      this.userId = userId;
      this.accountId = accountId;
      this.category = category;
      this.date = date;
      this.authorizedDate = authorizedDate;
      this.name = name;
      this.amount = amount;
      this.currencyCode = currencyCode;
      this.pendingTransactionId = pendingTransactionId;
    }
  
    /**
     * Static factory method for creating the SimpleTransaction object
     *
     * @param {import("plaid").Transaction} txnObj The transaction object returned from the Plaid API
     * @param {string} userId The userID
     * @returns SimpleTransaction
     */
    static fromPlaidTransaction(txnObj, userId) {
      // TODO: Fill this out
    }
  }
  
  module.exports = { SimpleTransaction };