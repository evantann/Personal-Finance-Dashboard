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

    static snakeToTitleCase(s) {
      const words = s.toLowerCase().split('_');
      const titleCase = words.map(word => {
        if (word !== 'and') {
          return word.charAt(0).toUpperCase() + word.slice(1);
        } else {
          return word; // Keep 'and' as it is
        }
      }).join(' ');
      return titleCase;
    }    

    static removeCategory(category, subcategory) {
      const subcat = subcategory.replace(category + '_', '')
      const result = TransactionObj.snakeToTitleCase(subcat);
      return result;
    }
    // method that feeds txnObj into constructor to create a new TransactionObj
    static createTransactionObject(txnObj, userId) {
      return new TransactionObj(
        txnObj.transaction_id,
        userId,
        txnObj.account_id,
        TransactionObj.snakeToTitleCase(txnObj.personal_finance_category.primary),
        TransactionObj.removeCategory(txnObj.personal_finance_category.primary, txnObj.personal_finance_category.detailed),
        txnObj.date,
        txnObj.name,
        txnObj.merchant_name,
        txnObj.amount,
        txnObj.pending_transaction_id
      )
    }
  }
  
  module.exports = { TransactionObj };