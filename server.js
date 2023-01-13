const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080, ssl: true });

const groups = {}
const wscodes = {}
const userData = {}
console.log('server started')

const findGroup = (groups, id, name, character) => {
    for (const group in groups) {
        if (!groups[group]) {
            groups[group] = id
            groups[id] = group
            wscodes[id].send(JSON.stringify({ matched: true }))
            wscodes[group].send(JSON.stringify({ matched: true }))
            return
        }
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
        console.log(message)
        if (message?.id) wscodes[message?.id] = ws
        if (message.shot) {
            const enemydata = userData[groups[message.id]]
            if (enemydata.targets.includes(message.index)) {
                enemydata.boardState[message.index].state = 'hit'
                wscodes[message.id].send(JSON.stringify({ you: true, hit: true, ebs: enemydata.boardState }))
                wscodes[groups[message.id]].send(JSON.stringify({ hit: true, bs: enemydata.boardState }))
            } else {
                enemydata.boardState[message.index].state = 'missed'
                wscodes[message.id].send(JSON.stringify({ you: true, missed: true, ebs: enemydata.boardState }))
                wscodes[groups[message.id]].send(JSON.stringify({ missed: true, bs: enemydata.boardState }))
            }
        }
        if (message.boatdata) {
            userData[message.id] = { boatPlacements: message.boatPlacements, targets: message.targets, boardState: message.boardState }
            if (Object.keys(userData).includes(message.id) && Object.keys(userData).includes(groups[message.id])) {
                wscodes[message.id].send(JSON.stringify({ boatsreceived: true }))
                wscodes[groups[message.id]].send(JSON.stringify({ boatsreceived: true }))
            }
            return
        }
        if (message.state === 'matching') {
            console.log(message)
            if (Object.keys(groups).includes(message.id)) return // could be groups[message.id]
            else {
                findGroup(groups, message.id, message.name, message.character)
            }
        }
    });


});




