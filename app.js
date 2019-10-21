const express = require('express');

const routes = require('./routes/routes');

const bodyParser = require('body-parser');

const User = require('./models/user');

const rateLimit = require('express-rate-limit');

const app = express();

const Room = require('./models/rooms');

app.use(bodyParser.json());

// Limit to creating a new user name 5 times an hour
const nameLimiter = rateLimit({
    windowMs: 60000,
    max: 5,
    message: 'Too many name requests, please wait.',
    handler: (req, res, next) => {
        res.status(429).json({message: 'Too many name requests, please wait.'});
    }
});

// Limit the number of post message requests to 5 every 10 seconds
const chatLimiter = rateLimit({
    windowMs: 10000,
    max: 5,
    message: 'Too many messages, please wait.',
    handler: (req, res, next) => {
        io.of(req.body.room).emit('spam', { message: 'Too many messages, please wait.' });
    }
});

//CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, username, room, userid, id');
    next();
});

// Apply rate-limiters
app.use('/sendMessage', chatLimiter);
app.use('/checkName', nameLimiter);

// Apply routes
app.use(routes);

// Create server
const server = app.listen(3000);

// Create socket
const io = require('./socket').init(server);

// Create public room
const public = new Room('/public', '', 'server');
public.removeUser('server');
io.of('/public');

// Manage new connections
io.on('connection', socket => {
    const user = new User(socket.client.id);
    socket.emit('userId', {id: user.id});
    socket.on('disconnect', reason => {
        user.removeUser();
    });
});