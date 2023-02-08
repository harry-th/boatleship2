import { EventEmitter } from 'node:events';

class Client extends EventEmitter {
  constructor(url, protocols) {
    super();
    this._url = url;
    this._protocols = protocols;
    this._socket = null;
    this.reconnect();
  }

  send(type, data) {
    this._socket.send(JSON.stringify({ type, data }));
  }

  close() {
    this._socket.close();
  }

  reconnect() {
    this._socket = new WebSocket(this._url, this._protocols);
    
    // on close, reconnect socket
    this._socket.addEventListener('close', (e) => {
      this.reconnect();
    });
    
    // on error, close socket
    this._socket.addEventListener('error', (e) => {
      this._socket.close();
    });

    // dispatch messages by type
    this._socket.addEventListener('message', (e) => {
      const { type, data } = JSON.parse(e.data);
      this.emit(type, data);
    })
  }
}

export default Client;