const genericTurnAction = require("./genericTurnAction")

const callBluff = ({ playerdata, enemydata, playerAddress, enemyAddress }) => {
    if (enemydata.bluffing) {
        let { playerModifier, enemyModifier } = genericTurnAction({ playerdata, enemydata })
        let callbluff = 'success'
        enemydata.bluffing = 'disarmed'
        const shotresults = { missed: [], hit: [] }
        for (const shot of enemydata.bluffArray) {
            if (playerdata.targets.includes(shot)) {
                shotresults.hit.push(shot)
            } else {
                shotresults.missed.push(shot)
            }
        }
        playerAddress.send(JSON.stringify({ ...playerModifier, callbluff, turnNumber: playerdata.turnNumber, enemyTurnNumber: enemydata.turnNumber }))
        enemyAddress.send(JSON.stringify({ ...enemyModifier, callbluff, bluffArray: shotresults, turnNumber: enemydata.turnNumber, enemyTurnNumber: playerdata.turnNumber }))
    } else {
        let callbluff = 'failure'
        playerdata.freeshotmiss = (playerdata.freeshotmiss || 0) + 1
        let { playerModifier, enemyModifier } = genericTurnAction({ playerdata, enemydata })
        playerAddress.send(JSON.stringify({ ...playerModifier, callbluff, freeshotmiss: playerdata.freeshotmiss }))
        enemyAddress.send(JSON.stringify({ ...enemyModifier, callbluff, enemyfreeshotmiss: playerdata.freeshotmiss, turnNumber: enemydata.turnNumber, enemyTurnNumber: playerdata.turnNumber }))
    }
}

module.exports = callBluff