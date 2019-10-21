let io;

module.exports = {
    init: server => {
        io = require('socket.io')(server, {
            serveClient: false,
            pingTimeout: 5000,
            pingInterval: 1000
        });
        return io;
    },
    getIO: () => {
        if(!io) {
            throw new Error('Socket is not initialized.');
        }
        return io;
    }
}