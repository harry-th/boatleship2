import { useState } from "react"

let useOrangeMan = () => {
    const [bluffing, setBluffing] = useState(sessionStorage.getItem('bluffing') ? JSON.parse(sessionStorage.getItem('bluffing')) : false)
    const [bluffShots, setBluffShots] = useState(sessionStorage.getItem('bluffShots') ? JSON.parse(sessionStorage.getItem('bluffShots')) : [])


    const OrangeManUI = ({ turn, setTurn, socket, enemyBoardState, enemyTargets, cookies, setEnemyBoardState }) => {
        return (
            <div>
                <button onClick={() => {
                    if (bluffing === null) return
                    if (turn) {
                        if (bluffing !== 'ready') {
                            setBluffing(prev => {
                                return !prev
                            })
                        }
                        if (bluffing === 'ready') {
                            setTurn(false)
                            setBluffing(null)
                            socket.current.send(JSON.stringify({ id: cookies.get('user').id, retaliation: true, }))
                        }
                    }
                }}>{bluffing === 'ready' ? 'fire Retaliation' :
                    bluffing === null ? 'fired' : bluffing ? 'stop Bluffing ' : 'start Bluffing'}</button>
            </div>
        )
    }
    return { bluffing, setBluffing, bluffShots, setBluffShots, OrangeManUI }
}

export default useOrangeMan