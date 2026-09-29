import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '@lumajournal/shared';
import { verifyToken } from '../utils/auth';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer, clientUrl: string): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  io.on('connection', (socket: Socket) => {
    // Authenticate socket via token handshake or join message
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    let userId: string | null = null;

    if (typeof token === 'string') {
      const payload = verifyToken(token);
      if (payload && payload.id) {
        userId = payload.id;
        socket.join(`user:${userId}`);
      }
    }

    socket.on(SOCKET_EVENTS.JOIN_USER, (clientUserId: string) => {
      if (clientUserId) {
        userId = clientUserId;
        socket.join(`user:${userId}`);
        socket.emit('session:status', { connected: true, userId });
      }
    });

    socket.on('disconnect', () => {
      // Handled cleanly
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitToUser(userId: string, event: string, payload: any): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
}
