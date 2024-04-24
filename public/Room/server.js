const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('offer', (data) => {
        io.emit('offer', data);
    });

    socket.on('answer', (data) => {
        io.emit('answer', data);
    });

    socket.on('icecandidate', (data) => {
        io.emit('icecandidate', data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
