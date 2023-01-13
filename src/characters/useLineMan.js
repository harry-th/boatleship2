import { useState } from "react"

const useLineMan = () => {
    const [lastShots, setLastShots] = useState([])
    const [selection, setSelection] = useState([])
    const [selecting, setSelecting] = useState(sessionStorage.getItem('selecting') ? JSON.parse(sessionStorage.getItem('selecting')) : false)
    const [charges, setCharges] = useState(sessionStorage.getItem('charges') ? JSON.parse(sessionStorage.getItem('charges')) : 4)

    const shootLine = (
        index
        , boardState
        , socket
        , cookies
        , enemyBoardState
        , enemyTargets
        , setBoardState
        , setEnemyBoardState
        , setTurn
        , setSelecting
        , enemyBoatPlacements
        , setEnemyBoatPlacements
        , setCharges
        , freeShotMiss
        , hitDisplayLogic
    ) => {
        if (selection[0] === index) {
            setSelection([])
            setEnemyBoardState(prev => {
                prev[index].hover = false
                return prev
            })
            return
        }
        if (enemyBoardState[index].state !== 'selectable') return
        if (selection.length === 0) {
            setSelection([index])
            sessionStorage.setItem('selection', index)
            setEnemyBoardState(prev => {
                prev[index].hover = 'green'
                return prev
            })
        }
        if (selection.length === 1) {
            let result = []
            if ((Math.floor(selection[0] / 10) === Math.floor(index / 10))) {
                let start, end
                if (selection[0] > index) {
                    start = index
                    end = selection[0]
                } else {
                    start = selection[0]
                    end = index
                }
                for (let i = start + 1; i < end; i++) {

                    if (boardState[i].state === 'missed' || boardState[i].state === 'hit' || boardState[i].hover === 'protected' ||
                        enemyBoardState[i].state === 'selectable' || enemyBoardState[i].state === 'hit' || enemyBoardState[i].hover === 'protected') {
                        if (boardState[i].state === 'missed' || boardState[i].state === 'hit' || boardState[i].hover === 'protected') {
                            let oldState = boardState[i].state

                            setBoardState(prev => {

                                prev[i].state = 'hit'
                                return { ...prev }
                            })
                            setTimeout(() => setBoardState(prev => {
                                prev[i].state = oldState
                                return { ...prev }
                            }), 200)
                            return
                        } else if (enemyBoardState[i].state === 'selectable' || enemyBoardState[i].state === 'hit' || enemyBoardState[i].hover === 'protected') {
                            let oldState = enemyBoardState[i].state
                            setEnemyBoardState(prev => {
                                prev[i].state = 'hit'
                                return prev
                            })
                            setTimeout(() => setEnemyBoardState(prev => {
                                prev[i].state = oldState
                                return prev
                            }), 200)
                            return
                        }
                    } else {
                        result.push(i)
                    }
                }
            } else if (((selection[0] % (Math.floor(selection[0] / 10) * 10)) || selection[0]) === ((index % (Math.floor(index / 10) * 10)) || index)) {
                let start, end
                if (selection[0] > index) {
                    start = index
                    end = selection[0]
                } else {
                    start = selection[0]
                    end = index
                }
                for (let i = start + 10; i < end; i += 10) {

                    if (boardState[i].state === 'missed' || boardState[i].state === 'hit' || boardState[i].hover === 'protected' ||
                        enemyBoardState[i].state === 'selectable' || enemyBoardState[i].state === 'hit' || enemyBoardState[i].hover === 'protected') {
                        if (boardState[i].state === 'missed' || boardState[i].state === 'hit' || boardState[i].hover === 'protected') {
                            let oldState = boardState[i].state

                            setBoardState(prev => {

                                prev[i].state = 'hit'
                                return { ...prev }
                            })
                            setTimeout(() => setBoardState(prev => {
                                prev[i].state = oldState
                                return { ...prev }
                            }), 200)
                            return
                        } else if (enemyBoardState[i].state === 'selectable' || enemyBoardState[i].state === 'hit' || enemyBoardState[i].hover === 'protected') {
                            let oldState = enemyBoardState[i].state
                            setEnemyBoardState(prev => {
                                prev[i].state = 'hit'
                                return prev
                            })
                            setTimeout(() => setEnemyBoardState(prev => {
                                prev[i].state = oldState
                                return prev
                            }), 200)
                            return
                        }
                    } else {
                        result.push(i)
                    }
                }
            } else {
                return
            }

            setEnemyBoardState(prev => {
                prev[selection[0]].hover = false
                return prev
            })
            setSelection([])

            let newEnemyBoardState = { ...enemyBoardState }
            let newEnemyBoatPlacements = { ...enemyBoatPlacements }
            for (const item of result) {
                let hitOrMiss = enemyTargets.includes(item)
                let state = hitOrMiss ? 'hit' : 'missed'
                newEnemyBoardState[item] = { id: item, state, hover: false }
                if (hitOrMiss) {
                    hitDisplayLogic.hit(item, hitOrMiss, state)
                    const allHits = Object.values(newEnemyBoardState).filter((item) => {
                        return item.state === 'hit'
                    }).map((el) => el.id)
                    for (const boat in newEnemyBoatPlacements) {
                        if (!newEnemyBoatPlacements[boat].sunk && newEnemyBoatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                            newEnemyBoatPlacements[boat].sunk = true
                            hitDisplayLogic.sink(enemyBoatPlacements[boat].name)
                        }
                    }

                } else {
                    hitDisplayLogic.hit(index, hitOrMiss, state)
                }
            }
            for (const square in enemyBoardState) {
                if (enemyBoardState[square].state === 'selectable') newEnemyBoardState[square].state = 'missed'
            }
            setEnemyBoardState(newEnemyBoardState)
            setEnemyBoatPlacements(newEnemyBoatPlacements)
            setCharges(prev => {
                sessionStorage.setItem('charges', prev - 1)
                let newNumber = prev - 1
                return newNumber
            })
            socket.send(JSON.stringify({ dataType: 'shot', index: result, id: cookies.user.id }))
            setSelecting(false)
            sessionStorage.setItem('selecting', false)
            setTurn(false)
            sessionStorage.setItem('turn', JSON.stringify(false))
        }
    }
    const LineManUI = ({ turn, setTurn, enemyBoardState, enemyTargets,
        enemyBoatPlacements, setEnemyBoatPlacements, setEnemyBoardState, socket, cookies, turnNumber,
        setTurnNumber, freeShotMiss, setFreeShotMiss }) => {
        return (
            <div>
                charges: {charges}
                <button
                    onMouseOver={() => {
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
                                return prev
                            })

                        }
                    }}
                    onMouseLeave={() => {
                        setEnemyBoardState(prev => {
                            if (lastShots[0] && prev[lastShots[0]].hover === 'twoShot') prev[lastShots[0]].hover = prev[lastShots[0]].last
                            if (lastShots[1] && prev[lastShots[1]].hover === 'twoShot') prev[lastShots[1]].hover = prev[lastShots[1]].last
                            return prev
                        })
                    }}

                    onClick={() => {
                        if (turn && !selecting && charges) {
                            if (turnNumber && turnNumber % 4 === 0) {


                                if (!freeShotMiss) {
                                    setFreeShotMiss(prev => prev + 1)
                                    var freeShot = true
                                }
                                else {
                                    setTurn(false)
                                    sessionStorage.setItem('turn', JSON.stringify(false))
                                    setFreeShotMiss(prev => {
                                        if (prev > 0) return prev - 1
                                        else return prev
                                    })
                                }
                            } else {
                                setTurn(false)
                                sessionStorage.setItem('turn', JSON.stringify(false))
                            }

                            let newState = JSON.parse(JSON.stringify(enemyBoardState))
                            for (const shot of lastShots) {
                                let hitOrMiss = (enemyTargets).includes(Number(shot))
                                let state = hitOrMiss ? 'hit' : 'missed'
                                if (hitOrMiss && newState[shot].state !== 'hit') {
                                    newState[shot] = { id: shot, state, hover: false }

                                    alert('Nice Shot!')
                                    const allHits = Object.values(newState).filter((item) => {
                                        return item.state === 'hit'
                                    }).map((el) => el.id)
                                    for (const boat in enemyBoatPlacements) {
                                        if (!enemyBoatPlacements[boat].sunk && enemyBoatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                                            setEnemyBoatPlacements(prev => {
                                                prev[boat].sunk = true
                                                return { ...prev }
                                            })
                                            alert(`${enemyBoatPlacements[boat].name} was sunk!`)
                                        }
                                    }
                                }
                                newState[shot] = { id: shot, state, hover: false }
                            }
                            setEnemyBoardState(newState)
                            socket.send(JSON.stringify({ dataType: 'shot', index: lastShots, id: cookies.user.id, freeShot }))
                            setCharges(prev => {
                                sessionStorage.setItem('charges', prev - 1)
                                return prev - 1
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
                        setEnemyBoardState(newEnemyBoardState)
                        setSelecting(prev => {
                            return !prev
                        })
                        sessionStorage.setItem('selecting', JSON.stringify(!selecting))
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