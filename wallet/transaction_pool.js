const Transaction = require('../wallet/transaction');

class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    addTransaction(transaction) {
        let id = transaction.id;

        let existedTransaction = this.transactions.find(tx => tx.id === id);
        if (existedTransaction) {
            this.transactions[this.transactions.indexOf(existedTransaction)] = transaction;
        } 
        else {
            this.transactions.push(transaction);
        }
    }

    existedTransactionOfWallet(address) {
        return this.transactions.find(tx => tx.input.address === address);
    }

    validTransactions() {
        return this.transactions.filter(tx => {
            const totalOutput = tx.outputs.reduce((total, output) => {
                return total + output.amount;
            }, 0);
            
            if (tx.input.amount !== totalOutput) {
                console.log(`Invalid transaction from ${tx.input.address}.`);
                return;
            }
        
            if (!Transaction.verifyTransaction(tx)) {
                console.log(`Invalid signature from ${tx.input.address}.`)
                return;
            };
            
            return true;
        });
    }

    clear(){
        this.transactions = [];
    }
}

module.exports = TransactionPool;