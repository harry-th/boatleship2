import { useEffect, useRef, useState } from 'react';
import Cookies from 'universal-cookie';

import './App.css';
import Board from './components/Board'
import EnemyBoard from './components/EnemyBoard'
import generateBoard from './helpers/generateBoard';
import Customization from './components/Customization';
// import Endofgame from './components/Endofgame';
import styles from './styles/App.module.css'
import Dashboard from './components/Dashboard';
import useOrangeMan from './characters/useOrangeMan';
import useLineMan from './characters/useLineMan';
import fromYou from './messagelisteners/fromYou';
import fromEnemy from './messagelisteners/toEnemy';
let randomstring = require("randomstring");


const cookies = new Cookies()

function App() {

  let { bluffing, setBluffing, OrangeManUI } = useOrangeMan()
  let { setLastShots, LineManUI, shootLine } = useLineMan()


  const socket = useRef(null);

  const [gameProgress, setGameProgress] = useState('preplacement')
  const [boardState, setBoardState] = useState(generateBoard(true, true))
  const [boatNames, setBoatNames] = useState(['destroyer', 'cruiser', 'battleship', 'carrier'])
  const [messages, setMessages] = useState([])
  const [freeShotMiss, setFreeShotMiss] = useState(sessionStorage.getItem('freeShotMiss') ? JSON.parse(sessionStorage.getItem('freeShotMiss')) : 0)
  const [enemyFreeShotMiss, setEnemyFreeShotMiss] = useState(sessionStorage.getItem('enemyFreeShotMiss') ? JSON.parse(sessionStorage.getItem('enemyFreeShotMiss')) : 0)
  const [turnNumber, setTurnNumber] = useState(sessionStorage.getItem('turnNumber') ? JSON.parse(sessionStorage.getItem('turnNumber')) : 0)
  const [enemyTurnNumber, setEnemyTurnNumber] = useState(turnNumber)

  const [enemyBoardState, setEnemyBoardState] = useState(sessionStorage.getItem('enemyBoardState') ? JSON.parse(sessionStorage.getItem('enemyBoardState')) : generateBoard(true, true))
  // const [enemyName, setEnemyName] = useState(sessionStorage.getItem('enemyName'))

  const [character, setCharacter] = useState(false)

  const [turn, setTurn] = useState(sessionStorage.getItem('turn') ? JSON.parse(sessionStorage.getItem('turn')) : true)
  const [orientation, setOrientation] = useState('h')

  // websocket connection
  // TODO: figure out how to deal with dependencies in `onmessage` without creating a new websocket every time
  // I think there are some issues with having these inside an effect callback
  // https://overreacted.io/a-complete-guide-to-useeffect/

  // socket connect/reconnect
  useEffect(function connect() {
    socket.current = new WebSocket('ws://localhost:8080/ws');

    // attempt reconnect after 1s
    socket.current.onclose = (e) => {
      console.log('Socket closed:', e.reason)
      setTimeout(() => connect(), 1000)
    }

    // close on error
    socket.current.onerror = (e) => {
      console.error('Socket error:', e.code || 'unknown');
      socket.current.close()
    }
  }, [])

  // socket open
  useEffect(() => {
    let ss = { setFreeShotMiss, setTurn, setEnemyFreeShotMiss, setLastShots, setMessages, setBluffing, setEnemyBoardState, setBoardState, setGameProgress }
    let messageListener = (event) => {
      let message = JSON.parse(event.data)
      // console.log(message)
      setTurnNumber(message.turnNumber)
      setEnemyTurnNumber(message.enemyTurnNumber)
      if (message.cookies) {  // set cookies received from server
        Object.entries(message.cookies).forEach(([name, value]) => {
          cookies.set(name, value)
        })
      }
      if (message.twoShots) {
        setLastShots(message.twoShots)
      }
      if (message.for === 'player') {
        fromYou({ message, ss })
        return
      } else if (message.for === 'opponent') {
        fromEnemy({ message, ss })
      }
      if (message.matched) {
        setMessages(prev => {
          return [...prev, `Matched with ${message.name} playing as ${message.character}!`]
        })
        setGameProgress('placement')
        return
      }
      if (message.boatsreceived) {
        if (message.turn) {
          setMessages(prev => {
            return [...prev, 'Game start! you go first!']
          })
        } else {
          setMessages(prev => {
            return [...prev, 'You will go second, freeshot 1 turn earlier...']
          })
        }
        setGameProgress('ongoing')
        setTurn(message.turn)
        console.log('got the boats')
      }
    }
    socket.current.addEventListener('message', messageListener)
    return () => {
      socket.current.removeEventListener('message', messageListener)
    }
  }, [bluffing, setLastShots, setBluffing])

  return (
    <div className={styles.app}>
      <button onClick={() => {
        cookies.remove('user')
        setGameProgress('preplacement')
      }}>remove cookie</button>
      {/* {(socket?.readyState !== undefined && gameProgress === 'preplacement') && <div>connected</div>} */}
      <div className={styles.title}>WELCOME TO BATTLESHIP</div>

      <div className={styles.boardcontainer}>
        {(gameProgress === 'placement' || gameProgress === 'ongoing') ? <>
          {gameProgress === 'placement' && <button
            onClick={() => { orientation === 'v' ? setOrientation('h') : setOrientation('v') }}>
            change boat orientation
          </button>
          }

          <Board player board={boardState} character={character} socket={socket.current}
            boatNames={boatNames} setBoatNames={setBoatNames}
            cookies={cookies} setCookie={cookies.set}
            boardState={boardState} setBoardState={setBoardState}
            enemyBoardState={enemyBoardState}
            orientation={orientation} gameProgress={gameProgress} setGameProgress={setGameProgress}
          />
          <EnemyBoard character={character} board={boardState} enemyBoardState={enemyBoardState} socket={socket}
            cookies={cookies} setCookie={cookies.set} setEnemyBoardState={setEnemyBoardState}
            boardState={boardState} turn={turn} setTurn={setTurn}
            // enemyName={enemyName} 
            setBoardState={setBoardState} gameProgress={gameProgress} setGameProgress={setGameProgress}
            shootLine={shootLine}
            bluffing={bluffing}
          />
          <Dashboard
            messages={messages}
            gameProgress={gameProgress}
            turnNumber={turnNumber}
            enemyTurnNumber={enemyTurnNumber}
            character={character}
            OrangeManUI={OrangeManUI}
            turn={turn}
            setTurn={setTurn}
            socket={socket}
            enemyBoardState={enemyBoardState}
            cookies={cookies}
            setEnemyBoardState={setEnemyBoardState}
            LineManUI={LineManUI}
            setTurnNumber={setTurnNumber}
            boardState={boardState}
            freeShotMiss={freeShotMiss}
            setFreeShotMiss={setFreeShotMiss}
            enemyFreeShotMiss={enemyFreeShotMiss}
            setEnemyFreeShotMiss={setEnemyFreeShotMiss}
          />
        </> : cookies.get('user')?.state === 'matching' ?
          <>
            {/* <button onClick={() => {
              socket.current.send(JSON.stringify({ ...cookies.get('user'), character }))
            }}>find game</button> */}
            <Customization character={character} setCharacter={setCharacter} boatNames={boatNames}
              setBoatNames={setBoatNames} setCookie={cookies.set} cookies={cookies}
              socket={socket} />
          </> :
          <></>
          // <Endofgame gameProgress={gameProgress} setCookie={setCookie} cookies={cookies} setGameProgress={setGameProgress} socket={socket} />
        }
      </div>
    </div>
  )
}

export default App
