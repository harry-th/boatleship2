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
// warning: unable to handle an updater function
const useClient = (type, initialState) => {
  const [state, setState] = useState(initialState);

  // send data
  const sendState = (value) => {
    setState(value);
    socket.send(JSON.stringify({ [type]: value }));
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


// agnostic initial game state
const initState = {
  name: '',
  boatNames: ['destroyer', 'cruiser', 'battleship', 'carrier'],
  wins: 0,
  losses: 0
};


function App() {
  // declare user info (shared across components)
  const [name, setName] = useClient('name', initState.name);
  const [boatNames, setBoatNames] = useClient('boatNames', initState.boatNames);
  const [wins, setWins] = useClient('wins', initState.wins);
  const [losses, setLosses] = useClient('wins', initState.losses);


  const handleSubmit = (e) => {
    e.preventDefault();
    const elems = e.target.elements;

    if (elems.name.value) {
      setName(elems.name.value);
    }
    setBoatNames(Array.from(elems.boatName).map((elem) => elem.value));
  }

  return (
    <div>
      <div>{name} --- {wins}/{losses}</div>
      <form onSubmit={handleSubmit}>
        <label htmlFor='name'>Name</label>
        <input type='text' name='name' defaultValue={name} />
        {boatNames.map((boatName, i) => {
          return (
            <div key={i}>
              <label htmlFor='boatName'>{boatNames[i]}</label>
              <input type='text' name='boatName' defaultValue={boatName} />
            </div>
          );
        })}
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default App;