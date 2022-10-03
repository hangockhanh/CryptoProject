const P2pServer = require('./app/p2p_server');
const express = require('express');


p2pServer = new P2pServer();
app = new express();

let socket = 'ws://localhost:5001';

socket


p2pServer.listen();
app.listen(3003);