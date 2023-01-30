const genericTurnAction = ({ id, userInfo, games, wscodes, groups, userData }) => {
    clearTimeout(userData[groups[id]].turnTimerCode)
    delete userData[id].turnTimerCode
    let playerModifier = { for: 'player' }
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
        userData[id].turn = false
        userData[groups[id]].turn = true
        userData[id].turnTimerCode = setTimeout(() => {
            games[userInfo[id].currentGame] = {
                state: 'finished by turn time', winnerId: id, loserId: groups[id],
                winner: userInfo[id].name, loser: userInfo[groups[id]].name,
                winnerCharacter: userInfo[id].character, loserCharacter: userInfo[groups[id]].character
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