const Cookies = require('universal-cookie');
const uuid = require('uuid');
const { WebSocketServer } = require('ws');
const fs = require("fs");
const HttpsServer = require('https').createServer;

const { normalSinkCheck, cornerSinkCheck } = require('./boatSinkCheck');
const callBluff = require('./callBluff');
const genericTurnAction = require('./genericTurnAction');
const handleOrange = require('./handleOrange');
const placementTimer = require('./placementTimer');
const reconnectTimer = require('./reconnectTimer');
const retaliation = require('./retaliation');

// const server = HttpsServer({
//     cert: fs.readFileSync('/etc/pki/tls/certs/domain.cert.pem'),
//     key: fs.readFileSync('/etc/pki/tls/private/private.key.pem')
// })
// const wss = new WebSocketServer({ server });
// server.listen(8080)

const wss = new WebSocketServer({ port: 8080 });


const groups = {} // {id:opponentid, opponentid:id}
const games = {
    1: { disconnected: true, disconnectreason: "placement time ran out", winner: "harry", loser: "bilbo saggins", state: "finished" },
    2: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    12: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    22: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    3222: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    24: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    23: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    2321: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    92: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    72: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    62: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    82: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    76452: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    542: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    342: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    462: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    7542: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    23321: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    432: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    46312: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    64342: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    322: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    5632: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    5422: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    65432: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    265342: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    4322: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    4112: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    3562: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    3212: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    56232: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    65642: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    25231: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    3422: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    5342: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    64532: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    32152: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },
    2765: { winner: "harry", loser: "bilbo saggins", state: "finished", winnerCharacter: 'lineman', loserCharacter: 'cornerman' },

} //gameId: {state: 'ongoing', players:[id1, id2], player1:name, player2:name }
const wscodes = {} //{id: ws}
const userData = {} //{id:{gameinformation}}
const userInfo = {}//{id:{userinformation}}
const opengames = {}
const joinLobby = ({ id, lobbyId, character, name, boatnames }) => { // code based matching

    userInfo[id] = { ...userInfo[id], name, character, boatnames }

    groups[opengames[lobbyId].id] = id
    groups[id] = opengames[lobbyId].id

    delete opengames[lobbyId]
    delete userInfo[groups[id]].hostingLobby
    let playerinfo = userInfo[id]
    let enemyinfo = userInfo[groups[id]]
    wscodes[id].send(JSON.stringify({ codematch: true, matched: true, enemyinfo, time: 60, character: playerinfo.character }))
    wscodes[groups[id]].send(JSON.stringify({ matched: true, enemyinfo: playerinfo, time: 60, character: enemyinfo.character }))
    const gameId = uuid.v4()
    games[gameId] = { state: 'placement', player1: playerinfo.name, player2: enemyinfo.name, player1character: playerinfo.character, player2character: enemyinfo.character }
    playerinfo.currentGame = gameId
    enemyinfo.currentGame = gameId
    placementTimer({ userData, userInfo, groups, games, id, wscodes })
}

const findGroup = ({ groups, id, name, character, boatnames }) => {
    userInfo[id] = { ...userInfo[id], name, character, boatnames }
    let matchID = Object.entries(groups).find((group) => group[1] === null)
    if (matchID) matchID = matchID[0]
    if (matchID && matchID !== id && ((character === 'default' && userInfo[matchID].character === 'default') || (character !== 'default' && userInfo[matchID].character !== 'default'))) {
        groups[matchID] = id
        groups[id] = matchID
        let playerinfo = userInfo[id]
        let enemyinfo = userInfo[groups[id]]
        wscodes[id].send(JSON.stringify({ matched: true, character: playerinfo.character, enemyinfo, time: 60 }))
        wscodes[groups[id]].send(JSON.stringify({ matched: true, character: enemyinfo.character, enemyinfo: playerinfo, time: 60 }))
        const gameId = uuid.v4()
        games[gameId] = { state: 'placement', players: [id, groups[id]], player1: playerinfo.name, player2: enemyinfo.name, player1character: playerinfo.character, player2character: enemyinfo.character }
        playerinfo.currentGame = gameId
        enemyinfo.currentGame = gameId
        placementTimer({ userData, userInfo, groups, games, id, wscodes })
    } else {
        groups[id] = null
    }
}


// Server startup
wss.on('listening', () => {
    const { address, port } = wss.address()
    console.log(`server listening on ${address}:${port}`)
});

wss.on('connection', (ws) => {
    const cookieHandler = (data) => {
        console.log(JSON.parse(data))
        let id = JSON.parse(data)?.id;
        // if (!id) return
        // cookie data was received
        console.log('userinfo', userInfo[id], 'data', id)
        console.log(!userInfo[id])
        if (!userInfo[id] || !id) {
            do { id = uuid.v4() } while (groups.hasOwnProperty(id));
            userInfo[id] = {}  // placeholder

            console.log('new user', id);

            ws.send(JSON.stringify({
                cookies: {
                    'id': { id }
                }
            }));
        }


        wss.emit('genuine connection', ws, id);
    }

    ws.once('message', cookieHandler);
});

// id:(their id) : groups
//userdata[groups[your id]]
// When a new websocket connection is established id:{ boatPlacements: message.boatPlacements, targets: message.targets, boardState: message.boardState }
wss.on('genuine connection', (ws, id) => {

    wscodes[id] = ws



    // create new user
    if (games[userInfo[id]?.currentGame]?.state === 'ongoing') {
        clearTimeout(userInfo[id].disconnectTimerCode)
        delete userInfo[id].disconnectTimerCode
        let time, playerTimer, enemyTimer
        if (!userInfo[groups[id]].disconnectTimerCode) { //this is just a hacky fix for the react dev double render functionality
            if (userData[id].wasTurn) {
                userData[id].turn = true
                delete userData[id].wasTurn
                reconnectTimer({ id, userInfo, games, wscodes, groups, userData })//if your turn
            } else if (userData[groups[id]].wasTurn) {
                reconnectTimer({ id: groups[id], userInfo, games, wscodes, groups, userData })
                userData[groups[id]].turn = true
                delete userData[groups[id]].wasTurn
            }
            if (userData[id].turn) {
                playerTimer = 1
                enemyTimer = 2
                time = Math.floor((userData[id].timer.remaining - 2000) / 1000)
            } else {
                playerTimer = 2
                enemyTimer = 1
                time = Math.floor((userData[groups[id]].timer.remaining - 2000) / 1000)
            }
        }
        wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', time, messagetype: 'reconnect', timer: enemyTimer, turn: userData[groups[id]].turn }))
        let enemyInfo = userInfo[groups[id]]
        let enemyBoardState = JSON.parse(JSON.stringify(userData[groups[id]].boardState))
        for (const sq in enemyBoardState) {
            if (enemyBoardState[sq].state === 'mine') enemyBoardState[sq].state = null
        }
        if (userInfo[id].character === 'orangeman') {
            for (const sq of userData[id].bluffArray || []) {
                enemyBoardState[sq].state = 'guess'
            }
        }
        const data = { ...userData[id], timer: playerTimer }
        ws.send(JSON.stringify({
            for: 'player', time, messagetype: 'reconnect',
            info: { enemyInfo: { name: enemyInfo.name, character: enemyInfo.character }, ...userInfo[id] },
            data: { enemyBoardState, ...data }
        }))
    } else if (games[userInfo[id].currentGame]?.state === 'placement') {
        wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', messagetype: 'reconnect' }))
        let enemyInfo = userInfo[groups[id]]
        let boardState
        if (userData[id]?.boardState) boardState = { boardState: userData[id].boardState }
        ws.send(JSON.stringify({ for: 'player', timer: 1, time: Math.floor((userData[id]?.timer?.remaining) / 1000), messagetype: 'reconnect', info: { enemyInfo, ...userInfo[id], }, ...boardState }))
    } else if (games[userInfo[id].currentGame]?.state === 'finished') {
        ws.send(JSON.stringify({ issue: 'reconnectAfterDisconnect' }))
    } else {

    }

    // update user socket

    ws.on('close', (code, reason) => {
        if (code === 1001 && (games[userInfo[id]?.currentGame]?.state === 'ongoing')) {
            if (userData[id]?.timer?.code) {
                clearTimeout(userData[id].timer.code)
                userData[id].timer.remaining = userData[id].timer.time - Date.now()
                delete userData[id].timer.code
            } else if (userData[groups[id]]?.timer?.code) {
                clearTimeout(userData[groups[id]].timer.code)
                userData[groups[id]].timer.remaining = userData[groups[id]].timer.time - Date.now()
                delete userData[groups[id]].timer.code
            }
            if (userData[id].turn || userData[id].wasTurn) userData[id].wasTurn = true
            else userData[groups[id]].wasTurn = true
            userData[id].turn = false
            userData[groups[id]].turn = false
            console.log(id, 'closed')
            if (groups[id] && (games[userInfo[id].currentGame].state === 'ongoing')) {
                wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', time: 60, messagetype: 'disconnect' }))
                userInfo[id].disconnectTimerCode = setTimeout(() => {
                    games[userInfo[id].currentGame] = {
                        state: 'finished', winnerId: id, loserId: groups[id],
                        winner: userInfo[id].name, loser: userInfo[groups[id]].name,
                        winnerCharacter: userInfo[id].character, loserCharacter: userInfo[groups[id]].character,
                        disconnected: true, disconnectreason: 'they disconnected from server'
                    }
                    wscodes[groups[id]].send(JSON.stringify({ for: 'player', win: true, hasDisconnected: true, hasLeft: true }))
                    delete userData[groups[id]]
                    delete userData[id]
                    delete groups[groups[id]]
                    delete groups[id]
                }, 60000)
            }
        } else if (games[userInfo[id]?.currentGame]?.state === 'placement') {
            if (userData[id]?.timer?.code) userData[id].timer.remaining = userData[id].timer.time - Date.now()
        } else if (games[userInfo[id].currentGame]?.state === 'finished') {
            if (wscodes[groups[id]]) wscodes[groups[id]].send(JSON.stringify({ issue: 'disconnect' }))
            delete groups[groups[id]]
            delete groups[id]
        }
    })

    ws.on('message', (message) => {
        message = JSON.parse(message)
        if (message.type === 'joingame') {
            const { lobbyId, character, name, boatnames } = message
            if (id === opengames[message.lobbyId].id) return
            if (opengames[message.lobbyId] && !opengames[message.lobbyId].privacy) {
                if (opengames[message.lobbyId].type === 'default' && character !== 'default') return
                joinLobby({ id, lobbyId, character, name, boatnames })
            } else if (opengames[message.lobbyId].privacy) {
                if (message.password === opengames[message.lobbyId].password) {
                    joinLobby({ id, lobbyId, character, name, boatnames })
                } else {
                    ws.send(JSON.stringify({ id: lobbyId, issue: 'wrong password' }))
                }
            }
        }
        if (message.request) {
            if (message.request === 'games') {
                ws.send(JSON.stringify({ games }))
            } else if (message.request === 'opengames') {
                const noIdOpenGames = Object.fromEntries(Object.entries(opengames).map(item => {
                    item[1] = {
                        name: item[1].name,
                        lobbyId: item[1].lobbyId,
                        type: item[1].type,
                        privacy: item[1].privacy
                    }
                    return item
                }))
                ws.send(JSON.stringify({ opengames: noIdOpenGames }))
            }
        }
        // console.log(message)
        if (!message.shot) console.log(message)
        const enemydata = userData[groups[id]]
        const playerdata = userData[id]
        const playerinfo = userInfo[id]
        const enemyinfo = userInfo[groups[id]]
        //need a function here which checks if you can do whatever you are trying to
        if (groups[id]) {
            if (message.newgame) {
                wscodes[groups[id]].send(JSON.stringify({ hasLeft: true }))
                delete playerinfo.lookingForRematch
                delete enemyinfo.lookingForRematch
                delete groups[groups[id]]
                delete groups[id]
            }
            if (message.chat) {
                wscodes[groups[id]].send(JSON.stringify({ chat: message.chat }))
                wscodes[id].send(JSON.stringify({ chat: message.chat }))
            }
            if (message.rematch) {
                if (enemyinfo.lookingForRematch === id) {
                    delete enemyinfo.lookingForRematch
                    games[playerinfo.currentGame] = { info: 'rematch', state: 'placement', players: [id, groups[id]], player1: playerinfo.name, player2: enemyinfo.name, player1character: playerinfo.character, player2character: enemyinfo.character }

                    wscodes[id].send(JSON.stringify({ rematchAccepted: true, enemyinfo, time: 60 }))
                    wscodes[groups[id]].send(JSON.stringify({ rematchAccepted: true, enemyinfo: playerinfo, time: 60 }))
                    placementTimer({ userData, userInfo, groups, games, id, wscodes })
                    return
                }
                if (playerinfo.lookingForRematch !== groups[id]) {
                    playerinfo.lookingForRematch = groups[id]
                    wscodes[groups[id]].send(JSON.stringify({ lookingForRematch: true }))
                }
            }

            if (message.callbluff) {
                if (playerdata?.turn) {
                    callBluff({ id, userInfo, games, wscodes, groups, userData })
                    return
                }
            }
            if (message.shot) {
                if (playerdata?.turn) {
                    let { index } = message
                    if (playerinfo.character === 'lineman') {
                        if ((message.twoShot || message.shootline) && playerdata.charges < 1) return // this and the line below prevent illegal behavior
                        else if (message.shootline && (index[1] - index[0] !== 1 && index[1] - index[0] !== 10)) return
                        else if (message.twoShot && !playerdata.twoShots) return

                    }
                    if (playerinfo.character === 'orangeman') {
                        if (message.retaliation && playerdata.bluffing !== 'ready') return // prevents using ability if not in the proper state
                    }
                    let { playerModifier, enemyModifier } = genericTurnAction({ id, userInfo, games, wscodes, groups, userData })
                    const { bluffing } = message
                    let shotresults = { missed: [], hit: [] }
                    if (playerinfo.character === 'lineman') {

                        if (message.twoShot) index = playerdata.twoShots
                        if (message.twoShot || message.shootline) {
                            playerdata.charges -= 1
                            playerModifier = { ...playerModifier, charges: playerdata.charges }
                        }
                    } else if (playerinfo.character === 'orangeman') {
                        const { bluffing, orange } = message
                        enemyModifier = { ...enemyModifier, ...(orange && { orange }) }
                        playerModifier = { ...playerModifier, ...(orange && { orange }) }
                        if (message.retaliation) {
                            //you need to unsink boats sunk while bluffing
                            index = retaliation({ playerdata, enemydata })
                            // shotresults.null = [...playerdata.bluffArray]
                            playerModifier = { ...playerModifier, bluffing: 'fired' }
                            playerdata.bluffing = 'fired'
                        }
                        //orange active passive ability trigger on use
                        if (orange) {
                            let orangeShotResults = handleOrange({ index, playerdata, extrashot: playerModifier.extrashot, bluffing })
                            playerModifier = { ...playerModifier, orangeShotResults: { ...orangeShotResults } }
                            let enemyOrangeResults = { ...orangeShotResults }
                            enemyOrangeResults.null = [...enemyOrangeResults.mine || [], ...enemyOrangeResults.null || []]
                            delete enemyOrangeResults.mine
                            enemyModifier = { ...enemyModifier, enemyOrangeResults }
                        }
                    }
                    //updates enemy powers
                    if (enemyinfo.character === 'lineman') {
                        enemydata.twoShots = enemydata.twoShots ? [index[0], ...enemydata.twoShots] : index
                        if (enemydata.twoShots.length > 2) enemydata.twoShots.pop()
                        enemyModifier = { ...enemyModifier, twoShots: enemydata.twoShots }
                    } else if (enemyinfo.character === 'orangeman') {
                        if (enemydata.bluffing === 'bluffing') {
                            enemydata.bluffing = 'ready'
                            enemyModifier = { ...enemyModifier, bluffing: 'ready' }
                        }
                    }
                    //hit logic
                    for (const shot of index) {
                        if (enemydata.targets.includes(shot)) {
                            enemydata.boardState[shot].state = 'hit'
                            shotresults.hit.push(shot)
                        } else {
                            shotresults.missed.push(shot)
                            enemydata.boardState[shot].state = 'missed'
                        }
                    }
                    //sink logic + extra conditions and output for character
                    if (playerinfo.character === 'cornerman') {
                        let { shipsSunk, hits } = cornerSinkCheck({ enemydata })
                        if (hits) shotresults = { ...shotresults, hit: [...hits] } // this adds the additional shots which are added when cornershot hits the head and rear of a boat
                        enemyModifier = { ...enemyModifier, shipsSunk, cornershot: true }
                        playerModifier = { ...playerModifier, shipsSunk, cornershot: true }
                    } else {
                        let { shipsSunk } = normalSinkCheck({ enemydata })
                        enemyModifier = { ...enemyModifier, shipsSunk, }
                        playerModifier = { ...playerModifier, shipsSunk }
                    }
                    //win check
                    if (playerModifier.shipsSunk.length > 0) {
                        if (Object.values(enemydata.boatPlacements).filter(i => i.sunk).length === 4) { //all ships sunk send win type message
                            clearTimeout(userData[groups[id]]?.timer?.code)
                            clearTimeout(userData[id]?.timer?.code)
                            games[playerinfo.currentGame] = {
                                state: 'finished', winnerId: id, loserId: groups[id],
                                winner: playerinfo.name, loser: enemyinfo.name,
                                winnerCharacter: playerinfo.character, loserCharacter: enemyinfo.character,
                                boatsleft: 4 - Object.values(playerdata.boatPlacements).filter(i => i.sunk).length
                            }
                            delete userData[groups[id]]
                            delete userData[id]
                            //  {state: 'ongoing', players:[id1, id2], player1:name, player2:name }

                            enemyModifier = { ...enemyModifier, loss: true, }
                            playerModifier = { ...playerModifier, win: true }
                        }
                    }
                    if (bluffing === 'bluffing' || bluffing === 'ready') {
                        wscodes[id].send(JSON.stringify({ shotresults: { guess: index }, bluffing, ...playerModifier }))
                    } else
                        wscodes[id].send(JSON.stringify({ shotresults, ...playerModifier }))
                    wscodes[groups[id]].send(JSON.stringify({ shotresults, ...enemyModifier }))
                }
            }
            if (message.boatdata && games[userInfo[id].currentGame].state === 'placement') {
                let charges, bluffing
                if (userInfo[id].character === 'lineman') charges = { charges: 4 }
                if (userInfo[id].character === 'orangeman') bluffing = { bluffing: false }
                clearTimeout(userData[id]?.timer?.code)
                delete userData[id].timer
                if (userData[id]) delete userData[id]
                userData[id] = {
                    boatPlacements: message.boatPlacements,
                    targets: message.targets,
                    boardState: message.boardState,
                    ...charges,
                    ...bluffing
                }
                if (userData[id].boatPlacements && userData[groups[id]].boatPlacements) {
                    games[playerinfo.currentGame].state = 'ongoing'
                    if (Math.random() > 0.5) {
                        userData[groups[id]].turnNumber = 2
                        userData[id].turnNumber = 0
                        userData[id].turn = true
                        userData[groups[id]].turn = false

                        userData[id].timer = {}
                        userData[id].timer.time = Date.now() + 22000
                        userData[id].timer.code = setTimeout(() => {
                            games[userInfo[id].currentGame] = {
                                state: 'finished', winnerId: groups[id], loserId: id,
                                winner: userInfo[groups[id]].name, loser: userInfo[id].name,
                                winnerCharacter: userInfo[groups[id]].character, loserCharacter: userInfo[id].character,
                                disconnected: true, disconnectreason: 'turn time ran out'
                            }
                            wscodes[groups[id]].send(JSON.stringify({ for: 'player', win: true, hasDisconnected: true }))
                            wscodes[id].send(JSON.stringify({ for: 'opponent', loss: true, hasDisconnected: true }))
                            delete userData[id]
                            delete userData[groups[id]]
                        }, 22000)
                    } else {
                        userData[groups[id]].turnNumber = 0
                        userData[id].turnNumber = 2
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
                    wscodes[id].send(JSON.stringify({
                        turnNumber: 0,
                        enemyTurnNumber: 2,
                        boatsreceived: true,
                        turn: userData[id].turn,
                        ...charges,
                        ...bluffing,
                        time: 20,
                        character: userInfo[id].character
                    }))
                    wscodes[groups[id]].send(JSON.stringify({
                        turnNumber: 2,
                        enemyTurnNumber: 0,
                        boatsreceived: true,
                        turn: userData[groups[id]].turn,
                        ...charges,
                        ...bluffing,
                        time: 20,
                        character: userInfo[groups[id]].character
                    }))
                } else {
                    ws.send(JSON.stringify({ boatssent: true }))
                }
                return
            }
        }
        if (message.state === 'matching') {
            if (groups[id]) console.log('id present  ' + groups[id])
            if ((!groups.hasOwnProperty(id) || message.character !== userInfo[id].character) && !message.creategame) {
                findGroup({ groups, id: id, name: message.name, character: message.character, boatnames: message.boatNames })
            } else if (message.privacy && message.creategame && !userInfo[id].hostingLobby) { // code based matching
                const lobbyId = uuid.v4() //currentgame = code
                opengames[lobbyId] = {
                    id,
                    lobbyId,
                    privacy: true,
                    name: message.name,
                    type: message.character === 'default' ? 'default' : 'character',
                    password: message.password
                }
                userInfo[id] = {
                    ...userInfo[id], name: message.name,
                    character: message.character,
                    boatnames: message.boatNames,
                    hostingLobby: true
                }
            } else if (message.creategame && !userInfo[id].hostingLobby) {
                console.log('creategame')
                const lobbyId = uuid.v4() //currentgame = code
                opengames[lobbyId] = {
                    id,
                    lobbyId,
                    name: message.name,
                    type: message.character === 'default' ? 'default' : 'character',
                }
                userInfo[id] = {
                    ...userInfo[id], name: message.name,
                    character: message.character,
                    boatnames: message.boatNames,
                    hostingLobby: true
                }
            }
        }
    });
});




