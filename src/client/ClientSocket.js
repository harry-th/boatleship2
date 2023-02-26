


class ClientSocket extends EventTarget {
  constructor(url, protocols) {
    super();
    this.url = url;
    this.protocols = protocols;
    this.socket = null;
    this.connect();
  }
  
  send(data) {
    this.socket.send(JSON.stringify(data));
  }

  close() {
    this.socket.close();
  }

  connect() {
    this.socket = new WebSocket(this.url, this.protocols);
  
    // reconnect on close
    this.socket.addEventListener('close', (e) => this.connect());
  
    // message dispatch
    this.socket.addEventListener('message', (e) => {
      Object.entries(JSON.parse(e.data)).forEach(([type, detail]) => {
        const custom = new CustomEvent(type, { detail });
        this.dispatchEvent(custom);
      });
    });
  }
}

export default ClientSocket;
