const { WebSocketServer } = require('ws');
const handleOrange = require('./handleOrange');

const wss = new WebSocketServer({ port: 8080, ssl: true });

const groups = {}
// const games = []{state: 'ongoing', players:[id1, id2], id1:name, id2:name }
const wscodes = {}
const userData = {}
console.log('server started')

const findGroup = (groups, id) => {
    let matchID = Object.entries(groups).find((group) => group[1] === null)
    if (matchID) {
        groups[matchID[0]] = id
        groups[id] = matchID[0]
        wscodes[id].send(JSON.stringify({ matched: true }))
        wscodes[matchID[0]].send(JSON.stringify({ matched: true }))
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
        if (message.retaliation) {
            userData[message.id].turn = false
            userData[groups[message.id]].turn = true
            console.log(message)
            playerdata.turnNumber = Math.floor(playerdata.turnNumber + 1)

            userData[message.id].turn = false
            userData[groups[message.id]].turn = true
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
            wscodes[message.id].send(JSON.stringify({ you: true, shotresults, bluffArray: playerdata.bluffArray, retaliation: true }))
            wscodes[groups[message.id]].send(JSON.stringify({ shotresults, bluffArray: playerdata.bluffArray, retaliation: true }))
            return
        }
        if (message.callbluff) {
            userData[message.id].turn = false
            userData[groups[message.id]].turn = true
            playerdata.turnNumber = Math.floor(playerdata.turnNumber + 1)

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
                wscodes[message.id].send(JSON.stringify({ you: true, callbluff }))
                wscodes[groups[message.id]].send(JSON.stringify({ callbluff, bluffArray: shotresults }))
            } else {
                let callbluff = 'failure'
                playerdata.freeshotmiss = (playerdata.freeshotmiss || 0) + 1
                wscodes[message.id].send(JSON.stringify({ you: true, callbluff, freeshotmiss: playerdata.freeshotmiss, turnNumber: playerdata.turnNumber, enemyTurnNumber: enemydata.turnNumber }))
                wscodes[groups[message.id]].send(JSON.stringify({ callbluff, enemyfreeshotmiss: playerdata.freeshotmiss, turnNumber: enemydata.turnNumber, enemyTurnNumber: playerdata.turnNumber }))
            }
            return
        }
        if (message.shot) {
            console.log(message.index)
            if (userData[message.id].turn) {
                let playerModifier
                let enemyModifier
                const shipsSunk = []
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
                if (enemydata.character === 'lineman' && !Array.isArray(index)) {
                    if (!enemydata.twoShots) enemydata.twoShots = []
                    enemydata.twoShots = [index, ...enemydata.twoShots]
                    if (enemydata.twoShots.length > 2) enemydata.twoShots.pop()
                    enemyModifier = { ...enemyModifier, twoShots: enemydata.twoShots }
                }
                if (orange) {
                    handleOrange({ index, boardState: playerdata.boardState, enemyBoardState: enemydata.boardState, freeShot: false, playerModifier, enemyModifier })
                    if (bluffing) playerdata.bluffing = true
                    if (playerdata.bluffing) playerdata.bluffArray = playerdata.bluffArray ? [...playerdata.bluffArray, index] : [index]
                    //protected squares
                    //bluffing/wasbluffing
                    //retalitation activated
                    //bluffarray array of bluffed shots
                }
                // if (enemydata.bluffing) {
                //     playerModifier = { ...playerModifier, bluff: true }
                // }
                if (!freeshot) {
                    userData[message.id].turn = false
                    userData[groups[message.id]].turn = true
                }
                if (Array.isArray(index)) {
                    const shotresults = { missed: [], hit: [] }
                    for (const shot of index) {
                        if (enemydata.targets.includes(shot)) {
                            enemydata.boardState[shot].state = 'hit'
                            shotresults.hit.push(shot)
                        } else {
                            shotresults.missed.push(shot)
                            enemydata.boardState[shot].state = 'missed'
                        }
                    }
                    const allHits = Object.values(enemydata.boardState).filter((item) => {
                        return item.state === 'hit'
                    }).map((el) => Number(el.id))
                    for (const boat in enemydata.boatPlacements) {
                        if (!enemydata.boatPlacements[boat].sunk && enemydata.boatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                            enemydata.boatPlacements[boat].sunk = true
                            shipsSunk.push(boat)
                            if (0) { //all ships sunk send win type message

                            }
                        }
                    }

                    wscodes[message.id].send(JSON.stringify({ you: true, shotresults, ...playerModifier, array: true }))
                    wscodes[groups[message.id]].send(JSON.stringify({ shotresults, ...enemyModifier, array: true }))
                } else if (enemydata.targets.includes(index)) {
                    enemydata.boardState[index].state = 'hit'
                    if (cornershot) {
                        const allHits = Object.values(enemydata.boardState).filter((item) => {
                            return item.state === 'hit'
                        }).map((el) => Number(el.id))
                        for (const boat in enemydata.boatPlacements) {
                            if (!enemydata.boatPlacements[boat].sunk && allHits.includes(enemydata.boatPlacements[boat].positions[0]) && allHits.includes(enemydata.boatPlacements[boat].positions[enemydata.boatPlacements[boat].positions.length - 1])) {
                                enemydata.boatPlacements[boat].sunk = true
                                index = [...enemydata.boatPlacements[boat].positions]
                                shipsSunk.push(boat)
                                if (0) { //all ships sunk send win type message

                                }
                            }
                        }

                    } else {
                        const allHits = Object.values(enemydata.boardState).filter((item) => {
                            return item.state === 'hit'
                        }).map((el) => Number(el.id))
                        for (const boat in enemydata.boatPlacements) {
                            if (!enemydata.boatPlacements[boat].sunk && enemydata.boatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                                enemydata.boatPlacements[boat].sunk = true
                                shipsSunk.push(boat)
                                if (0) { //all ships sunk send win type message

                                }
                            }
                        }

                    }
                    if (bluffing) {
                        wscodes[message.id].send(JSON.stringify({ you: true, index, ...playerModifier }))
                    } else
                        wscodes[message.id].send(JSON.stringify({ you: true, hit: true, index, shipsSunk, ...playerModifier }))
                    wscodes[groups[message.id]].send(JSON.stringify({ hit: true, index, shipsSunk, ...enemyModifier }))
                } else if (!enemydata.targets.includes(index)) {
                    enemydata.boardState[index].state = 'missed'
                    if (bluffing) {
                        wscodes[message.id].send(JSON.stringify({ you: true, index, ...playerModifier }))
                    } else
                        wscodes[message.id].send(JSON.stringify({ you: true, missed: true, index, shipsSunk, ...playerModifier }))
                    wscodes[groups[message.id]].send(JSON.stringify({ missed: true, index, shipsSunk, ...enemyModifier }))
                }
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
                findGroup(groups, message.id, message.name, message.character)
            }
        }
    });


});




