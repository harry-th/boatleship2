import { useState } from "react"
import { socket } from './server/client';


const useLineMan = () => {
    const [lastShots, setLastShots] = useState([])
    const [selection, setSelection] = useState(null)
    const [selecting, setSelecting] = useState(sessionStorage.getItem('selecting') ? JSON.parse(sessionStorage.getItem('selecting')) : false)
    const [charges, setCharges] = useState(4)



    const shootLine = (
        { index
            , boardState
            , enemyBoardState
            , setBoardState
            , setEnemyBoardState
            , freeShotMiss
            , handleClick }
    ) => {
        if (!selecting) {
            handleClick(index)
        } else {
            if (!selection && selection !== 0) {
                setSelection(index)
                setEnemyBoardState(prev => {
                    prev[index].hover = 'green'
                    return prev
                })
            }
            if (selection === index) {
                setSelection(null)
                setEnemyBoardState(prev => {
                    prev[index].hover = false
                    return prev
                })
                return
            }
            if (enemyBoardState[index].state !== 'selectable' && index) return
            //**here */
            if (selection || selection === 0) {
                let result = []
                const checkSquares = (i, result) => {
                    if (boardState[i].state === 'missed' || boardState[i].state === 'nope' || boardState[i].state === 'hit' || boardState[i].hover === 'protected') {
                        let lastState = boardState[i].state
                        setBoardState(prev => {
                            prev[i].state = 'nope'
                            return { ...prev }
                        })

                        if (lastState !== 'nope') setTimeout(() => setBoardState(prev => {
                            prev[i].state = lastState
                            delete prev[i].lastState
                            return { ...prev }
                        }), 400)
                        return true
                    } else if (enemyBoardState[i].state === 'selectable' || enemyBoardState[i].state === 'nope' || enemyBoardState[i].state === 'hit' || enemyBoardState[i].hover === 'protected') {

                        let lastState = enemyBoardState[i].state
                        setEnemyBoardState(prev => {
                            prev[i].state = 'nope'
                            return { ...prev }
                        })
                        if (lastState !== 'nope') setTimeout(() => setEnemyBoardState(prev => {
                            prev[i].state = lastState
                            delete prev[i].lastState
                            return { ...prev }
                        }), 400)
                        return true
                    } else {
                        result.push(i)
                    }
                }
                if ((Math.floor(selection / 10) === Math.floor(index / 10))) {
                    let start, end
                    if (selection > index) {
                        start = index
                        end = selection
                    } else {
                        start = selection
                        end = index
                    }
                    for (let i = start + 1; i < end; i++) {
                        if (checkSquares(i, result)) return
                    }
                } else if ((((selection % (Math.floor(selection / 10) * 10)) + 1 || selection + 1) === ((index % (Math.floor(index / 10) * 10)) + 1 || index + 1))) {
                    let start, end
                    if (selection > index) {
                        start = index
                        end = selection
                    } else {
                        start = selection
                        end = index
                    }
                    for (let i = start + 10; i < end; i += 10) {
                        if (checkSquares(i, result)) return
                    }
                } else {
                    return
                }
                setEnemyBoardState(prev => {
                    prev[selection].hover = false
                    return prev
                })
                setSelection(null)
                let newEnemyBoardState = { ...enemyBoardState }
                for (const square in enemyBoardState) {
                    if (enemyBoardState[square].state === 'selectable') newEnemyBoardState[square].state = 'missed'
                }
                setEnemyBoardState(newEnemyBoardState)
                setSelecting(false)
                if (result.length < 1) return
                handleClick(result, { shootline: true })
            }
        }
    }
    const LineManUI = ({ turn, enemyBoardState, setEnemyBoardState, cookies, setTurn }) => {
        return (
            <div


            >
                charges: {charges}
                <button
                    onClick={() => {
                        if (turn && !selecting && charges) {
                            socket.send(JSON.stringify({ shot: true, id: cookies.get('user').id, twoShot: true }))
                            setTurn(false)
                        }
                    }}
                    onMouseLeave={(e) => {
                        setEnemyBoardState(prev => {
                            if (Number(lastShots[0]) && prev[lastShots[0]].hover === 'twoShot') prev[lastShots[0]].hover = prev[lastShots[0]].last
                            if (Number(lastShots[1]) && prev[lastShots[1]].hover === 'twoShot') prev[lastShots[1]].hover = prev[lastShots[1]].last
                            return { ...prev }
                        })
                    }}
                    onMouseOver={(e) => {
                        if (turn) {
                            setEnemyBoardState(prev => {
                                let isNew = false
                                if (lastShots[0] && prev[lastShots[0]].hover !== 'twoShot') {
                                    prev[lastShots[0]].last = prev[lastShots[0]].hover
                                    prev[lastShots[0]].hover = 'twoShot'
                                    isNew = true
                                }
                                if (lastShots[1] && prev[lastShots[1]].hover !== 'twoShot') {
                                    prev[lastShots[1]].last = prev[lastShots[1]].hover
                                    prev[lastShots[1]].hover = 'twoShot'
                                    isNew = true
                                }
                                if (isNew) {
                                    return { ...prev }
                                } else {
                                    return prev
                                }
                            })
                        }
                    }}>
                    fireLastShots
                </button>
                <button onClick={() => {
                    if (turn && charges) {
                        let newEnemyBoardState = JSON.parse(JSON.stringify(enemyBoardState))
                        for (const square in enemyBoardState) {
                            if (enemyBoardState[square].state === 'missed') newEnemyBoardState[square].state = 'selectable'
                            else if (enemyBoardState[square].state === 'selectable') newEnemyBoardState[square].state = 'missed'
                        }
                        if (selection) newEnemyBoardState[selection].hover = false
                        setSelection(null)
                        setEnemyBoardState(newEnemyBoardState)
                        setSelecting(prev => {
                            return !prev
                        })
                    }
                }}>
                    makeLine
                </button>
            </div>
        )
    }
    return { lastShots, setLastShots, shootLine, setSelection, setCharges, selecting, setSelecting, LineManUI }
}

export default useLineMan