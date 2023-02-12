const Games = ({ games }) => {
    return (
        <table>
            <tr><td></td></tr>
            {Object.values(games).map((item) => {
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