import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import ClientSocket from './ClientSocket.js';

// cookies API
const cookieOpts = {
  sameSite: 'none',
  secure: false
};
const cookies = new Cookies();

// global client websocket
let socket = null;
export const client = socket;

// add client event listener on component
export const useListener = (type, listener) => {
  useEffect(() => {
    socket.addEventListener(type, listener);
    return () => {
      socket.removeEventListener(type, listener);
    };
    // eslint-disable-next-line
  }, []);
};

// use global client hook
export const useClient = (url, protocols) => {
  const [ready, setReady] = useState(false);

  if (!socket) {
    socket = new ClientSocket(url, protocols);
  }

  useListener('playerID', (e) => {
    cookies.set('playerID', e.detail, cookieOpts);
    setReady(true);
  });

  return {
    ready,
    reset: () => {
      cookies.remove('playerID', cookieOpts);
      socket.close();
      setReady(false);
    },
  };
};
