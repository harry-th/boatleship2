import { useState } from 'react';
import styles from '../styles/Board.module.scss';
import useCharacter from '../characters/useCharacter.js';
import { useListener } from '../client/client.js';

// const Square = () => {
//   const [state, setState] = useState(null);
//   const [hover, setHover] = useState(false);

//   return (
//     <></>
//   );
// };

const Board = ({ character }) => {
  // { player, socket, cookies, boardState, setBoardState,
  // orientation, gameProgress, turn, setTurn, boatNames, character, timer }

  // const { onClick, onMouseEnter } = useCharacter(character);


  const [board, setBoard] = useState(Array(100).fill({
    state: null,
    hover: false
  }));

  useListener('board', () => {

  });

  return (
    <div className={styles.board}>
      {board.map((square, i) => (
        <div key={i} className={styles.square}>{i}</div>
      ))}
    </div>
  );
};

export default Board;
