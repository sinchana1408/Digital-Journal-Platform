import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { initSocketServer } from './sockets/socket.manager';
import { checkDatabaseConnection, prisma } from './config/prisma';

async function bootstrap() {
  const app = createApp();
  const httpServer = http.createServer(app);

  // Initialize WebSockets
  initSocketServer(httpServer, config.clientUrl);

  // Check PostgreSQL connection
  await checkDatabaseConnection();

  httpServer.listen(config.port, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   LUMAJOURNAL API SERVER                       ║
╠════════════════════════════════════════════════════════════════╣
║  🚀 API Server running on: http://localhost:${config.port}/api          ║
║  🌐 Web Client allowed at: ${config.clientUrl}              ║
║  ⚡ Real-Time Socket.IO:   Ready                               ║
║  🔒 Auth & JWT Security:   Enabled                             ║
╚════════════════════════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  const handleExit = async () => {
    console.log('Stopping server gracefully...');
    await prisma.$disconnect();
    httpServer.close(() => {
      console.log('Server stopped.');
      process.exit(0);
    });
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
