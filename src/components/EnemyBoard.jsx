import React from 'react'
import styles from '../styles/Board.module.css'


const Board = ({ socket, cookies, enemyBoardState,
    gameProgress, turn, setTurn, character, boardState, setEnemyBoardState, setBoardState,
    shootLine, enemyInfo, bluffing, timer }) => {

    const handleClick = (index, modifier) => {
        if (turn && enemyInfo?.status !== 'disconnected') {
            index = !Array.isArray(index) ? [index] : index
            socket.current.send(JSON.stringify({ id: cookies.get('user').id, shot: true, index, ...modifier }))
        }
    }

    let element = (index) => {
        let boardClass = enemyBoardState
        let condition = gameProgress === 'ongoing' ? true : false
        let interactivity = condition ? 'active' : 'inactive'
        return <div key={index}
            onClick={() => {
                if (enemyBoardState[index].state === 'protected' || enemyBoardState[index].state === 'missed') return
                character === 'cornerman' ?
                    handleClick(index, { cornershot: true })
                    :
                    character === 'lineman' ?
                        shootLine(
                            {
                                index
                                , boardState
                                , setBoardState
                                , enemyBoardState
                                , setEnemyBoardState
                                , socket
                                , cookies
                                , handleClick
                            })
                        : character === 'orangeman' ?
                            handleClick(index, { orange: true, bluffing })
                            :
                            handleClick(index)
            }}
            //   onMouseEnter={() =>
            //     boardHover(index, gameProgress, hoverState, boatrules.currentBoat.length, orientation, setHoverState)
            //   }
            className={[styles.square, styles[interactivity],
            boardClass && styles[(boardClass)[index].state],
            boardClass && styles[(boardClass)[index].hover],
                //   (player && gameProgress === 'placement') && styles[(hoverState)[index].hover]
            ].join(' ')
            }>
            {index}
        </div >
    }

    return (
        <div className={styles.boardbox}>

            <p>{enemyInfo?.name} {enemyInfo?.status === 'disconnected' && <span>has disconnected!</span>} {timer.timer2}</p>
            <div className={styles.board}>
                {[...Array(100)].map((e, i) => <>{element(i)}</>)}
            </div>
        </div>
    );
}

export default Board;
