const genericTurnAction = ({ playerdata, enemydata }) => {
    let playerModifier = { for: 'player' }
    let enemyModifier = { for: 'opponent' }
    let freeshot, extrashot
    if (playerdata.turnNumber % 4 === 0 && playerdata.turnNumber !== 0 && !playerdata.freeshotmiss) {
        freeshot = { freeshot: true }
        playerdata.turnNumber = playerdata.turnNumber + 0.5
    } else {
        if (playerdata.freeshotmiss && playerdata.turnNumber % 4 === 0 && playerdata.turnNumber !== 0) {
            playerdata.freeshotmiss = (playerdata.freeshotmiss - 1) || 0
            playerModifier = { ...playerModifier, freeshotmiss: playerdata.freeshotmiss }
            enemyModifier = { ...enemyModifier, enemyfreeshotmiss: playerdata.freeshotmiss }
        }
        if (playerdata.turnNumber !== Math.floor(playerdata.turnNumber)) extrashot = { extrashot: true }
        playerdata.turnNumber = Math.floor(playerdata.turnNumber + 1)
    }
    if (!freeshot) {
        playerdata.turn = false
        enemydata.turn = true
    }
    playerModifier = { ...playerModifier, turnNumber: playerdata.turnNumber, ...freeshot, ...extrashot }
    enemyModifier = { ...enemyModifier, turnNumber: enemydata.turnNumber, enemyTurnNumber: playerdata.turnNumber, ...freeshot, ...extrashot }
    return { playerModifier, enemyModifier, freeshot, extrashot }
}

module.exports = genericTurnAction