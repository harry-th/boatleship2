import { useEffect } from "react"
import { useState } from "react"
import Pagenumbers from "./Pagenumbers"
const Games = ({ games, setDisplay, finished, current,
    socket, cookies, setCookie }) => {
    games = Object.values(games)
    useEffect(() => {
        if (socket.current?.readyState === 1) socket.current.send(JSON.stringify({ request: 'games' }))
    }, [socket])
    const [page, setPage] = useState(1)
    let selectedGames = Object.values(games).filter((item, index) => {
        if (finished) return item.state === 'finished'
        else if (current) return (item.state === 'placement' || item.state === 'ongoing')
        else return item
    }
    )
    const pageGames = selectedGames.filter((item, index) => {
        if ((index > (page * 14) || index < ((page - 1) * 14))) return false
        else return true
    })



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
                                {pageGames.map((item) => {
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