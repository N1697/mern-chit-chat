import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import colors from "colors";
import { chats } from "./data/data.js";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { Server } from "socket.io";
import path from "path";

const app = express();
app.use(express.json()); //Accept json data
dotenv.config();
connectDB();

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//=================== Deployment ===================

const __workingDirName = path.resolve();

//Since we're preparing the app for the production, we'll use a dotenv variable called NODE_ENV
//and we're gonna set it to the production mode
if (process.env.NODE_ENV === "production") {
  //Establish the path from the current working directory to the build folder of the front-end
  app.use(express.static(path.join(__workingDirName, "/frontend/build")));

  //Get the content inside of the index.html of the front-end build folder
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__workingDirName, "frontend", "build", "index.html")
    ); //Send the file to the front-end when the app is successfully running
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running");
  });
}

//=================== Deployment ===================

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT: ${PORT}`.blue.bold)
);

const io = new Server(server, {
  pingTimeout: 60000, //The amount of time it will wait while being inactive before it goes off to save the bandwidth
  cors: {
    origin: [
      "http://localhost:3000",
      "https://heartfelt-syrniki-1e37ae.netlify.app/",
    ], //http://localhost:3000
  },
});

io.on("connection", (socket) => {
  //'socket' object representing the connection to the client
  console.log("Connected to socket.io");

  //Every time a user opens the app, he should be connected to his own personal socket
  //We create a new socket where the front-end will send some data to and will join a room
  socket.on("setup", (user) => {
    socket.join(user._id);
    console.log(user._id);

    socket.emit("connected");

    /**
     The server listens for a setup event from the client. This event is used to establish a unique connection for each user.
     When the server receives the setup event, it creates a new room with the user's ID and adds the socket to that room using the socket.join() method.
     The server then emits a connected event back to the client using the socket.emit() method.
     */
  });

  //Create a socket to join a chat
  //This socket takes the room's id from the front-end
  socket.on("join chat", (roomID) => {
    //When a user clicks on any of the chat, it will create a new room with that particular user and the other users that join the room
    socket.join(roomID);
    console.log("User joined the room: " + roomID);

    /**
     The server also listens for a join chat event from the client.
     This event is used to join a chat room with other users. When the server receives the join chat event,
     it creates a new room with the given roomID and adds the socket to that room using the socket.join() method.
     */
  });

  //Create socket for typing and stop-typing
  socket.on("typing", (roomID) => {
    socket.in(roomID).emit("typing");
  });
  socket.on("stop typing", (roomID) => {
    socket.in(roomID).emit("stop typing");
  });

  //Create a socket to create a new message from the new message sent from the front-end
  socket.on("new message", (newMessage) => {
    //Get the chat where the newMessage belongs to
    var chat = newMessage.chat;

    //Check to see if the 'chat' doesn't have any users
    if (!chat.users) return console.log('"chat.users" is not defined');

    //The newMessage will be emitted to all of the users in the chat except for the sender of that message
    chat.users.forEach((user) => {
      //Check to see if the user is the sender of the newMessage
      //If the user is the sender, the function returns and doesn't emit the message to the sender.
      if (user._id === newMessage.sender._id) return;

      //Otherwise, send the newMessage to the other users
      socket.in(user._id).emit("message recieved", newMessage); //This ensures that the event is only sent to sockets that are in the same chat room as the user.
    });
  });

  /**
   In Socket.io, the emit() method is used to send an event from the server to the connected clients.
   The emit() method takes two arguments: the name of the event and the data to be sent.
   */

  //Disconnect the socket, otherwise it will consume a lot of bandwidth
  socket.off("setup", () => {
    console.log("User disconnected");
    socket.leave(user._id);
  });
});
