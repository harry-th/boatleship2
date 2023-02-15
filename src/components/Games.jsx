import { useEffect, useState } from "react"
import { socket } from './server/client';


const Games = ({ games, finished, current, open, cookies }) => {
    const [errorMessage, setErrorMessage] = useState(null)
    useEffect(() => {
        if (open) {
            const messageListener = (event) => {
                let message = JSON.parse(event.data)
                if (message.issue === 'character type mismatch') {
                    if (message.charactertype === 'default') setErrorMessage(<><label>change character to default?</label> <button onClick={cookies.set('user', { ...cookies.get('user'), character: 'default' })}>?</button></>)
                    else if (message.charactertype === 'character') setErrorMessage('choose a character at play')
                }
            }
            socket.addEventListener('message', messageListener)
            return () => {
                socket.removeEventListener('message', messageListener)
            }
        }
    }, [open, cookies])
    return (
        <table>
            <tr>
                {open && <td>
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
                            socket.send(JSON.stringify({
                                ...cookies.get('user'),
                                matchcode: true,
                                code: e.target[0].value
                            }))
                        }}>
                        <input type="text" />
                    </form>
                </td>}
            </tr>
            {Object.values(games).filter(item => {
                if (finished) return item.state === 'finished'
                else if (current) return item.state === 'placement' || item.state === 'ongoing'
                else if (open) return item.state === 'looking for match'
                else return item
            }
            ).map((item) => {
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
        </table>
    )
}

export default Games