class TransactionObj {
    constructor(
      id,
      userId,
      accountId,
      category,
      date,
      authorizedDate,
      name,
      amount,
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
      this.pendingTransactionId = pendingTransactionId;
    }
  

    static createTransactionObject(txnObj, userId) {
      return new TransactionObj(
        txnObj.transaction_id,
        userId,
        txnObj.account_id,
        txnObj.personal_finance_category.primary,
        txnObj.date,
        txnObj.authorized_date,
        txnObj.merchant_name ?? txnObj.name,
        txnObj.amount,
        txnObj.pending_transaction_id
      )
    }
  }
  
  module.exports = { TransactionObj };