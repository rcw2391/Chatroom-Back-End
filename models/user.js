const Room = require('./rooms');

const users = [];

module.exports = class User {
    constructor(id) {
        this.id = id;
        this.name;
        this.rooms = [];
        users.push(this);
    }

    // Give user a name
    giveName(name) {
        this.name = name;
    }
    
    // Remove user from user list and all rooms
    removeUser() {
        const userIndex = users.findIndex(user => {
            return user.id === this.id;
        });
        Room.removeUserFromAll(this.rooms, this.id);
        users.splice(userIndex, 1);
    }

    // Add a room to a user
    addRoomToUser(room) {
        this.rooms.push(room);
    }

    // Remove a room from a user
    removeRoomFromUser(roomToRemove) {
        const index = this.rooms.findIndex(room => {
            return room === roomToRemove;
        });
        if(index !== -1){
            this.rooms.splice(index, 1);
        }
    }

    // Return rooms list
    getRooms() {
        return this.rooms;
    }

    //Static return a user by id
    static findUserById(id) {
        return users.find(user => {
            return user.id === id;
        });
    }

    //Static return a user by name
    static findUserByName(name) {
        return users.find(user => {
            return user.name == name;
        });
    }

    //static return all users
    static getUsers() {
        return users;
    }

    //Static return all users by name
    static getUsersNames() {
        const names = [];
        for (let i=0; i < users.length; i++) {
            names.push(users[i].name);
        }
        return names;
    }
}