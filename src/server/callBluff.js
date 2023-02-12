const genericTurnAction = require("./genericTurnAction")

const callBluff = ({ id, userInfo, games, wscodes, groups, userData }) => {
    if (userData[groups[id]].bluffing === 'fired' || userData[groups[id]].bluffing === 'disarmed') return
    if (userData[groups[id]].bluffing) {
        let { playerModifier, enemyModifier } = genericTurnAction({ id, userInfo, games, wscodes, groups, userData })
        let callbluff = 'success'
        userData[groups[id]].bluffing = 'disarmed'
        const shotresults = { missed: [], hit: [] }
        for (const shot of userData[groups[id]].bluffArray) {
            if (userData[id].targets.includes(shot)) {
                shotresults.hit.push(shot)
            } else {
                shotresults.missed.push(shot)
            }
        }
        delete userData[groups[id]].bluffArray
        wscodes[id].send(JSON.stringify({ ...playerModifier, callbluff, turnNumber: userData[id].turnNumber, enemyTurnNumber: userData[groups[id]].turnNumber }))
        wscodes[groups[id]].send(JSON.stringify({ ...enemyModifier, callbluff, bluffArray: shotresults, turnNumber: userData[groups[id]].turnNumber, enemyTurnNumber: userData[id].turnNumber }))
    } else {
        let callbluff = 'failure'
        let { playerModifier, enemyModifier } = genericTurnAction({ id, userInfo, games, wscodes, groups, userData })
        userData[id].freeshotmiss = (userData[id].freeshotmiss || 0) + 1
        wscodes[id].send(JSON.stringify({ ...playerModifier, callbluff, freeshotmiss: userData[id].freeshotmiss }))
        wscodes[groups[id]].send(JSON.stringify({ ...enemyModifier, callbluff, enemyfreeshotmiss: userData[id].freeshotmiss, turnNumber: userData[groups[id]].turnNumber, enemyTurnNumber: userData[id].turnNumber }))
    }
}

module.exports = callBluff