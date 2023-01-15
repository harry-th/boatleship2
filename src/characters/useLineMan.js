import { useState } from "react"

const useLineMan = () => {
    const [lastShots, setLastShots] = useState([])
    const [selection, setSelection] = useState(null)
    const [selecting, setSelecting] = useState(sessionStorage.getItem('selecting') ? JSON.parse(sessionStorage.getItem('selecting')) : false)
    const [charges, setCharges] = useState(sessionStorage.getItem('charges') ? JSON.parse(sessionStorage.getItem('charges')) : 4)



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
            if (!selection) {
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
            //**hhere */
            if (selection) {

                let result = []
                const checkSquares = (i, result) => {
                    if (boardState[i].state === 'missed' || boardState[i].state === 'hit' || boardState[i].hover === 'protected') {
                        let oldState = boardState[i].state
                        setBoardState(prev => {
                            prev[i].state = 'nope'
                            return { ...prev }
                        })

                        setTimeout(() => setBoardState(prev => {
                            prev[i].state = oldState
                            delete prev[i].oldState
                            return { ...prev }
                        }), 400)
                        return false
                    } else if (enemyBoardState[i].state === 'selectable' || enemyBoardState[i].state === 'hit' || enemyBoardState[i].hover === 'protected') {

                        let oldState = enemyBoardState[i].state
                        setEnemyBoardState(prev => {
                            prev[i].state = 'nope'
                            return prev
                        })
                        setTimeout(() => setEnemyBoardState(prev => {
                            prev[i].state = oldState
                            delete prev[i].oldState
                            return prev
                        }), 400)
                        return false
                    } else {
                        result.push(i)
                        return true
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
                        if (!checkSquares(i, result)) return
                    }
                } else if (((selection % (Math.floor(selection / 10) * 10)) || selection) === ((index % (Math.floor(index / 10) * 10)) || index)) {
                    let start, end
                    if (selection > index) {
                        start = index
                        end = selection
                    } else {
                        start = selection
                        end = index
                    }
                    for (let i = start + 10; i < end; i += 10) {
                        if (!checkSquares(i, result)) return
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
                setCharges(prev => prev - 1)
                setSelecting(false)
                handleClick(result)
            }
        }
    }
    const LineManUI = ({ turn, enemyBoardState, setEnemyBoardState, socket, cookies, setTurn }) => {
        return (
            <div onMouseLeave={
                (e) => {
                    e.stopPropagation()

                    setEnemyBoardState(prev => {
                        if (lastShots[0] && prev[lastShots[0]].hover === 'twoShot') prev[lastShots[0]].hover = prev[lastShots[0]].last
                        if (lastShots[1] && prev[lastShots[1]].hover === 'twoShot') prev[lastShots[1]].hover = prev[lastShots[1]].last
                        return { ...prev }
                    })
                }
            }>
                charges: {charges}
                <button
                    onMouseEnter={(e) => {
                        e.stopPropagation()
                        if (turn) {

                            setEnemyBoardState(prev => {
                                if (lastShots[0] && prev[lastShots[0]].hover !== 'twoShot') {
                                    prev[lastShots[0]].last = prev[lastShots[0]].hover
                                    prev[lastShots[0]].hover = 'twoShot'
                                }
                                if (lastShots[1] && prev[lastShots[1]].hover !== 'twoShot') {
                                    prev[lastShots[1]].last = prev[lastShots[1]].hover
                                    prev[lastShots[1]].hover = 'twoShot'
                                }
                                return { ...prev }
                            })

                        }
                    }}
                    // onMouseLeave={}

                    onClick={() => {
                        if (turn && !selecting && charges) {
                            socket.current.send(JSON.stringify({ shot: true, index: lastShots, id: cookies.user.id, twoShot: true }))
                            setTurn(false)
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