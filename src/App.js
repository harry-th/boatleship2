// import { useEffect, useState } from "react";

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


// initialize client WebSocket connection
client.connect('ws://localhost:8080/ws');

function App() {
  const {page, setPage} = useClient('page', 'disconnected');
  // const {character, setCharacter} = useClient('character', null);

  const {userInfo, setUserInfo} = useClient('userInfo', null);


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
          <Customization userInfo={userInfo} setUserInfo={setUserInfo}/>
        : page === 'placement' || page === 'ongoing' ?
          <>
            {'<Board />'}
          </>
        :
          <>
            {'<Nada />'}
          </>
        }
      </div>
    </div>
  );
}

export default App;