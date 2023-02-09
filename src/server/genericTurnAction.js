const genericTurnAction = ({ id, userInfo, games, wscodes, groups, userData }) => {

    let playerModifier = { for: 'player', time: 20 }
    let enemyModifier = { for: 'opponent', time: 20 }
    let freeshot, extrashot
    if (userData[id].turnNumber % 4 === 0 && userData[id].turnNumber !== 0 && !userData[id].freeshotmiss) {
        freeshot = { freeshot: true }
        userData[id].turnNumber = userData[id].turnNumber + 0.5
    } else {
        if (userData[id].freeshotmiss && userData[id].turnNumber % 4 === 0 && userData[id].turnNumber !== 0) {
            userData[id].freeshotmiss = (userData[id].freeshotmiss - 1) || 0
            playerModifier = { ...playerModifier, freeshotmiss: userData[id].freeshotmiss }
            enemyModifier = { ...enemyModifier, enemyfreeshotmiss: userData[id].freeshotmiss }
        }
        if (userData[id].turnNumber !== Math.floor(userData[id].turnNumber)) extrashot = { extrashot: true }
        userData[id].turnNumber = Math.floor(userData[id].turnNumber + 1)
    }
    if (!freeshot) {
        if (userData[id]?.timer?.code) clearTimeout(userData[id].timer.code)
        delete userData[id].timer
        userData[id].turn = false
        userData[groups[id]].turn = true
        userData[groups[id]].timer = {}
        userData[groups[id]].timer.time = Date.now() + 22000
        userData[groups[id]].timer.code = setTimeout(() => {
            games[userInfo[id].currentGame] = {
                state: 'finished', winnerId: id, loserId: groups[id],
                winner: userInfo[id].name, loser: userInfo[groups[id]].name,
                winnerCharacter: userInfo[id].character, loserCharacter: userInfo[groups[id]].character,
                disconnected: true, disconnectreason: 'turn time ran out'
            }
            wscodes[id].send(JSON.stringify({ for: 'player', win: true, hasDisconnected: true }))
            wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', loss: true, hasDisconnected: true }))
            delete userData[groups[id]]
            delete userData[id]
        }, 22000)
    }
    playerModifier = { ...playerModifier, turnNumber: userData[id].turnNumber, ...freeshot, ...extrashot }
    enemyModifier = { ...enemyModifier, turnNumber: userData[groups[id]].turnNumber, enemyTurnNumber: userData[id].turnNumber, ...freeshot, ...extrashot }
    return { playerModifier, enemyModifier, freeshot, extrashot }
}

module.exports = genericTurnAction