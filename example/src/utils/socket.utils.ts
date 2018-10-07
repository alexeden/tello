import * as ws from 'ws';

export class SocketUtils {
  static createBroadcaster(server: ws.Server) {
    return <T>(data: T): T => {
      server.clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
          try {
            client.send(data);
          }
          catch (error) {
            console.error(`Failed to send to WSS client with url ${client.url}`, error);
          }
        }
      });
      return data;
    };
  }
}
