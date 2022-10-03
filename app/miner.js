const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet/index');

class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
        
    }
  
    mine() {
        const validTx = this.transactionPool.validTransactions();
        validTx.push(Transaction.minerReward(this.wallet, Wallet.blockchainWallet()));
        const block = this.blockchain.addBlock(validTx);
        this.p2pServer.syncChains();
        this.transactionPool.clear();
        this.p2pServer.broadcastClearPoolSign();

        return block;
    }
}
    
module.exports = Miner;