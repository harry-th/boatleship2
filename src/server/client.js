/**
 * Client WebSocket connection.
 * 
 * Allow custom event listeners to be added to the client WebSocket, allowing
 * us to move state into respective components rather than requiring all
 * state modified by server messages to be at the App level.
*/

function Client(url, protocols) {
  this.socket = null;
  this.listeners = {};  // { type: [ listener, ... ] }

  // send a message to the server
  this.send = (type, data) => {
    this.socket.send(JSON.stringify({ type, data }));
  };

  // close the underlying websocket
  this.close = () => {
    this.socket.close();
  };

  // emit a message to relevant event listeners
  this.emit = (type, data) => {
    if (this.listeners[type]) {
      for (const listener of this.listeners[type]) {
        listener(data);
      }
    }
  };

  // add a unique event listener
  this.addListener = (type, listener) => {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    const arr = this.listeners[type];
    const i = arr.indexOf(listener);

    if (i === -1) {
      console.log('added', listener);
      arr.push(listener);
    }
  };

  // remove an event listener
  this.removeListener = (type, listener) => {
    const arr = this.listeners[type];
    const i = arr?.indexOf(listener);

    if (i !== undefined && i !== -1) {
      console.log('removed', listener);
      arr.splice(i, 1);
    }
  };

  // create a new websocket connection
  this.reconnect = () => {
    this.socket = new WebSocket(url, protocols);

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
  };

  this.reconnect();
};

export default Client;