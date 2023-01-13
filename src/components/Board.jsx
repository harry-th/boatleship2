import React from 'react'
import styles from '../styles/Board.module.css'
import boardHover from '../helpers/boardHover'
import placementLogic from '../helpers/placementLogic'
import generateBoard from '../helpers/generateBoard'
import { useState } from 'react'
import useBoatrules from '../hooks/boatrules'
import usePlacementLogic from '../hooks/usePlacement'
const Board = ({ player, socket, cookies, boardState, setBoardState, enemyBoardState, setEnemyBoardState,
  targets, setTargets, enemyTargets, setEnemyTargets, orientation, boatPlacements,
  setBoatPlacements, boats, setBoats, setEnemyBoatPlacement, enemyBoatPlacements, enemyBoats,
  gameProgress, setGameProgress, turn, setTurn, vsAi, boatNames, setBoatNames, enemyName, setCookie,
  character, orangeShot, selecting, setSelecting, turnNumber, setTurnNumber,
  turnTime, dataSent, setCharges, freeShotMiss, setFreeShotMiss, setMessages, enemyTurnTime }) => {
  const boatrules = useBoatrules()

  const [hoverState, setHoverState] = useState(generateBoard(true, true))
  const placement = usePlacementLogic({ socket, orientation, cookies, boardState, boatrules, setBoardState })

  const checkHit = (index) => {
    if (gameProgress === 'placement') {
      placement(index)
    } else if (turn) {
      console.log(socket)

      socket.current.send(JSON.stringify({ id: cookies.user.id, shot: true, index }))
    }
  }



  let element = (index) => {
    let boardClass = player ? boardState : enemyBoardState
    let condition = !player && gameProgress === 'ongoing' ? true : player && gameProgress === 'placement' && boats.length ?
      true : false
    let interactivity = condition ? 'active' : 'inactive'
    return <div key={index}
      onClick={() => {
        checkHit(index)
      }}
      onMouseEnter={() =>
        boardHover(index, gameProgress, hoverState, boatrules.currentBoat.length, orientation, setHoverState)
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
    <div>
      <div className={styles.board}>
        {[...Array(100)].map((e, i) => <>{element(i)}</>)}
      </div>
    </div>
  );
}

export default Board;
