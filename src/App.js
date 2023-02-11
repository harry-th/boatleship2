import { useEffect, useState } from "react";
// import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";

import "./App.css";
import cookies from "./helpers/cookies.js";
import styles from "./styles/App.module.css"

import Customization from "./components/Customization.jsx";
import OrientationButton from "./components/OrientationButton.jsx";
// import Board from "./components/Board"
// import EnemyBoard from "./components/EnemyBoard"
// import generateBoard from "./helpers/generateBoard";
// import Customization from "./components/Customization.js";
// import Endofgame from "./components/Endofgame";
// import Dashboard from "./components/Dashboard";
// import useOrangeMan from "./characters/useOrangeMan";
// import useLineMan from "./characters/useLineMan";
// import fromYou from "./messagelisteners/fromYou";
// import fromEnemy from "./messagelisteners/fromEnemy";
// import useTimer from "./hooks/timer";


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

// custom hook wrapping useState with socket sending on update.
// NOTE: Updater functions cannot be used. 
const useSyncState = (type, initialState) => {
  const [state, setState] = useState(initialState);

  const sendState = (value) => {
    if (typeof value === 'function') {
      throw new Error('Cannot use updater function in useClient action.');
    }
    setState(value);
    socket.send(JSON.stringify({ [type]: value }));
  }

  useEffect(() => {
    const listener = (e) => {
      setState(e.detail);
    };
    socket.addEventListener(type, listener);
    return () => {
      socket.removeEventListener(type, listener)
    }
  }, [type]);

  // create state/setState variables
  const set = 'set' + type.charAt(0).toUpperCase() + type.slice(1);
  return {
    [type]: state,
    [set]: sendState
  };
};


// initial player info state
const playerInit = {
  name: 'noName',
  boatNames: ['destroyer', 'cruiser', 'battleship', 'carrier'],
  wins: 0,
  losses: 0
};

// TODO: make logic that overlaps
//     client can use to render
//     server can use to verify
//     create character modules which include hooks and server functions
//     closely matching, using helper functions to render/verify somehow 

setInterval(() => {
  console.log(typeof socket);
}, 1000);


function App() {
  // const [orientation, setOrientation] = useState('orientation', 'v');

  const {gameProgress, setGameProgress} = useSyncState('gameProgress', 'preplacement');


  const {character, setCharacter} = useSyncState('character', null);


  const player = {
    ...useSyncState('name', playerInit.name),
    ...useSyncState('boatNames', playerInit.boatNames),
    ...useSyncState('wins', playerInit.wins),
    ...useSyncState('losses', playerInit.losses)
  };


  const removeCookie = () => {
    cookies.remove('sessionID');
    setGameProgress('preplacement');
  };


  const page = () => {
    if (gameProgress === 'preplacement') {
      console.log('thing');
      return (
        <Customization
          useSyncState={useSyncState}
          gameProgress={gameProgress}
          setGameProgress={setGameProgress}
          {...player}
        />
      );
    }
    else if (gameProgress === 'placement' || gameProgress === 'ongoing')
    {
      return (
        <>
          {gameProgress === 'placement' && <OrientationButton />}

        </>

      );
    }


  }


  return (
    <div className={styles.app}>
      <button onClick={removeCookie}>remove cookie</button>
      <div className={styles.title}>WELCOME TO BATTLESHIP</div>

      <div className={styles.boardcontainer}>
        {page()}
      </div>
    </div>
  );
}

export default App;