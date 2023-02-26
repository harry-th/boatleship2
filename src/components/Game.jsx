import { useState } from 'react';
import styles from '../styles/Game.module.scss';
import Board from './Board.jsx';

const Game = ({ a }) => {

  return (
    <div className={styles.gamecontainer}>
      <div className={styles.boardcontainer}>
        <Board />
        <Board />
      </div>
      <div className={styles.gamemenu}>
        Messages,
        Actions
      </div>
    </div>
  );
};

export default Game;
