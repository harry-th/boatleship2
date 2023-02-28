import { useEffect } from "react"
import { useState } from "react"
import Pagenumbers from "./Pagenumbers"
const Games = ({ games, setDisplay, finished, current, open, socket, cookies }) => {
    games = Object.values(games)
    const [page, setPage] = useState(1)

    let selectedGames = Object.values(games).filter((item, index) => {
        if (finished) return item.state === 'finished'
        else if (current) return (item.state === 'placement' || item.state === 'ongoing')
        else if (open) return item.state === 'looking for match'
        else return item
    }
    )
    selectedGames = selectedGames.filter((item, index) => {
        if ((index > (page * 20) || index < ((page - 1) * 20))) return false
        else return true
    })

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
    console.log(selectedGames, current)

    return (
        <div>
            <button onClick={() => { setDisplay('home') }}>back</button>
            {selectedGames.length > 0 && <div>
                <div>
                    {Pagenumbers({ selectedGames, setPage, page })}
                </div>
                <div>
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
                                    <th>{games.length > 0 ? 'Finished Matches:' : 'there are no finished matches'}</th>
                                </>}
                                {current && <>
                                    <th>current matches:</th>
                                </>}
                            </th>
                        </tr>
                        <tr>

                            {finished && <>
                                <th colSpan={2}>winner:
                                    <td>name</td>
                                    <td>character</td>
                                </th>
                                <th colSpan={2}>loser:
                                    <td>name</td>
                                    <td>character</td>
                                </th>
                                <th><p>boats left//</p>
                                    <p>disconnect reason</p></th>
                            </>}
                            {current && <>
                                <th>
                                    stage:
                                </th>
                                <th colSpan={2}>player1:
                                    <td>name</td>
                                    <td>character</td>
                                </th>
                                <th colSpan={2}>player2:
                                    <td>name</td>
                                    <td>character</td>
                                </th>
                            </>}
                        </tr>

                        {selectedGames.length > 0 &&
                            <>
                                {selectedGames.map((item) => {
                                    if (item.disconnected && item.state === 'finished') {
                                        if (!item.tie) {
                                            return (
                                                <tr>
                                                    <td colSpan={2}>{item.loser}</td>
                                                    <td colSpan={2}>{item.winner}</td>
                                                    <td colSpan={2}>{item.disconnectreason}</td>
                                                </tr>
                                            )
                                        } else {
                                            return (
                                                <tr>
                                                    <td colSpan={4}><p>{item.player1} and {item.player2} failed to placed their boats</p></td>
                                                    <td>both timed out</td>
                                                </tr>
                                            )
                                        }
                                    } else if (item.state === 'finished') {
                                        return (
                                            <tr>
                                                <td>{item.winner}</td>
                                                <td> {item.winnerCharacter} </td>
                                                <td>{item.loser}</td>
                                                <td>{item.loserCharacter}</td>
                                                <td>{item.winner} had {item.boatsleft} boats left</td>
                                            </tr>
                                        )
                                    } else if (item.state === 'looking for match') {
                                        return (
                                            <tr>
                                                <td><p>{item.player} is looking for a match</p></td>
                                            </tr>
                                        )
                                    } else if (item.state === 'placement') {
                                        return (
                                            <tr>
                                                <td>placement</td>
                                                <td>{item.player1}</td>
                                                <td>{item.player1character}</td>
                                                <td>{item.player2}</td>
                                                <td>{item.player2character}</td>
                                            </tr>
                                        )
                                    } else if (item.state === 'ongoing') {
                                        return (
                                            <tr>
                                                <td>ongoing</td>
                                                <td>{item.player1}</td>
                                                <td>{item.player1character}</td>
                                                <td>{item.player2}</td>
                                                <td>{item.player2character}</td>
                                            </tr>
                                        )
                                    }
                                    else {
                                        return <tr></tr>
                                    }
                                })}
                            </>
                        }
                    </table>
                </div>
            </div>}
        </div >
    )
}

export default Games