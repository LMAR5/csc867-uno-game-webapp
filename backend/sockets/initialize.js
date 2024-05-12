import { Server } from "socket.io";

const bindToSession = (socket) => {
  const { request } = socket;

  socket.join(request.session.id);

    // Users join the lobby by default upon connection
    socket.join('lobby');

    socket.use((_, next) => {
      request.session.reload((error) => {
        if (error) {
          socket.disconnect();
        } else {
          next();
        }
      });
    });
  
    // Users can join specific game rooms and should leave the lobby
socket.on('join_game', (roomId) => {
    if (isValidRoom(roomId)) {  // Ensure it is a valid game room
      socket.leave('lobby');
      socket.join(roomId);
      console.log(`User ${socket.request.session.id} joined room ${roomId}`);
      // Event to the client
      socket.emit('joined_game', roomId);
    } else {
      console.log(`Invalid room attempt by ${socket.request.session.id}`);
    }
  });
  
  // Users can leave game rooms and join the lobby
  socket.on('leave_game', (roomId) => {
    if (isValidRoom(roomId)) {  // Ensure it is a valid game room
      socket.leave(roomId);
      socket.join('lobby');
      console.log(`User ${socket.request.session.id} left room ${roomId} and joined the lobby`);
      // Same thing here
      socket.emit('left_game', 'lobby');
    }
  });

    // Send the message only to the users in the same room as the sender
    socket.on('chat_message', (message, roomId) => {
        socket.to(roomId).emit('chat_message', message);
      });
};
export default function initialize(server) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    bindToSession(socket);

    console.log(`a user connected with session id ${socket.request.session.id}`);

    socket.on("disconnect", () => {
      console.log(`user disconnected with session id ${socket.request.session.id}`);
    });
  });

  return io;
}

