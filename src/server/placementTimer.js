const placementTimer = ({ userData, userInfo, groups, games, id, wscodes }) => {
    userData[id] = { timer: {} }
    userData[groups[id]] = { timer: {} }

    userData[groups[id]].timer.time = Date.now() + 60000
    userData[groups[id]].timer.code = setTimeout(() => {
        if (userData[id]?.timer?.code) {
            games[userInfo[id].currentGame] = {
                state: 'finished',
                player1: userInfo[groups[id]].name, player2: userInfo[id].name,
                disconnected: true, disconnectreason: 'placement time ran out',
                tie: true
            }
            wscodes[groups[id]].send(JSON.stringify({ for: 'player', loss: true, hasDisconnected: true }))
            wscodes[id].send(JSON.stringify({ for: 'opponent', loss: true, hasDisconnected: true }))
        } else {
            games[userInfo[id].currentGame] = {
                state: 'finished', winnerId: id, loserId: groups[id],
                winner: userInfo[id].name, loser: userInfo[groups[id]].name,
                winnerCharacter: userInfo[id].character, loserCharacter: userInfo[groups[id]].character,
                disconnected: true, disconnectreason: 'placement time ran out'
            }
            // if (userData[groups[id]].timer.code) //do something if the enemies timer is still going therefore both disconnected
            wscodes[id].send(JSON.stringify({ for: 'player', win: true, hasDisconnected: true }))
            wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', loss: true, hasDisconnected: true }))
            delete userData[groups[id]]
            delete userData[id]
        }
    }, 60000)

    userData[id].timer.time = Date.now() + 60000
    userData[id].timer.code = setTimeout(() => {
        // if (userData[groups[id]].timer.code) //do something if the enemies timer is still going therefore both disconnected
        if (userData[groups[id]]?.timer?.code) {
            games[userInfo[id].currentGame] = {
                state: 'finished',
                player1: userInfo[groups[id]].name, player2: userInfo[id].name,
                disconnected: true, disconnectreason: 'placement time ran out',
                tie: true
            }
            wscodes[groups[id]].send(JSON.stringify({ for: 'player', loss: true, hasDisconnected: true }))
            wscodes[id].send(JSON.stringify({ for: 'opponent', loss: true, hasDisconnected: true }))
        } else {
            games[userInfo[id].currentGame] = {
                state: 'finished', winnerId: groups[id], loserId: id,
                winner: userInfo[groups[id]].name, loser: userInfo[id].name,
                winnerCharacter: userInfo[groups[id]].character, loserCharacter: userInfo[id].character,
                disconnected: true, disconnectreason: 'placement time ran out'
            }
            wscodes[groups[id]].send(JSON.stringify({ for: 'player', win: true, hasDisconnected: true }))
            wscodes[id].send(JSON.stringify({ for: 'opponent', loss: true, hasDisconnected: true }))
            delete userData[groups[id]]
            delete userData[id]
        }
    }, 60000)
}

module.exports = placementTimer