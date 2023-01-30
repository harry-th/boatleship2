const Cookies = require('universal-cookie');
const uuid = require('uuid');
const { WebSocketServer } = require('ws');
const { normalSinkCheck, cornerSinkCheck } = require('./boatSinkCheck');
const callBluff = require('./callBluff');
const genericTurnAction = require('./genericTurnAction');
const handleOrange = require('./handleOrange');
const retaliation = require('./retaliation');

const wss = new WebSocketServer({ port: 8080, ssl: true });

const groups = {} // {id:opponentid, opponentid:id}
const games = {} //gameId: {state: 'ongoing', players:[id1, id2], player1:name, player2:name }
const wscodes = {} //{id: ws}
const userData = {} //{id:{gameinformation}}
const userInfo = {}//{id:{userinformation}}

const findGroup = ({ groups, id, name, character, boatnames }) => {
    userInfo[id] = { ...userInfo[id], name, character, boatnames }
    let matchID = Object.entries(groups).find((group) => group[1] === null)
    if (matchID) {
        groups[matchID[0]] = id
        groups[id] = matchID[0]
        let playerinfo = userInfo[id]
        let enemyinfo = userInfo[groups[id]]
        wscodes[id].send(JSON.stringify({ matched: true, enemyinfo }))
        wscodes[matchID[0]].send(JSON.stringify({ matched: true, enemyinfo: playerinfo }))
        const gameId = uuid.v4()
        games[gameId] = { state: 'placement', players: [id, groups[id]], player1: playerinfo.name, player2: enemyinfo.name }
        playerinfo.currentGame = gameId
        enemyinfo.currentGame = gameId
    } else {
        groups[id] = null
    }
}


// Server startup
wss.on('listening', () => {
    const { address, port } = wss.address()
    console.log(`server listening on ${address}:${port}`)
});
// id:(their id) : groups
//userdata[groups[your id]]
// When a new websocket connection is established id:{ boatPlacements: message.boatPlacements, targets: message.targets, boardState: message.boardState }
wss.on('connection', (ws, req) => {
    const cookies = new Cookies(req.headers.cookie)
    let id = cookies?.get('user')?.id
    ws.send(JSON.stringify(games))
    // create new user
    if (!userInfo[id]) {
        // generate a unique user id
        do { id = uuid.v4() } while (groups[id])

        userInfo[id] = {}  // placeholder
        ws.send(JSON.stringify({
            cookies: {
                'user': { id, state: 'matching', wins: 0, losses: 0 }
            }
        }))

        console.log('new user:', id)
    }
    else if (groups[id]) {
        wscodes[id] = ws
        wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', messagetype: 'reconnect' }))
        let enemyInfo = userInfo[groups[id]]
        if (games[userInfo[id].currentGame].state === 'ongoing') {
            let enemyBoardState = JSON.parse(JSON.stringify(userData[groups[id]].boardState))
            for (const sq in enemyBoardState) {
                if (enemyBoardState[sq].state === 'mine') enemyBoardState[sq].state = null
            }
            if (userInfo[id].character === 'orangeman') {
                for (const sq of userData[id].bluffArray || []) {
                    enemyBoardState[sq].state = 'guess'
                }
            }
            ws.send(JSON.stringify({ for: 'player', messagetype: 'reconnect', info: { enemyInfo, ...userInfo[id] }, data: { enemyBoardState, ...userData[id] } }))
        } else if (games[userInfo[id].currentGame].state === 'placement') {
            let boardState
            if (userData[id]?.boardState) boardState = { boardState: userData[id].boardState }
            ws.send(JSON.stringify({ for: 'player', messagetype: 'reconnect', info: { enemyInfo, ...userInfo[id], }, ...boardState }))
        }
    }
    // update user socket
    wscodes[id] = ws

    ws.on('close', (code, reason) => {
        if (code === 1001) {
            console.log(id, 'closed')
            if (groups[id]) {
                wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', messagetype: 'disconnect' }))
            }
        }
    })

    ws.on('message', (message) => {
        message = JSON.parse(message)
        console.log(message)

        const enemydata = userData[groups[id]]
        const playerdata = userData[id]
        const playerinfo = userInfo[id]
        const enemyinfo = userInfo[groups[id]]
        //need a function here which checks if you can do whatever you are trying to
        if (groups[id]) {
            if (message.newgame) {
                wscodes[groups[id]].send(JSON.stringify({ hasLeft: true }))
                delete groups[groups[id]]
                delete groups[id]
                delete playerinfo.lookingForRematch
            }
            if (message.chat) {
                wscodes[groups[id]].send(JSON.stringify({ chat: message.chat }))
                wscodes[id].send(JSON.stringify({ chat: message.chat }))
            }
            if (message.rematch) {
                if (enemyinfo.lookingForRematch) {
                    delete enemyinfo.lookingForRematch
                    wscodes[id].send(JSON.stringify({ rematchAccepted: true, enemyinfo }))
                    wscodes[groups[id]].send(JSON.stringify({ rematchAccepted: true, enemyinfo: playerinfo }))
                    return
                }
                if (!playerinfo.lookingForRematch) {
                    playerinfo.lookingForRematch = true
                    wscodes[groups[id]].send(JSON.stringify({ lookingForRematch: true }))
                }
            }
            if (message.callbluff) {
                callBluff({ playerdata, enemydata, playerAddress: wscodes[id], enemyAddress: wscodes[groups[id]] })
                return
            }
            if (message.shot) {
                if (playerdata.turn) {
                    let { index, cornershot } = message
                    if (playerinfo.character === 'lineman') {
                        if ((message.twoShot || message.shootline) && playerdata.charges < 1) return
                        else if (message.shootline && (index[1] - index[0] !== 1 && index[1] - index[0] !== 10)) return
                    }
                    if (playerinfo.character === 'orangeman') {
                        if (message.retaliation && playerdata.bluffing !== 'ready') return
                    }
                    let { playerModifier, enemyModifier } = genericTurnAction({ playerdata, enemydata })
                    const { bluffing } = message
                    let shotresults = { missed: [], hit: [] }
                    if (playerinfo.character === 'lineman') {
                        if (message.twoShot || message.shootline) {
                            playerdata.charges -= 1
                            playerModifier = { ...playerModifier, charges: playerdata.charges }
                        }
                        if (message.twoShot && playerdata.charges) index = playerdata.twoShots
                        else if (message.twoShot && playerdata.charges < 1) index = []
                    } else if (playerinfo.character === 'orangeman') {
                        const { bluffing, orange } = message
                        enemyModifier = { ...enemyModifier, ...(orange && { orange: orange }) }
                        playerModifier = { ...playerModifier, ...(orange && { orange: orange }) }
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
                            playerModifier = { ...playerModifier, orangeShotResults }
                            let enemyOrangeResults = { ...orangeShotResults }
                            enemyOrangeResults.null = [...enemyOrangeResults.mine || [], ...enemyOrangeResults.null || []]
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
                    console.log(index)
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
                    if (cornershot && playerinfo.character === 'cornerman') {
                        let { shipsSunk, hits } = cornerSinkCheck({ enemydata })
                        if (hits) shotresults = { ...shotresults, hit: [...hits] }
                        enemyModifier = { ...enemyModifier, shipsSunk, cornershot }
                        playerModifier = { ...playerModifier, shipsSunk, cornershot }
                    } else {
                        let { shipsSunk } = normalSinkCheck({ enemydata })
                        enemyModifier = { ...enemyModifier, shipsSunk, }
                        playerModifier = { ...playerModifier, shipsSunk }
                    }
                    //win check
                    if (playerModifier.shipsSunk.length > 0) {
                        if (Object.values(enemydata.boatPlacements).filter(i => i.sunk).length === 4) { //all ships sunk send win type message
                            games[playerinfo.currentGame] = {
                                state: 'finished', winnerId: id, loserId: groups[id],
                                winner: playerinfo.name, loser: enemyinfo.name,
                                winnerCharacter: playerinfo.character, loserCharacter: enemyinfo.character
                            }
                            delete userData[groups[id]]
                            delete userData[id]
                            //  {state: 'ongoing', players:[id1, id2], player1:name, player2:name }
                            const win = { win: true }
                            const loss = { loss: true }
                            enemyModifier = { ...enemyModifier, loss, }
                            playerModifier = { ...playerModifier, win }
                        }
                    }
                    if (bluffing === 'bluffing' || bluffing === 'ready') {
                        wscodes[id].send(JSON.stringify({ shotresults: { guess: index }, bluffing, ...playerModifier }))
                    } else
                        wscodes[id].send(JSON.stringify({ shotresults, ...playerModifier }))
                    wscodes[groups[id]].send(JSON.stringify({ shotresults, ...enemyModifier }))
                }
            }
            if (message.boatdata) {
                let charges, bluffing
                if (userInfo[id].character === 'lineman') charges = { charges: 4 }
                if (userInfo[id].character === 'orangeman') bluffing = { bluffing: false }
                userData[id] = {
                    boatPlacements: message.boatPlacements,
                    targets: message.targets,
                    boardState: message.boardState,
                    ...charges,
                    ...bluffing
                }
                if (Object.keys(userData).includes(id) && Object.keys(userData).includes(groups[id])) {
                    console.log(playerinfo)
                    games[playerinfo.currentGame].state = 'ongoing'
                    if (Math.random() > 0.5) {
                        userData[groups[id]].turnNumber = 2
                        userData[id].turnNumber = 0
                        userData[id].turn = true
                        userData[groups[id]].turn = false
                    } else {
                        userData[groups[id]].turnNumber = 0
                        userData[id].turnNumber = 2
                        userData[id].turn = false
                        userData[groups[id]].turn = true
                    }
                    wscodes[id].send(JSON.stringify({
                        turnNumber: 0,
                        enemyTurnNumber: 2,
                        boatsreceived: true,
                        turn: userData[id].turn,
                        ...charges,
                        ...bluffing
                    }))
                    wscodes[groups[id]].send(JSON.stringify({
                        turnNumber: 2,
                        enemyTurnNumber: 0,
                        boatsreceived: true,
                        turn: userData[groups[id]].turn
                    }))
                }
                return
            }
        }
        if (message.state === 'matching') {
            console.log(!groups.hasOwnProperty(id), 'will reach findGroup')
            if (!groups.hasOwnProperty(id)) {
                findGroup({ groups, id: id, name: message.name, character: message.character, boatnames: message.boatNames })
            }
        }
    });
});




