const { WebSocketServer } = require('ws');
const { normalSinkCheck, cornerSinkCheck } = require('./boatSinkCheck');
const handleOrange = require('./handleOrange');

const wss = new WebSocketServer({ port: 8080, ssl: true });

const groups = {}
// const games = []{state: 'ongoing', players:[id1, id2], id1:name, id2:name }
const wscodes = {}
const userData = {}
const userInfo = {}
console.log('server started')

const findGroup = ({ groups, id, name, character, boatnames }) => {
    userInfo[id] = { name, character, boatnames }
    let matchID = Object.entries(groups).find((group) => group[1] === null)
    if (matchID) {
        groups[matchID[0]] = id
        groups[id] = matchID[0]
        let playerinfo = userInfo[id]
        let enemyinfo = userInfo[groups[id]]
        wscodes[id].send(JSON.stringify({ matched: true, ...enemyinfo }))
        wscodes[matchID[0]].send(JSON.stringify({ matched: true, ...playerinfo }))
        return
    }
    groups[id] = null
    return
}
// id:(their id) : groups
//userdata[groups[your id]]
// When a new websocket connection is established id:{ boatPlacements: message.boatPlacements, targets: message.targets, boardState: message.boardState }
wss.on('connection', (ws, req) => {

    ws.on('message', (message) => {
        message = JSON.parse(message)
        const enemydata = userData[groups[message.id]]
        const playerdata = userData[message.id]
        console.log(playerdata)

        if (message.retaliation) {
            userData[message.id].turn = false
            userData[groups[message.id]].turn = true
            playerdata.turnNumber = Math.floor(playerdata.turnNumber + 1)

            let playerModifier = { for: 'player' }
            let enemyModifier = { for: 'opponent' }
            const shotresults = { missed: [], hit: [] }
            let openShots = Object.values(enemydata.boardState).filter(item => item.state === null)
            outerLoop: for (let i = 0; i < playerdata.bluffArray.length; i++) {
                for (let j = 0; j < 3; j++) {
                    let random = Math.floor(Math.random() * openShots.length)
                    let hitOrMiss = enemydata.targets.includes(openShots[random].id)
                    hitOrMiss ? shotresults.hit.push(openShots[random].id) : shotresults.missed.push(openShots[random].id)
                    let state = hitOrMiss ? 'hit' : 'missed'
                    enemydata.boardState[openShots[random].id].state = state
                    openShots.splice(random, 1)
                    if (openShots.length === 0) break outerLoop
                }
            }
            wscodes[message.id].send(JSON.stringify({ ...playerModifier, shotresults, bluffArray: playerdata.bluffArray, retaliation: true }))
            wscodes[groups[message.id]].send(JSON.stringify({ ...enemyModifier, shotresults, bluffArray: playerdata.bluffArray, retaliation: true }))
            return
        }
        if (message.callbluff) {
            userData[message.id].turn = false
            userData[groups[message.id]].turn = true
            playerdata.turnNumber = Math.floor(playerdata.turnNumber + 1)
            let playerModifier = { for: 'player' }
            let enemyModifier = { for: 'opponent' }
            if (enemydata.bluffing) {
                playerdata.bluffing = null
                let callbluff = 'success'
                const shotresults = { missed: [], hit: [] }
                for (const shot of enemydata.bluffArray) {
                    if (enemydata.targets.includes(shot)) {
                        enemydata.boardState[shot].state = 'hit'
                        shotresults.hit.push(shot)
                    } else {
                        shotresults.missed.push(shot)
                        enemydata.boardState[shot].state = 'missed'
                    }
                }
                wscodes[message.id].send(JSON.stringify({ ...playerModifier, callbluff, turnNumber: playerdata.turnNumber, enemyTurnNumber: enemydata.turnNumber }))
                wscodes[groups[message.id]].send(JSON.stringify({ ...enemyModifier, callbluff, bluffArray: shotresults, turnNumber: enemydata.turnNumber, enemyTurnNumber: playerdata.turnNumber }))
            } else {
                let callbluff = 'failure'
                playerdata.freeshotmiss = (playerdata.freeshotmiss || 0) + 1
                wscodes[message.id].send(JSON.stringify({ ...playerModifier, callbluff, freeshotmiss: playerdata.freeshotmiss, turnNumber: playerdata.turnNumber, enemyTurnNumber: enemydata.turnNumber }))
                wscodes[groups[message.id]].send(JSON.stringify({ ...enemyModifier, callbluff, enemyfreeshotmiss: playerdata.freeshotmiss, turnNumber: enemydata.turnNumber, enemyTurnNumber: playerdata.turnNumber }))
            }
            return
        }
        if (message.shot) {
            console.log(message.index)
            if (userData[message.id].turn) {
                let playerModifier = { for: 'player' }
                let enemyModifier = { for: 'opponent' }
                let { index, cornershot } = message
                const { orange, bluffing } = message
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
                enemyModifier = { ...enemyModifier, orange, turnNumber: enemydata.turnNumber, enemyTurnNumber: playerdata.turnNumber, ...freeshot, ...extrashot }
                playerModifier = { ...playerModifier, orange, turnNumber: playerdata.turnNumber, enemyTurnNumber: enemydata.turnNumber, ...freeshot, ...extrashot }
                if (enemydata.character === 'lineman') {
                    enemydata.twoShots = enemydata.twoShots ? [index[0], ...enemydata.twoShots] : index
                    if (enemydata.twoShots.length > 2) enemydata.twoShots.pop()
                    enemyModifier = { ...enemyModifier, twoShots: enemydata.twoShots }
                }
                if (enemydata.bluffing) {
                    enemydata.bluffing = 'ready'
                }
                if (orange) {
                    handleOrange({ index, playerdata, enemyBoardState: enemydata.boardState, ...extrashot, playerModifier, enemyModifier, bluffing })
                }
                if (!freeshot) {
                    userData[message.id].turn = false
                    userData[groups[message.id]].turn = true
                }
                let shotresults = { missed: [], hit: [] }
                for (const shot of index) {
                    if (enemydata.targets.includes(shot)) {
                        enemydata.boardState[shot].state = 'hit'
                        shotresults.hit.push(shot)
                    } else {
                        shotresults.missed.push(shot)
                        enemydata.boardState[shot].state = 'missed'
                    }
                }
                if (cornershot) {
                    let { shipsSunk, hits } = cornerSinkCheck({ enemydata })
                    if (hits) shotresults = { ...shotresults, hit: [...hits] }
                    enemyModifier = { ...enemyModifier, shipsSunk, cornershot }
                    playerModifier = { ...playerModifier, shipsSunk, cornershot }
                } else {
                    let { shipsSunk } = normalSinkCheck({ enemydata })
                    enemyModifier = { ...enemyModifier, shipsSunk }
                    playerModifier = { ...playerModifier, shipsSunk }
                }
                if (bluffing) {
                    wscodes[message.id].send(JSON.stringify({ ...playerModifier }))
                } else
                    wscodes[message.id].send(JSON.stringify({ shotresults, ...playerModifier }))
                wscodes[groups[message.id]].send(JSON.stringify({ shotresults, ...enemyModifier }))
            }
        }
        if (message.boatdata) {
            userData[message.id] = {
                name: message.name,
                character: message.character,
                boatPlacements: message.boatPlacements,
                targets: message.targets,
                boardState: message.boardState
            }
            if (Object.keys(userData).includes(message.id) && Object.keys(userData).includes(groups[message.id])) {
                if (Math.random() > 0.5) {
                    userData[groups[message.id]].turnNumber = 2
                    userData[message.id].turnNumber = 0
                    userData[message.id].turn = true
                    userData[groups[message.id]].turn = false
                } else {
                    userData[groups[message.id]].turnNumber = 0
                    userData[message.id].turnNumber = 2
                    userData[message.id].turn = false
                    userData[groups[message.id]].turn = true
                }
                wscodes[message.id].send(JSON.stringify({
                    name: enemydata.name,
                    turnNumber: 0,
                    enemyTurnNumber: 2,
                    boatsreceived: true,
                    turn: userData[message.id].turn
                }))
                wscodes[groups[message.id]].send(JSON.stringify({
                    name: message.name,
                    turnNumber: 2,
                    enemyTurnNumber: 0,
                    boatsreceived: true,
                    turn: userData[groups[message.id]].turn
                }))
            }
            return
        }
        if (message.state === 'matching') {
            if (message.id) wscodes[message?.id] = ws
            else return
            if (Object.keys(groups).includes(message.id)) return // could be groups[message.id]
            else {
                findGroup({ groups, id: message.id, name: message.name, character: message.character, boatnames: message.boatNames })
            }
        }
    });


});




