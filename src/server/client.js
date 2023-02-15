import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';


// default cookie attributes
const cookieOpts = {
  sameSite: 'none',
  secure: false
};

// create EventTarget wrapper over socket to create a reconnecting WebSocket
// connection that maintains event listeners
class Client extends EventTarget {
  constructor() {
    super();
    this._socket = null;
    this._cookies = new Cookies();
  }

  // send data object as string
  send(data) {
    this._socket.send(JSON.stringify(data));
  }

  // close underlying socket
  close() {
    this._socket.close();
  }

  // clear cookies and close connection
  reset() {
    Cookies.remove('sessionID', cookieOpts);
    this._socket.close();
  }

  // create a reconnecting WebSocket connection
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
  
    // dispatch messages by property
    this._socket.addEventListener('message', (e) => {
      const message = JSON.parse(e.data);
  
      Object.entries(message).forEach(([type, detail]) => {
        const event = new CustomEvent(type, { detail });
        this.dispatchEvent(event);
      });
    });

    // add client session cookies
    this.addEventListener('sessionID', (e) => {
      Cookies.set('sessionID', e.detail, cookieOpts);
    });
  }
}

// global client websocket
export const client = new Client();

// custom hook wrapping useState with socket sending on update.
// NOTE: Updater functions cannot be used. 
export function useClient(type, initialState) {
  const [state, setState] = useState(initialState);

  // set/send state
  const sendState = (value) => {
    if (typeof value === 'function') {
      throw new Error('Cannot use updater function in useClient action.');
    }
    setState(value);
    client.send({ [type]: value });
  }

  // receive/set state
  useEffect(() => {
    const listener = (e) => {
      setState(e.detail);
    };
    client.addEventListener(type, listener);
    return () => {
      client.removeEventListener(type, listener)
    }
  }, [type]);

  // create state/setState variables
  const set = 'set' + type.charAt(0).toUpperCase() + type.slice(1);
  return {
    [type]: state,
    [set]: sendState
  };
}
