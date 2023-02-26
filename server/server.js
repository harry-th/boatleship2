import { WebSocketServer } from 'ws';
import Cookies from 'universal-cookie';
import * as uuid from 'uuid';

const wss = new WebSocketServer({ port: 8080 });

const players = {}

// server startup
wss.on('listening', () => {
  const { address, port } = wss.address()
  console.log(`server listening on ${address}:${port}`)
});

// new connection
wss.on('connection', (ws, req) => {
  const cookies = new Cookies(req.headers.cookie);
  let playerID = cookies?.get('playerID');

  // send WebSocket messages by type
  ws.sendData = ws.send;
  ws.send = (data) => ws.sendData(JSON.stringify(data));

  // dispatch WebSocket messages by type
  ws.on('message', (message) => {
    Object.entries(JSON.parse(message)).forEach(([type, data]) => {
      ws.emit(type, data);
    });
  });
  
  // create new playerID
  if (!players[playerID]) {
    do { playerID = uuid.v4() } while (players.hasOwnProperty(playerID));
    ws.send({ playerID });
  }
  
  // send player state
  console.log('connection:', playerID);
  ws.send({ playerID });
  
  // if in game...


  // handle disconnect
  ws.on('close', (code, reason) => {
  
  });



});
