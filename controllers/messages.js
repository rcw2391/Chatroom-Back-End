const io = require('../socket');

const User = require('../models/user');

const Room = require('../models/rooms');

//Post message request
exports.postMessage = (req, res, next) => {
    const message = req.body.message;
    const room = req.body.room;
    const id = req.body.userId;
    if (message.length > 140) {
        return res.status(406).json({message: 'Message must be less than 140 characters.'})
    }
    const user = User.findUserById(id);
    if (!user) {
        return res.status(409).json({message: 'User not found.'});
    }
    if (!Room.findRoomByName(room).verifyUser(id)) {
        console.log(id);
        return res.status(401).json({message: 'Not authorized to post in this room.'});
    }
    io.getIO().of(room).emit('messages', {user: user.name, message: message});
    res.status(200).json({message: 'Message sent.'});
};

//Username POST request
exports.postCheckName = (req, res, next) => {
    const userName = req.body.userName.trim();
    const regex = /[^\w\s]/;
    const user = User.findUserById(req.body.id);
    if (!user) {
        return res.status(401).json({message: 'User not found.'});
    }
    if (userName.length > 20) {
        return res.status(406).json({message: 'Username must be less than 20 characters.'});
    }
    if (userName.length < 1) {
        return res.status(406).json({message: 'Please enter a username.'});
    }
    if (regex.test(userName)) {
        return res.status(406).json({action: 'rejected', message: 'Username must be alphanumeric!'});
    }
    if (User.findUserByName(userName)) {
        return res.status(406).json({action: 'rejected', message: 'Username is already in use.'});
    }
    user.giveName(userName);
    res.status(200).json({action: 'accepted', userName: user.name});
}

//Retrieve users in a channel GET request
exports.getUsers = (req, res, next) => {
    const id = req.headers.id;
    const room = Room.findRoomByName(req.headers.room);
    if(room === -1) {
        res.status(409).json({message: 'Room does not exist.'})
    }
    if(room.verifyUser(id)){
        const users = [];
        for(let user of room.getUsers()){
            users.push(User.findUserById(user).name);
        }
        io.getIO().of(room.name).emit('userList', {users: users});
        res.status(200).json({message: users});
    } 
}

//Retrieve rooms in a GET request
exports.getRooms = (req, res, next) => {
    const user = User.findUserById(req.headers.userid);
    if(!user) {
        throw new Error('User does not exist.');
    }
    io.getIO().emit('rooms', {rooms: user.getRooms()});
    res.status(200).json({message: 'Rooms delivered.'}); 
}

//POST request for creating a new room
exports.postCreateRoom = (req, res, next) => {
    const password = req.body.password;
    const id = req.body.userId;
    if(Room.findRoomByName(req.body.room) !== -1){
        return res.status(409).json({message: 'A room by that name already exists.'});
    }
    const room = new Room(req.body.room, password, id);
    const user = User.findUserById(id);
    if(!user) {
        return res.status(401).json({message: 'No such user exists.'});
    } 
    user.addRoomToUser(room.name);
    const users = [];
    for (let user of room.getUsers()) {
        users.push(User.findUserById(user).name);
    }
    io.getIO().of(room.name);
    res.status(200).json({message: 'Room created.', users: users});
}

//Post request for joining a room.
exports.postJoinRoom = (req, res, next) => {
    const id = req.body.userId;
    const password = req.body.password;
    const user = User.findUserById(id);
    const room = Room.findRoomByName(req.body.room);
    if(room === -1) {
        return res.status(409).json({message: 'No such room exists.'});
    }
    if(!room.verifyPassword(password)) {
        return res.status(401).json({message: 'Incorrect password.'});
    }
    if(!user) {
        return res.status(401).json({message: 'No such user exists.'});
    }
    if(user.getRooms().includes(room.name)){
        return res.status(409).json({message: 'You are already in this room!'});
    }
    user.addRoomToUser(room.name);
    room.addUser(user.id);
    const users = [];
    for (let user of room.getUsers()) {
        users.push(User.findUserById(user).name);
    }
    io.getIO().of(room.name).emit('userJoin', {user: 'server', message: user.name})
    res.status(200).json({message: 'Room joined.', users: users});
}

// POST request for leaving a room.
exports.postLeaveRoom = (req, res, next) => {
    const room = Room.findRoomByName(req.body.room);
    const user = User.findUserById(req.body.id);
    if(room === -1){
        return res.status(401).json({message: 'No such room exists.'});
    }
    if(!user) {
        return res.status(401).json({message: 'No such user exists.'});
    }
    room.removeUser(req.body.id);
    res.status(200).json({message: 'User removed.'});
}