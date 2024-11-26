const express = require('express');
const { Server } = require('socket.io');  // Correctly import Server from socket.io
const http = require('http');

const {addUser,removeUser, getUser, getUsersInRoom} = require('./users.js');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const cors=require('cors');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server with CORS options
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  // Allow client origin
    methods: ["GET", "POST"],
    credentials: true,                // Allow cookies if needed
  },
});

app.use(cors);
app.use(router);


// Set up Socket.IO connection handling
io.on('connection', (socket) => {
  socket.on('join',({name,room},callback)=>{

    const {error,user}=addUser({id:socket.id,name,room});

    if(error) return callback(error);

    socket.join(user.room);

    socket.emit('message',{user:'admin',text:`${user.name},welcome to the room ${user.room}`});
    socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name} has joined!`})

    io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})

    callback();
    
  });

  console.log('client connected',socket.id);

  socket.on("drawing", ({ x0, y0, x1, y1, color, brushWidth, room }) => {
    socket.to(room).emit("drawing-data", { x0, y0, x1, y1, color, brushWidth });
  });

  socket.on("clear-canvas", (room) => {
    socket.to(room).emit("clear-canvas");
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    if (user && user.room) {
        io.to(user.room).emit('message', { user: user.name, text: message });

        callback();
    } else {
        console.error(`User not found for socket ID: ${socket.id}`);
        callback('User not found');
    }
});


socket.on('disconnect', () => {

  console.log('client disconnected');

  const user = removeUser(socket.id);

  if(user) {
    io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
    // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
  }
})
});

// Start the server
server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
