const Cookies = require('universal-cookie');
const uuid = require('uuid');
const { WebSocketServer } = require('ws');
const { normalSinkCheck, cornerSinkCheck } = require('./boatSinkCheck');
const callBluff = require('./callBluff');
const genericTurnAction = require('./genericTurnAction');
const handleOrange = require('./handleOrange');
const retaliation = require('./retaliation');

const wss = new WebSocketServer({ port: 8080, ssl: true });

const groups = {}
// const games = []{state: 'ongoing', players:[id1, id2], id1:name, id2:name }
const wscodes = {}
const userData = {}
const userInfo = {}

const findGroup = ({ groups, id, name, character, boatnames }) => {
    userInfo[id] = { ...userInfo[id], name, character, boatnames }
    let matchID = Object.entries(groups).find((group) => group[1] === null)
    if (matchID) {
        groups[matchID[0]] = id
        groups[id] = matchID[0]
        let playerinfo = userInfo[id]
        let enemyinfo = userInfo[groups[id]]
        wscodes[id].send(JSON.stringify({ matched: true, ...enemyinfo }))
        wscodes[matchID[0]].send(JSON.stringify({ matched: true, ...playerinfo }))
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

    // create new user
    if (!userInfo[id]) {
        // generate a unique user id
        do { id = uuid.v4() } while (groups[id])

        userInfo[id] = {}  // placeholder
        ws.send(JSON.stringify({
            cookies: {
                'user': { id: id, state: 'matching', wins: 0, losses: 0 }
            }
        }))

        console.log('new user:', id)
    }
    else console.log('existing user:', id)

    // update user socket
    wscodes[id] = ws

    ws.on('close', (code, reason) => {
        // TODO: handle socket close server-side (ex. send 'user disconnected')
    })
    ws.on('message', (message) => {
        message = JSON.parse(message)
        const enemydata = userData[groups[message.id]]
        const playerdata = userData[message.id]

        if (message.callbluff) {
            callBluff({ playerdata, enemydata, playerAddress: wscodes[message.id], enemyAddress: wscodes[groups[message.id]] })
            return
        }
        if (message.shot) {
            console.log(message)
            if (userData[message.id].turn) {
                let { playerModifier, enemyModifier } = genericTurnAction({ playerdata, enemydata })
                let { index, cornershot } = message
                const { bluffing, orange } = message

                enemyModifier = { ...enemyModifier, ...(orange && { orange: orange }) }
                playerModifier = { ...playerModifier, ...(orange && { orange: orange }) }

                if (message.retaliation) {
                    index = retaliation({ playerdata, enemydata })
                    playerModifier = { ...playerModifier, bluffArray: playerdata.bluffArray, retaliation: true }
                    enemyModifier = { ...enemyModifier, bluffArray: playerdata.bluffArray, retaliation: true }
                }
                //updates enemy powers
                if (userInfo[groups[message.id]].character === 'lineman') {
                    enemydata.twoShots = enemydata.twoShots ? [index[0], ...enemydata.twoShots] : [index[0]]
                    if (enemydata.twoShots.length > 2) enemydata.twoShots.pop()
                    enemyModifier = { ...enemyModifier, twoShots: enemydata.twoShots }
                }
                console.log(enemydata.bluffing)
                if (enemydata.bluffing === 'bluffing') {
                    enemydata.bluffing = 'ready'
                    enemyModifier = { ...enemyModifier, bluffing: 'ready' }
                }
                console.log(playerdata.bluffing)
                //orange active passive ability trigger on use
                if (orange) {
                    handleOrange({ index, playerdata, extrashot: playerModifier.extrashot, bluffing })
                }

                //hit logic
                let shotresults = { missed: [], hit: [] }
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
                if (cornershot) {
                    let { shipsSunk, hits } = cornerSinkCheck({ enemydata })
                    if (hits) shotresults = { ...shotresults, hit: [...hits] }
                    enemyModifier = { ...enemyModifier, shipsSunk, cornershot }
                    playerModifier = { ...playerModifier, shipsSunk, cornershot }
                } else {
                    let { shipsSunk } = normalSinkCheck({ enemydata })
                    enemyModifier = { ...enemyModifier, shipsSunk, }
                    playerModifier = { ...playerModifier, shipsSunk }
                }
                if (playerModifier.shipsSunk.length > 0) {
                    if (Object.values(enemydata.boatPlacements).filter(i => i.sunk).length === 4) { //all ships sunk send win type message
                        const win = { win: true }
                        const loss = { loss: true }
                        enemyModifier = { ...enemyModifier, win, }
                        playerModifier = { ...playerModifier, loss }
                    }
                }
                if (bluffing === 'bluffing') {
                    wscodes[message.id].send(JSON.stringify({ ...playerModifier }))
                } else
                    wscodes[message.id].send(JSON.stringify({ shotresults, ...playerModifier }))
                wscodes[groups[message.id]].send(JSON.stringify({ shotresults, ...enemyModifier }))
            }
        }
        if (message.boatdata) {
            userData[message.id] = {
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
                    turnNumber: 0,
                    enemyTurnNumber: 2,
                    boatsreceived: true,
                    turn: userData[message.id].turn
                }))
                wscodes[groups[message.id]].send(JSON.stringify({
                    turnNumber: 2,
                    enemyTurnNumber: 0,
                    boatsreceived: true,
                    turn: userData[groups[message.id]].turn
                }))
            }
            return
        }
        if (message.state === 'matching') {
            if (!groups.hasOwnProperty(id)) {
                findGroup({ groups, id: message.id, name: message.name, character: message.character, boatnames: message.boatNames })
            }
        }
    });
});




