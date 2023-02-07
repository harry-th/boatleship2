const placementTimer = ({ userData, userInfo, groups, games, id, wscodes }) => {
    userData[id] = { timer: {} }
    userData[groups[id]] = { timer: {} }

    userData[groups[id]].timer.time = Date.now() + 60000
    userData[groups[id]].timer.code = setTimeout(() => {
        games[userInfo[id].currentGame] = {
            state: 'finished by turn time', winnerId: id, loserId: groups[id],
            winner: userInfo[id].name, loser: userInfo[groups[id]].name,
            winnerCharacter: userInfo[id].character, loserCharacter: userInfo[groups[id]].character
        }
        // if (userData[groups[id]].timer.code) //do something if the enemies timer is still going therefore both disconnected
        wscodes[id].send(JSON.stringify({ for: 'player', win: true, hasDisconnected: true }))
        wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', loss: true, hasDisconnected: true }))
        delete userData[groups[id]]
        delete userData[id]
    }, 60000)

    userData[id].timer.time = Date.now() + 60000
    userData[id].timer.code = setTimeout(() => {
        games[userInfo[id].currentGame] = {
            state: 'finished by turn time', winnerId: id, loserId: groups[id],
            winner: userInfo[id].name, loser: userInfo[groups[id]].name,
            winnerCharacter: userInfo[id].character, loserCharacter: userInfo[groups[id]].character
        }
        if (userData[id].timer.code) //do something if the enemies timer is still going therefore both disconnected
            wscodes[id].send(JSON.stringify({ for: 'player', win: true, hasDisconnected: true, placementTimer: 'wow' }))
        wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', loss: true, hasDisconnected: true, placementTimer: 'wow' }))
        delete userData[groups[id]]
        delete userData[id]
    }, 60000)
}

module.exports = placementTimer