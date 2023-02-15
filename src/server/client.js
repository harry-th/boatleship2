// Reconnecting WebSocket connection
class ClientSocket extends EventTarget {
  constructor() {
    super();
    this._socket = null;
  }

  connect(url, protocols) {
    this._socket = new WebSocket(url, protocols);

    // reconnect on close
    this._socket.addEventListener('close', (e) => {
      this.connect(url, protocols);
    });

    // close on error
    this._socket.addEventListener('error', (e) => {
      this._socket.close();
    });
  }
}

export const socket = new ClientSocket();
