import { Server } from "socket.io";

const bindToSession = (socket) => {
  const { request } = socket;

  socket.join(request.session.id);

  socket.use((_, next) => {
    request.session.reload((error) => {
      if (error) {
        socket.disconnect();
      } else {
        next();
      }
    });
  });
};

export default function initialize(server) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    bindToSession(socket);

    // Make the backend connect to the game and user Socket (both are named "id" at the frontend)
    if(socket.handshake.query !== undefined){      
      socket.join(socket.handshake.query.id);
    }

    console.log(`a user connected with session id ${socket.request.session.id}`);

    socket.on("disconnect", () => {
      console.log(`user disconnected with session id ${socket.request.session.id}`);
    });
  });

  return io;
}
