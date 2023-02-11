import Cookies from 'universal-cookie';
import { v4 } from 'uuid';
import { WebSocketServer } from 'ws';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

// import { normalSinkCheck, cornerSinkCheck } from './boatSinkCheck';
// import callBluff from './callBluff';
// import genericTurnAction from './genericTurnAction';
// import handleOrange from './handleOrange';
// import reconnectTimer from './reconnectTimer';
// import retaliation from './retaliation';

// TODO: make server secure
// https://stackoverflow.com/questions/31338927/how-to-create-securetls-ssl-websocket-server
const wss = new WebSocketServer({ port: 8080, ssl: true });

const groups = {} // {id:opponentid, opponentid:id}
const games = {} //gameId: {state: 'ongoing', players:[id1, id2], player1:name, player2:name }
const wscodes = {} //{id: ws}
const userData = {} //{id:{gameinformation}}
const userInfo = {}//{id:{userinformation}}


// const findGroup = ({ groups, id, name, character, boatnames }) => {
//   userInfo[id] = { ...userInfo[id], name, character, boatnames }
//   let matchID = Object.entries(groups).find((group) => group[1] === null)
//   if (matchID) {
//     groups[matchID[0]] = id
//     groups[id] = matchID[0]
//     let playerinfo = userInfo[id]
//     let enemyinfo = userInfo[groups[id]]
//     wscodes[id].send(JSON.stringify({ matched: true, enemyinfo }))
//     wscodes[groups[id]].send(JSON.stringify({ matched: true, enemyinfo: playerinfo }))
//     const gameId = v4()
//     games[gameId] = { state: 'placement', players: [id, groups[id]], player1: playerinfo.name, player2: enemyinfo.name }
//     playerinfo.currentGame = gameId
//     enemyinfo.currentGame = gameId
//   } else {
//     groups[id] = null
//   }
// }


// server startup
wss.on('listening', () => {
  const { address, port } = wss.address()
  console.log(`server listening on ${address}:${port}`)
});

// new websocket connection
wss.on('connection', (ws, req) => {
  const cookies = new Cookies(req.headers.cookie);
  let id = cookies?.get('sessionID');

  // WebSocket.send() helper
  ws.sendData = ws.send;
  ws.send = (data) => {
    ws.sendData(JSON.stringify(data));
  };

  // validate user session cookies
  if (!userInfo[id]) {

    // generate a unique user id
    do { id = v4(); } while (groups.hasOwnProperty(id));

    // PLACEHOLDER
    userInfo[id] = {
      name: uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: ' ',
        length: 2,
      }),
    };
    ws.send({ sessionID: id });
    
    console.log('new user:', id);
  } else {
    console.log('existing user:', id);
  }

  // send user info
  ws.send(userInfo[id]);

  // close on error
  ws.addEventListener('error', (e) => {
    ws.close();
  });

  // socket connection closed
  ws.addEventListener('close', (e) => {
    console.log(`closed (${e.code}): ${e.reason}`);

    // TODO: handle disconnect
  });

  // message dispatch
  ws.addEventListener('message', (e) => {
    const message = JSON.parse(e.data);

    console.log(message);

    Object.entries(message).forEach(([type, data]) => {
      ws.emit(type, data);
    });

    // TODO: message dispatch set state

  });


  ws.on('name', (data) => {
    userInfo[id].name = data;
  });

  // else if (games[userInfo[id]?.currentGame]?.state === 'ongoing' || games[userInfo[id]?.currentGame]?.state === 'placement') {
  //   clearTimeout(userInfo[id].disconnectTimerCode)
  //   let time, playerTimer, enemyTimer
  //   delete userInfo[id].disconnectTimerCode
  //   if (!userInfo[groups[id]].disconnectTimerCode) { //this is just a hacky fix for the react dev double render functionality
  //     if (userData[id].wasTurn) {
  //       userData[id].turn = true
  //       delete userData[id].wasTurn
  //       reconnectTimer({ id, userInfo, games, wscodes, groups, userData })//if your turn
  //     } else if (userData[groups[id]].wasTurn) {
  //       reconnectTimer({ id: groups[id], userInfo, games, wscodes, groups, userData })
  //       userData[groups[id]].turn = true
  //       delete userData[groups[id]].wasTurn
  //     }
  //     if (userData[id].turn) {
  //       playerTimer = 1
  //       enemyTimer = 2
  //       time = Math.floor((userData[id].timer.remaining - 2000) / 1000)
  //     } else {
  //       playerTimer = 2
  //       enemyTimer = 1
  //       time = Math.floor((userData[groups[id]].timer.remaining - 2000) / 1000)
  //     }
  //   }
  //   if (games[userInfo[id].currentGame].state === 'ongoing') {
  //     wscodes[id] = ws
  //     wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', time, messagetype: 'reconnect', timer: enemyTimer, turn: userData[groups[id]].turn }))
  //     let enemyInfo = userInfo[groups[id]]
  //     let enemyBoardState = JSON.parse(JSON.stringify(userData[groups[id]].boardState))
  //     for (const sq in enemyBoardState) {
  //       if (enemyBoardState[sq].state === 'mine') enemyBoardState[sq].state = null
  //     }
  //     if (userInfo[id].character === 'orangeman') {
  //       for (const sq of userData[id].bluffArray || []) {
  //         enemyBoardState[sq].state = 'guess'
  //       }
  //     }
  //     const data = { ...userData[id], timer: playerTimer }
  //     ws.send(JSON.stringify({ for: 'player', time, messagetype: 'reconnect', info: { enemyInfo: { name: enemyInfo.name, character: enemyInfo.character }, ...userInfo[id] }, data: { enemyBoardState, ...data } }))
  //   } else if (games[userInfo[id].currentGame].state === 'placement') {
  //     wscodes[id] = ws
  //     wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', messagetype: 'reconnect' }))
  //     let enemyInfo = userInfo[groups[id]]
  //     let boardState
  //     if (userData[id]?.boardState) boardState = { boardState: userData[id].boardState }
  //     ws.send(JSON.stringify({ for: 'player', messagetype: 'reconnect', info: { enemyInfo, ...userInfo[id], }, ...boardState }))
  //   }
  // }
  // // update user socket
  // wscodes[id] = ws

  // ws.on('close', (code, reason) => {
  //   if (code === 1001 && !userInfo[id]?.disconnectTimerCode && (games[userInfo[id]?.currentGame]?.state === 'ongoing' || games[userInfo[id]?.currentGame]?.state === 'placement')) {
  //     if (userData[id]?.timer?.code) {
  //       clearTimeout(userData[id].timer.code)
  //       userData[id].timer.remaining = userData[id].timer.time - Date.now()
  //       delete userData[id].timer.code
  //     } else if (userData[groups[id]]?.timer?.code) {
  //       clearTimeout(userData[groups[id]].timer.code)
  //       userData[groups[id]].timer.remaining = userData[groups[id]].timer.time - Date.now()
  //       delete userData[groups[id]].timer.code
  //     }
  //     if (userData[id].turn || userData[id].wasTurn) userData[id].wasTurn = true
  //     else userData[groups[id]].wasTurn = true
  //     userData[id].turn = false
  //     userData[groups[id]].turn = false
  //     console.log(id, 'closed')
  //     if (groups[id] && (games[userInfo[id].currentGame].state === 'ongoing' || games[userInfo[id].currentGame].state === 'placement')) {
  //       wscodes[groups[id]].send(JSON.stringify({ for: 'opponent', time: 60, messagetype: 'disconnect' }))
  //       userInfo[id].disconnectTimerCode = setTimeout(() => {
  //         games[userInfo[id].currentGame] = {
  //           state: 'finished by timeout', winnerId: id, loserId: groups[id],
  //           winner: userInfo[id].name, loser: userInfo[groups[id]].name,
  //           winnerCharacter: userInfo[id].character, loserCharacter: userInfo[groups[id]].character
  //         }
  //         wscodes[groups[id]].send(JSON.stringify({ for: 'player', win: true, hasDisconnected: true }))
  //         delete userData[groups[id]]
  //         delete userData[id]
  //       }, 60000)
  //     }
  //   }
  // })

  // ws.on('message', (message) => {
  //   message = JSON.parse(message)
  //   // console.log(message)
  //   if (!message.shot) console.log(message)
  //   const enemydata = userData[groups[id]]
  //   const playerdata = userData[id]
  //   const playerinfo = userInfo[id]
  //   const enemyinfo = userInfo[groups[id]]
  //   //need a function here which checks if you can do whatever you are trying to
  //   if (groups[id]) {
  //     if (message.newgame) {
  //       wscodes[groups[id]].send(JSON.stringify({ hasLeft: true }))
  //       delete playerinfo.lookingForRematch
  //       delete enemyinfo.lookingForRematch
  //       delete groups[groups[id]]
  //       delete groups[id]
  //     }
  //     if (message.chat) {
  //       wscodes[groups[id]].send(JSON.stringify({ chat: message.chat }))
  //       wscodes[id].send(JSON.stringify({ chat: message.chat }))
  //     }
  //     if (message.rematch) {
  //       if (enemyinfo.lookingForRematch === id) {
  //         delete enemyinfo.lookingForRematch
  //         wscodes[id].send(JSON.stringify({ rematchAccepted: true, enemyinfo }))
  //         wscodes[groups[id]].send(JSON.stringify({ rematchAccepted: true, enemyinfo: playerinfo }))
  //         return
  //       }
  //       if (playerinfo.lookingForRematch !== groups[id]) {
  //         playerinfo.lookingForRematch = groups[id]
  //         wscodes[groups[id]].send(JSON.stringify({ lookingForRematch: true }))
  //       }
  //     }

  //     if (message.callbluff) {
  //       callBluff({ id, userInfo, games, wscodes, groups, userData })
  //       return
  //     }
  //     if (message.shot) {
  //       if (playerdata.turn) {
  //         let { index, cornershot } = message
  //         if (playerinfo.character === 'lineman') {
  //           if ((message.twoShot || message.shootline) && playerdata.charges < 1) return
  //           else if (message.shootline && (index[1] - index[0] !== 1 && index[1] - index[0] !== 10)) return
  //         }
  //         if (playerinfo.character === 'orangeman') {
  //           if (message.retaliation && playerdata.bluffing !== 'ready') return
  //         }
  //         let { playerModifier, enemyModifier } = genericTurnAction({ id, userInfo, games, wscodes, groups, userData })
  //         const { bluffing } = message
  //         let shotresults = { missed: [], hit: [] }
  //         if (playerinfo.character === 'lineman') {
  //           if (message.twoShot || message.shootline) {
  //             playerdata.charges -= 1
  //             playerModifier = { ...playerModifier, charges: playerdata.charges }
  //           }
  //           if (message.twoShot && playerdata.charges) index = playerdata.twoShots
  //           else if (message.twoShot && playerdata.charges < 1) index = []
  //         } else if (playerinfo.character === 'orangeman') {
  //           const { bluffing, orange } = message
  //           enemyModifier = { ...enemyModifier, ...(orange && { orange: orange }) }
  //           playerModifier = { ...playerModifier, ...(orange && { orange: orange }) }
  //           if (message.retaliation) {
  //             //you need to unsink boats sunk while bluffing
  //             index = retaliation({ playerdata, enemydata })
  //             // shotresults.null = [...playerdata.bluffArray]
  //             playerModifier = { ...playerModifier, bluffing: 'fired' }
  //             playerdata.bluffing = 'fired'
  //           }
  //           //orange active passive ability trigger on use
  //           if (orange) {
  //             let orangeShotResults = handleOrange({ index, playerdata, extrashot: playerModifier.extrashot, bluffing })
  //             playerModifier = { ...playerModifier, orangeShotResults }
  //             let enemyOrangeResults = { ...orangeShotResults }
  //             enemyOrangeResults.null = [...enemyOrangeResults.mine || [], ...enemyOrangeResults.null || []]
  //             enemyModifier = { ...enemyModifier, enemyOrangeResults }
  //           }
  //         }
  //         //updates enemy powers
  //         if (enemyinfo.character === 'lineman') {
  //           enemydata.twoShots = enemydata.twoShots ? [index[0], ...enemydata.twoShots] : index
  //           if (enemydata.twoShots.length > 2) enemydata.twoShots.pop()
  //           enemyModifier = { ...enemyModifier, twoShots: enemydata.twoShots }
  //         } else if (enemyinfo.character === 'orangeman') {
  //           if (enemydata.bluffing === 'bluffing') {
  //             enemydata.bluffing = 'ready'
  //             enemyModifier = { ...enemyModifier, bluffing: 'ready' }
  //           }
  //         }
  //         //hit logic
  //         for (const shot of index) {
  //           if (enemydata.targets.includes(shot)) {
  //             enemydata.boardState[shot].state = 'hit'
  //             shotresults.hit.push(shot)
  //           } else {
  //             shotresults.missed.push(shot)
  //             enemydata.boardState[shot].state = 'missed'
  //           }
  //         }
  //         //sink logic + extra conditions and output for character
  //         if (cornershot && playerinfo.character === 'cornerman') {
  //           let { shipsSunk, hits } = cornerSinkCheck({ enemydata })
  //           if (hits) shotresults = { ...shotresults, hit: [...hits] }
  //           enemyModifier = { ...enemyModifier, shipsSunk, cornershot }
  //           playerModifier = { ...playerModifier, shipsSunk, cornershot }
  //         } else {
  //           let { shipsSunk } = normalSinkCheck({ enemydata })
  //           enemyModifier = { ...enemyModifier, shipsSunk, }
  //           playerModifier = { ...playerModifier, shipsSunk }
  //         }
  //         //win check
  //         if (playerModifier.shipsSunk.length > 0) {
  //           if (Object.values(enemydata.boatPlacements).filter(i => i.sunk).length === 4) { //all ships sunk send win type message
  //             clearTimeout(userData[groups[id]].timer.code)
  //             games[playerinfo.currentGame] = {
  //               state: 'finished', winnerId: id, loserId: groups[id],
  //               winner: playerinfo.name, loser: enemyinfo.name,
  //               winnerCharacter: playerinfo.character, loserCharacter: enemyinfo.character
  //             }
  //             delete userData[groups[id]]
  //             delete userData[id]
  //             //  {state: 'ongoing', players:[id1, id2], player1:name, player2:name }
  //             const win = { win: true }
  //             const loss = { loss: true }
  //             enemyModifier = { ...enemyModifier, loss, }
  //             playerModifier = { ...playerModifier, win }
  //           }
  //         }
  //         if (bluffing === 'bluffing' || bluffing === 'ready') {
  //           wscodes[id].send(JSON.stringify({ shotresults: { guess: index }, bluffing, ...playerModifier }))
  //         } else
  //           wscodes[id].send(JSON.stringify({ shotresults, ...playerModifier }))
  //         wscodes[groups[id]].send(JSON.stringify({ shotresults, ...enemyModifier }))
  //       }
  //     }
  //     if (message.boatdata) {
  //       let charges, bluffing
  //       if (userInfo[id].character === 'lineman') charges = { charges: 4 }
  //       if (userInfo[id].character === 'orangeman') bluffing = { bluffing: false }
  //       if (userData[id]) delete userData[id]
  //       userData[id] = {
  //         boatPlacements: message.boatPlacements,
  //         targets: message.targets,
  //         boardState: message.boardState,
  //         ...charges,
  //         ...bluffing
  //       }
  //       if (Object.keys(userData).includes(id) && Object.keys(userData).includes(groups[id])) {
  //         games[playerinfo.currentGame].state = 'ongoing'
  //         if (Math.random() > 0.5) {
  //           userData[groups[id]].turnNumber = 2
  //           userData[id].turnNumber = 0
  //           userData[id].turn = true
  //           userData[groups[id]].turn = false
  //         } else {
  //           userData[groups[id]].turnNumber = 0
  //           userData[id].turnNumber = 2
  //           userData[id].turn = false
  //           userData[groups[id]].turn = true
  //         }
  //         wscodes[id].send(JSON.stringify({
  //           turnNumber: 0,
  //           enemyTurnNumber: 2,
  //           boatsreceived: true,
  //           turn: userData[id].turn,
  //           ...charges,
  //           ...bluffing
  //         }))
  //         wscodes[groups[id]].send(JSON.stringify({
  //           turnNumber: 2,
  //           enemyTurnNumber: 0,
  //           boatsreceived: true,
  //           turn: userData[groups[id]].turn,
  //           ...charges,
  //           ...bluffing
  //         }))
  //       }
  //       return
  //     }
  //   }
  //   if (message.state === 'matching') {
  //     if (!groups.hasOwnProperty(id)) {
  //       findGroup({ groups, id: id, name: message.name, character: message.character, boatnames: message.boatNames })
  //     }
  //   }
  // });
});
