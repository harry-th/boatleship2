import { useState } from "react"

let useOrangeMan = () => {
    const [bluffing, setBluffing] = useState(sessionStorage.getItem('bluffing') ? JSON.parse(sessionStorage.getItem('bluffing')) : false)
    const [bluffShots, setBluffShots] = useState(sessionStorage.getItem('bluffShots') ? JSON.parse(sessionStorage.getItem('bluffShots')) : [])


    const OrangeManUI = ({ turn, setTurn, socket, cookies }) => {
        return (
            <div>
                <button onClick={() => {
                    if (bluffing === 'done' || bluffing === 'disarmed') return
                    if (turn) {
                        if (bluffing === 'bluffing') {
                            setBluffing(false)
                        } else if (!bluffing) {
                            setBluffing('bluffing')
                        }
                        if (bluffing === 'ready') {
                            setTurn(false)
                            setBluffing(null)
                            socket.current.send(JSON.stringify({ id: cookies.get('user').id, shot: true, retaliation: true, }))
                        }
                    }
                }}>{bluffing === 'ready' ? 'fire Retaliation' :
                    bluffing === 'done' ? 'fired' : bluffing === 'disarmed' ? 'disarmed' : bluffing === 'bluffing' ? 'stop Bluffing ' : 'start Bluffing'}</button>
            </div>
        )
    }
    return { bluffing, setBluffing, bluffShots, setBluffShots, OrangeManUI }
}

export default useOrangeMan