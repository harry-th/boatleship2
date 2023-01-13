import useBoatrules from "../hooks/boatrules"
import usePlacementLogic from "../hooks/usePlacement"

let useCornerMan = ({ socket, orientation, boardState, setBoardState, }) => {
    const rules = ({ positions, targets }) => {
        if (positions.some((pos) => targets.includes(pos))) return true
        for (let i = 0; i < positions.length; i++) {
            if (positions[i] > 99) positions[i] = positions[i] - 100
        }
    }
    const boatrules = useBoatrules()
    // needs to figure out how to maniulate positions in placement in a modular manner
    const placement = usePlacementLogic(socket, orientation, boardState, boatrules, setBoardState, rules)


    const cornerHover = (index, gameProgress, boardState, boats, orientation, setBoardState) => {
        if (gameProgress === 'placement' && boardState) {
            let coords = []
            for (let i = 0; i < boats[0]; i++) {
                coords.push(orientation === 'h' ? index + i : index + i * 10)
            }
            for (let i = 0; i < coords.length; i++) {
                if (coords[i] > 99) coords[i] = coords[i] - 99
            }
            let newBoardState = { ...boardState }
            for (let i = 0; i < coords.length; i++) {
                if (boardState[coords[i]]?.state === 'mine') return
            }

            for (const square in newBoardState) {
                if (coords.includes(Number(square))) {
                    newBoardState[square].hover = 'hover'
                } else if (newBoardState[square].hover === 'hover') {
                    newBoardState[square].hover = false
                }
            }
            setBoardState(newBoardState)
        }
    }

    const checkHit = (index) => {
        if (gameProgress === 'placement') {
            placement(index)
        } else if (turn) {

        }
    }
    const cornerSquare = (index) => {
        let boardClass = player === 'player' ? boardState : enemyBoardState
        let condition = player === 'ai' && gameProgress === 'ongoing' ? true : player === 'player' && gameProgress === 'placement' && boats.length ?
            true : false
        let interactivity = condition ? 'active' : 'inactive'
        return <div key={index}
            onClick={() => {
                // if ((boardClass[index].state === null || boardClass[index].state === 'selectable') && socket.readyState === 1) checkHit(index)
            }}
            onMouseEnter={() =>
                cornerHover(index, gameProgress, hoverState, boats, orientation, setHoverState)
            }
            className={[styles.square, styles[interactivity],
            boardClass && styles[(boardClass)[index].state],
            boardClass && styles[(boardClass)[index].hover],
                // (player === 'player' && gameProgress === 'placement') && styles[(hoverState)[index].hover]
            ].join(' ')
            }>
            {index}
        </div >
    }






    return {
        // cornerManPlacement,
        // cornerShot,
        // cornerHover
    }
}

export default useCornerMan




