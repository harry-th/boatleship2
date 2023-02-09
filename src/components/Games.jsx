const Games = ({ games }) => {
    return (
        <div>
            {Object.values(games).map((item) => {
                if (item.disconnected && item.state === 'finished') {
                    return (
                        <div>
                            {item.loser} lost because {item.disconnectreason} against {item.winner}
                        </div>
                    )
                } else if (item.state === 'finished') {
                    return (
                        <div>
                            {item.winner} won playing as {item.winnerCharacter} against {item.loser} playing as {item.loserCharacter}
                        </div>
                    )
                } else if (item.state === 'placement') {
                    return (
                        <div>
                            {item.player1} and {item.player2} are placing their boats
                        </div>
                    )
                } else if (item.state === 'ongoing') {
                    return (
                        <div>
                            {item.player1} and {item.player2} are playing
                        </div>
                    )
                }
                else {
                    return <div></div>
                }
            })}
        </div>
    )
}

export default Games