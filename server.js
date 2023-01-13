const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080, ssl: true });

const groups = {}
const wscodes = {}
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
// When a new websocket connection is established
wss.on('connection', (ws, req) => {

    ws.on('message', (message) => {
        message = JSON.parse(message)

        if (message?.id) wscodes[message?.id] = ws
        if (message.mail) {
            wscodes[groups[message.id]].send(JSON.stringify({ mail: message.mail }))
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




