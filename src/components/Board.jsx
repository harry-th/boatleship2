import React from 'react'
import styles from '../styles/Board.module.css'
import boardHover from '../helpers/boardHover'
import generateBoard from '../helpers/generateBoard'
import { useState } from 'react'
import useBoatrules from '../hooks/boatrules'
import usePlacementLogic from '../hooks/usePlacement'
import useCornerMan from '../characters/useCornerMan'

const Board = ({ player, socket, cookies, boardState, setBoardState,
  orientation, gameProgress, turn, setTurn, boatNames, character, timer }) => {


  const [hoverState, setHoverState] = useState(generateBoard(true, true, 100))
  const [boatPlacements, setBoatPlacements] = useState([])
  const boatrules = useBoatrules({ names: boatNames, setBoatPlacements, setBoardState })


  const placement = usePlacementLogic({ socket, orientation, cookies, character, boardState, boatrules, setBoardState, boatPlacements, setBoatPlacements })

  const { cornerPlacement, cornerHover } = useCornerMan({ socket, cookies, orientation, boardState, setBoardState, boatNames, boatrules, boatPlacements, setBoatPlacements })

  const handleClick = (index) => {
    if (gameProgress === 'placement') {
      placement(index)
    }
  }



  let element = (index) => {
    let boardClass = boardState
    let condition = gameProgress === 'placement' && !boatrules.current.done ? true : false
    let interactivity = condition ? 'active' : 'inactive'
    return <div key={index}
      onClick={() => {
        character === 'cornerman' ?
          cornerPlacement(index)
          :
          handleClick(index)
      }}
      onMouseEnter={() =>
        character === 'cornerman' ?
          cornerHover({ index, gameProgress, boardState, boatLength: boatrules.currentBoat.length, orientation, hoverState, setHoverState, })
          : boardHover(index, gameProgress, hoverState, boatrules.currentBoat.length, orientation, setHoverState)
      }
      className={[styles.square, styles[interactivity],
      boardClass && styles[(boardClass)[index].state],
      boardClass && styles[(boardClass)[index].hover],
      (player && gameProgress === 'placement') && styles[(hoverState)[index].hover]
      ].join(' ')
      }>
      {index}
    </div >
  }

  return (
    <div className={styles.boardbox}>
      <p>

        {cookies.get('user').name} {timer.timer1} {gameProgress === 'placement' && <span>
          {!boatrules.current.done ? <span>placed {boatrules.current.num}/4</span> : 'boats placed!'} <button onClick={
            boatrules.current.undo
          }>undo boat placement</button>
        </span>}
      </p>
      <div className={styles.board}>
        {[...Array(100)].map((e, i) => <>{element(i)}</>)}
      </div>
    </div>
  );
}

export default Board;
