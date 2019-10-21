const express = require('express');

const messageController = require('../controllers/messages');

const router = express.Router();

// Send a message route
router.post('/sendMessage', messageController.postMessage);

// Create a username route
router.post('/checkName', messageController.postCheckName);

// Retrieve users route
router.get('/getUsers', messageController.getUsers);

// Retrive rooms route
router.get('/getRooms', messageController.getRooms);

// Create a new room route
router.post('/createNewRoom', messageController.postCreateRoom);

// Join a new room route
router.post('/joinRoom', messageController.postJoinRoom);

// Leave a room route
router.post('/leaveRoom', messageController.postLeaveRoom);

module.exports = router;