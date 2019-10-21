const User = require('./user');

const io = require('../socket');

const rooms = [];

module.exports = class Room {
    constructor(name, password, creator) {
        this.name = name;
        this.password = password;
        this.creator = creator;
        this.users = [];
        this.users.push(creator);
        rooms.push(this);
    }

    // Add a user to the rooms list
    addUser(user) {
        this.users.push(user);
    }

    // Remove a user from a room
    removeUser(userToRemove) {
        const User = require('./user');
        const index = this.users.findIndex(user => {
            return user == userToRemove;
        });
        this.users.splice(index, 1);
        if (this.name !== '/public') {
            if (this.users.length === 0) {
                const roomIndex = Room.findRoomIndexByName(this.name);
                rooms.splice(roomIndex, 1);
            }
        }
        if(userToRemove !== 'server') {
            const users = [];
            for (let user of this.users) {
                
                users.push(User.findUserById(user).name);
            }
            io.getIO().of(this.name).emit('userList', { users: users, message: User.findUserById(userToRemove).name, user: 'server' });
            const user = User.findUserById(userToRemove);
            user.removeRoomFromUser(this.name);
        }     
    }

    // Verify a user is a member of a room
    verifyUser(userToFind) {
        return this.users.find(user => {
           return user == userToFind;
        });
    }

    // Verify password for a room
    verifyPassword(password) {
        if(password === this.password){
            return true;
        }
        return false;
    }

    // Return the users in a room
    getUsers() {
        return this.users;
    }

    // Static return room object by name
    static findRoomByName(name) {
        const index = rooms.findIndex(room => {
            return room.name === name;
        })
        if(index != -1) {
            return rooms[index];
        }
        return index;
    }

    // Static return room index by name
    static findRoomIndexByName(name) {
        const index = rooms.findIndex(room => {
            return room.name === name;
        });
        if(index !== -1) {
            return index;
        }
    }

    // Remove a user from all rooms
    static removeUserFromAll(userRooms, user) {
        for (let i=0; i < userRooms.length; i++) {
            const room = Room.findRoomByName(userRooms[i]);
            room.removeUser(user);            
        }
    }
}