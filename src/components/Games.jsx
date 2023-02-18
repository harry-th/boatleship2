import { useEffect } from "react"
import { useState } from "react"
import styles from '../styles/Games.module.css'
const Games = ({ games, setDisplay, finished, current, open, socket, cookies }) => {

    games = Object.values(games).filter(item => {
        if (finished) return item.state === 'finished'
        else if (current) return item.state === 'placement' || item.state === 'ongoing'
        else if (open) return item.state === 'looking for match'
        else return item
    }
    )
    const [errorMessage, setErrorMessage] = useState(null)
    useEffect(() => {
        if (open) {
            let sock = socket.current
            const messageListener = (event) => {
                let message = JSON.parse(event.data)
                if (message.issue === 'character type mismatch') {
                    if (message.charactertype === 'default') setErrorMessage(<><label>change character to default?</label> <button onClick={cookies.set('user', { ...cookies.get('user'), character: 'default' })}>?</button></>)
                    else if (message.charactertype === 'character') setErrorMessage('choose a character at play')
                }
            }
            socket.current.addEventListener('message', messageListener)
            return () => {
                sock.removeEventListener('message', messageListener)
            }
        }
    }, [socket, open, cookies])
    return (
        <div>
            <button onClick={() => setDisplay('home')}>back</button>
            <table>
                <tr>
                    <th>
                        {open && <> {games.length > 0 ? <>
                            {!errorMessage ? <label htmlFor="">input code:</label> : <p>{errorMessage}</p>}
                            <form action="submit"
                                onSubmit={(e) => {
                                    let user = cookies.get('user')
                                    e.preventDefault()
                                    if (!user.name) {
                                        setErrorMessage('go to play and enter name')
                                        return
                                    } else if (!user.character) {
                                        setErrorMessage('go to play and enter character')
                                        return
                                    } else if (!user.boatNames) {
                                        return
                                    }
                                    socket.current.send(JSON.stringify({
                                        ...cookies.get('user'),
                                        matchcode: true,
                                        code: e.target[0].value
                                    }))
                                }}>
                                <input type="text" />
                            </form>
                        </> : 'no open games'}</>}
                        {finished && <>
                            {games.length > 0 ? 'finished natches:' : 'there are no finished matches'}
                        </>}
                        {current && <>
                            current matches:
                        </>}
                    </th>
                    {games.length > 0 &&
                        <td>
                            {games.map((item) => {
                                if (item.disconnected && item.state === 'finished') {
                                    return (
                                        <tr>
                                            <td>{item.loser} lost because {item.disconnectreason} against {item.winner}</td>
                                        </tr>
                                    )
                                } else if (item.state === 'finished') {
                                    return (
                                        <tr>
                                            <td>{item.winner} won playing as {item.winnerCharacter} against {item.loser} playing as {item.loserCharacter}</td>
                                        </tr>
                                    )
                                } else if (item.state === 'looking for match') {
                                    return (
                                        <tr>
                                            <td>{item.player} is looking for a match</td>
                                        </tr>
                                    )
                                } else if (item.state === 'placement') {
                                    return (
                                        <tr>
                                            <td>{item.player1} and {item.player2} are placing their boats</td>
                                        </tr>
                                    )
                                } else if (item.state === 'ongoing') {
                                    return (
                                        <tr>
                                            <td>{item.player1} and {item.player2} are playing</td>
                                        </tr>
                                    )
                                }
                                else {
                                    return <tr></tr>
                                }
                            })}
                        </td>
                    }
                </tr>
            </table>
        </div>
    )
}

export default Games