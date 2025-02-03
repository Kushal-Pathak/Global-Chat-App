const express = require("express");
const WebSocket = require("ws");
require("dotenv").config();

const app = express();
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const CLEAR = process.env.CLEAR;

// Store last max number of messages
const max = 20;
let messages = [];

// Create an HTTP server
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Manage message queue
function manageMessagesQueue(message) {
  messages.push(message);
  if (messages.length > max) {
    messages.shift(); // Keep only last max number of messages
  }
}

// Handle command messages
function handleCommands(messageData) {
  const trimmedMessage = messageData.message.trim();
  if (trimmedMessage.startsWith(CLEAR)) {
    messages = [];
  }
}

// Broadcast messages to all connected clients
function broadcast() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(messages));
    }
  });
}

// Handle WebSocket connections
wss.on("connection", (ws) => {
  // Send the last max number of messages to newly connected client
  ws.send(JSON.stringify(messages));

  // Handle incoming messages
  ws.on("message", (data) => {
    try {
      const messageData = JSON.parse(data);
      if (messageData.user_id && messageData.username && messageData.message) {
        manageMessagesQueue(messageData);
        handleCommands(messageData);
        broadcast(messageData);
      }
    } catch (error) {
      console.error("Invalid message format", error);
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
