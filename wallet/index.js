const {INITIAL_BALANCE} = require('../config')
const ChainUtil = require('../chain_util');
const Transaction = require('./transaction');

class Wallet{
    constructor(){
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString(){
        return `Walet -
        publicKey : ${this.publicKey.toString()}
        balance   : ${this.balance} `
    }

    sign(hasedData) {
        return this.keyPair.sign(hasedData);
    }

    createTransaction(recipient, amount, blockchain, transactionPool) {
        this.balance = this.getBalance(blockchain);

        if (amount > this.balance) {
            console.log(`Amount: ${amount}, exceeds current balance: ${this.balance}`);
            return;
        }   
      
        let transaction = transactionPool.existedTransactionOfWallet(this.publicKey);
        if (transaction) {
            transaction.update(this, recipient, amount);
        } else {
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.addTransaction(transaction);
        }
    
        return transaction;
    }    

    static blockchainWallet(){
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet;
    }

    getBalance(blockchain){
        let balance = this.balance;
        let transactions = [];
        blockchain.chain.forEach(block => block.data.forEach(tx => {
            transactions.push(tx);
        }))

        const sentTx = transactions.filter(tx => 
            tx.input.address === this.publicKey);

        let startTime = 0;

        if (sentTx.length > 0){
            const lastSentTx = sentTx.reduce((prev, current) =>
                prev.input.timestamp > current.input.timestamp? prev : current);
            
            balance = lastSentTx.outputs.find(output =>
                output.address === this.publicKey).amount;
            
            startTime = lastSentTx.input.timestamp;
        }

        transactions.forEach(tx => {
            if (tx.input.timestamp > startTime){
                tx.outputs.forEach(output => {
                    if (output.address === this.publicKey){
                        balance += output.amount;
                    }
                })
            }
        })

        return balance;
    }
}

module.exports = Wallet;