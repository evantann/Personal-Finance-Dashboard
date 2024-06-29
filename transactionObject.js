// transaction object class helps refactor code so that only a single variable is passed into the addTransaction function
class TransactionObj {
    constructor(
      id,
      userId,
      accountId,
      category,
      subcategory,
      date,
      name,
      vendor,
      amount,
      pendingTransactionId
    ) {
      this.id = id;
      this.userId = userId;
      this.accountId = accountId;
      this.category = category;
      this.subcategory = subcategory;
      this.date = date;
      this.name = name;
      this.vendor = vendor;
      this.amount = amount;
      this.pendingTransactionId = pendingTransactionId;
    }
  
    // method that feeds txnObj into constructor to create a new TransactionObj
    static createTransactionObject(txnObj, userId) {
      return new TransactionObj(
        txnObj.transaction_id,
        userId,
        txnObj.account_id,
        txnObj.personal_finance_category.primary,
        txnObj.personal_finance_category.detailed,
        txnObj.date,
        txnObj.name,
        txnObj.merchant_name,
        txnObj.amount,
        txnObj.pending_transaction_id
      )
    }
  }
  
  module.exports = { TransactionObj };