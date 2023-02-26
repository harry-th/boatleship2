import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import styles from './styles/App.module.scss';
import Game from './components/Game.jsx';
import Menu from './components/Menu.jsx';
import { useClient } from './client/client.js';


function App() {
  const client = useClient('ws://localhost:8080/ws');

  const playerInfo = useState({
    name: 'noName',
    boatNames: ['destroyer', 'cruiser', 'battleship', 'carrier'],
    wins: 0,
    losses: 0
  });

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <Link to='/'>WELCOME TO BOATLESHIP</Link>
      </div>

      <div className={styles.pagecontent}>
        <Routes>
          <Route index element={<Menu />} />
          {/* <Route path='/current' element={<CurrentGames />} />
          <Route path='/finished' element={<FinishedGames />} />
          <Route path='/open' element={<OpenGames />} /> */}
          <Route path='/play' element={<Game client={client} playerInfo={playerInfo} />} />
        </Routes>
      </div>

      <div className={styles.footer}>
        wow
      </div>
    </div>
  );
}

export default App;
