/**
 * Client WebSocket connection.
 * 
 * Allow custom event listeners to be added to the client WebSocket, allowing
 * us to move state into respective components rather than requiring all
 * state modified by server messages to be at the App level.
*/

class Client extends EventEmitter {
  constructor(url, protocols) {
    this.url = url;
    this.protocols = protocols;
    this.socket = null;
    this.reconnect();
  }

  // send a message to the server
  send(type, data) {
    this.socket.send(JSON.stringify({ type, data }));
  }

  // close the underlying websocket
  close() {
    this.socket.close();
  }

  // create a new websocket connection
  reconnect() {
    this.socket = new WebSocket(this.url, this.protocols);

    // generic open
    this.socket.addEventListener('open', (e) => {
      console.log('Client socket open');
      this.emit('open', null);
    });

    // message dispatch handler
    this.socket.addEventListener('message', (e) => {
      const { type, data } = JSON.parse(e.data);
      this.emit('message', { type, data });  // dispatch to message handlers
      this.emit(type, data);
    });

    // attempt reconnect after 1s
    this.socket.addEventListener('close', (e) => {
      console.log('Client socket closed: ', e.code);
      this.emit('close', e.code);
      this.reconnect();  // called when failed connection closes on error
    });

    // on error, close
    this.socket.addEventListener('error', (e) => {
      console.log('Client socket error. Closing...');
      this.emit('error', null);
      this.socket.close();
    });
  }
}

export default Client;