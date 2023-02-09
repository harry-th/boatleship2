import { useEffect, useState } from 'react';

import './App.css';
import cookies from './helpers/cookies.js';
// import Board from './components/Board'
// import EnemyBoard from './components/EnemyBoard'
// import generateBoard from './helpers/generateBoard';
// import Customization from './components/Customization.js';
// import Endofgame from './components/Endofgame';
// import styles from './styles/App.module.css'
// import Dashboard from './components/Dashboard';
// import useOrangeMan from './characters/useOrangeMan';
// import useLineMan from './characters/useLineMan';
// import fromYou from './messagelisteners/fromYou';
// import fromEnemy from './messagelisteners/fromEnemy';
// import useTimer from './hooks/timer';


// cookies.remove('sessionID')


// create reconnecting websocket connection
let socket;
(function reconnect() {
  socket = new WebSocket('ws://localhost:8080/ws');

  socket.addEventListener('close', (e) => {
    reconnect();
  });

  socket.addEventListener('error', (e) => {
    socket.close();
  });

  socket.addEventListener('message', (e) => {
    const message = JSON.parse(e.data);
    Object.entries(message).forEach(([type, detail]) => {
      const event = new CustomEvent(type, { detail });
      socket.dispatchEvent(event);
    });
  });

  socket.addEventListener('sessionID', (e) => {
    cookies.add('sessionID', e.detail);
  });
})();

// custom hook that asynchronizes state. Uses the top-level websocket
// see: https://beta.reactjs.org/learn/queueing-a-series-of-state-updates
const useListener = (type, initialState) => {
  const [state, setState] = useState(initialState);

  // send data
  const sendState = (value) => {
    setState(value);
    socket.send(JSON.stringify({ value }));
  }

  // receive data
  useEffect(() => {
    const listener = (e) => {
      setState(e.detail);
    };
    socket.addEventListener(type, listener);
    return () => {
      socket.removeEventListener(type, listener)
    }
  }, [type]);

  return [state, sendState];
};

function App() {
  // declare user info (shared across components)
  const [name, setName] = useListener('name', null);


  // useEffect(() => {
  //   const messageListener = (e) => {
  //     const data = JSON.parse(e.data);



  //   };
  //   socket.addEventListener('message', messageListener);
  //   return () => {
  //     socket.removeEventListener('message', messageListener);
  //   };
  // }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(e.target[0].value);
    setName(e.target[0].value);
  }

  return (
    <div>
      <div>{name}</div>
      <form onSubmit={handleSubmit}>
        <input type="text" id="name" />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default App;