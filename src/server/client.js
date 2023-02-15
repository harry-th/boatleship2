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
      const copy = new CloseEvent('close', { code: e.code });
      this.dispatchEvent(copy);

      this.connect(url, protocols);
    });

    // close on error
    this._socket.addEventListener('error', (e) => {
      const copy = new ErrorEvent('error', { message: e.message });
      this.dispatchEvent(copy);

      this._socket.close();
    });

    // message dispatch + session cookie
    this._socket.addEventListener('message', (e) => {
      // generic message event holdover
      const copy = new MessageEvent('message', { data: e.data });
      this.dispatchEvent(copy);

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
