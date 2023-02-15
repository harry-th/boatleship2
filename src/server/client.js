import Cookies from 'universal-cookie';


// default cookie attributes
const cookieOpts = {
  sameSite: 'none',
  secure: false
};

// reconnecting WebSocket connection
class ClientSocket extends EventTarget {
  constructor() {
    super();
    this._socket = null;
    this._cookies = new Cookies();
  }

  send(data) {
    this._socket.send(data);
  }

  close() {
    this._socket.close();
  }

  reset() {
    this._cookies.remove('sessionID', cookieOpts);
    this._socket.close();
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

    // message dispatch + session cookie
    this._socket.addEventListener('message', (e) => {
      // holdover
      const message = new MessageEvent('message', { data: e.data });
      this.dispatchEvent(message);

      // custom events
      const data = JSON.parse(e.data);
      Object.entries(data).forEach(([type, detail]) => {
        const custom = new CustomEvent(type, { detail });
        this.dispatchEvent(custom);
      });
    });

    // handle session ID cookies
    this.addEventListener('sessionID', (e) => {
      this._cookies.set('sessionID', e.detail, cookieOpts);
    });
  }
}

export const client = new ClientSocket();
