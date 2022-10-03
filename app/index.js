const express = require('express');
const Blockchain = require('../blockchain');
const bodyParse = require('body-parser');
const P2Pserver = require('./p2p_server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction_pool');
const Miner = require('./miner');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const bc = new Blockchain();
const tp = new TransactionPool();
const p2pServer = new P2Pserver(bc, tp);
const wallet = new Wallet();
const miner = new Miner(bc, tp, wallet, p2pServer);

app.use(bodyParse.json());

app.get('/address', (req, res) => {
    res.json({address: wallet.publicKey });
});

app.get('/balance', (req, res) => {
    res.json(wallet.getBalance(bc));
})

app.get('/chain', (req, res)=>{
    res.json(bc.chain);
})

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount, bc, tp);
    if (transaction) {
        p2pServer.broadcastTransaction(transaction)
    };
    res.redirect('/transactions');
});
app.get('/transactions', (req, res) => {
    res.json(tp.transactions);
});

app.get('/mine', (req, res)=>{
    const block = miner.mine();
    console.log(`New block added: ${block.toString()}`);
    // p2pServer.syncChains();
    res.redirect('/chain');
})

app.listen(HTTP_PORT, ()=>console.log(`Listenning on port ${HTTP_PORT}`));
p2pServer.listen();