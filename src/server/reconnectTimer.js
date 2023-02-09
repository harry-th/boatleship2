const reconnectTimer = ({ id, groups, userInfo, games, wscodes, userData }) => {
    userData[id].timer.time = Date.now() + userData[id].timer.remaining
    userData[id].timer.code = setTimeout(() => {
        games[userInfo[id].currentGame] = {
            state: 'finished', winnerId: id, loserId: groups[id],
            winner: userInfo[id].name, loser: userInfo[groups[id]].name,
            winnerCharacter: userInfo[id].character, loserCharacter: userInfo[groups[id]].character,
            disconnected: true, disconnectreason: 'turn time ran out'
        }
        wscodes[groups[id]].send(JSON.stringify({ for: 'player', win: true, hasDisconnected: true }))
        wscodes[id].send(JSON.stringify({ for: 'opponent', loss: true, hasDisconnected: true }))
        delete userData[groups[id]]
        delete userData[id]
    }, userData[id].timer.remaining || 22000)
    return
}

module.exports = reconnectTimer