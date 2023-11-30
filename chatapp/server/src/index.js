// Import necessary modules
import { createServer } from 'http'; // Create an HTTP server
import { Server } from "socket.io"; // Import the Socket.IO module
import { v4 as uuidv4 } from "uuid"; // Generate unique IDs
import express from 'express'; // Import the express module
import cors from 'cors'; // Import the cors module

const app = express(); // Create an express app
const httpServer = createServer(app); // Use the express app to create the HTTP server

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000", // Define the allowed origin
        methods: ["GET", "POST"] // Define allowed HTTP methods
    },
});

app.use(cors()); // Use cors middleware in your express app to handle cross-origin requests

io.use((socket, next) => {
    console.log("New connection"); // Log a message when a new connection is established
    const username = socket.handshake.auth.username; // Retrieve the username from the handshake data
    if (!username) {
        return next(new Error('Authentication: invalid username')); // Check for a valid username, return an error if not provided
    }
    socket.username = username; // Attach the username to the socket object
    socket.userId = uuidv4(); // Generate a unique user ID and attach it to the socket
    next();
});

io.on("connection", async (socket) => {
    // Handle socket events when a client connects
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
        users.push({
            userId: socket.userId,
            username: socket.username,
        });
    }
    socket.emit("users", users); // Emit the list of users to the connected client
    socket.emit("session", { userId: socket.userId, username: socket.username }); // Emit session information to the connected client
});

console.log("listening to port"); // Log a message indicating the server is listening
httpServer.listen(process.env.PORT || 4000); // Start the server on the specified port or a default port
