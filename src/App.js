import { useEffect, useState } from "react";
// import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";

import "./App.css";
import { client, useClient } from "./server/client.js"
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

// initialize client WebSocket connection
client.connect('ws://localhost:8080/ws');

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

function App() {
  // const [orientation, setOrientation] = useState('orientation', 'v');

  const {page, setPage} = useClient('page', 'disconnected');
  const {character, setCharacter} = useClient('character', null);

  const {player, setPlayer} = useClient('player', playerInit);


  const removeCookie = () => {
    client.reset();
    setPage('disconnected');
  };

  return (
    <div className={styles.app}>
      <button onClick={removeCookie}>remove cookie</button>
      <div className={styles.title}>WELCOME TO BATTLESHIP</div>

      <div className={styles.boardcontainer}>
        {page === 'disconnected' ?
          <>waiting to connect</>
        : page === 'menu' ?
          <Customization player={player} setPlayer={setPlayer}/>
        : page === 'placement' || page === 'ongoing' ?
          <>
            page === 'placement' && <OrientationButton />
            Game!
          </>
        :
          <>
            Nada
          </>
        }
      </div>
    </div>
  );
}

export default App;