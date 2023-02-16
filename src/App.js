import { useEffect, useRef, useState } from 'react';
import Cookies from 'universal-cookie';

import './App.css';
import Board from './components/Board'
import EnemyBoard from './components/EnemyBoard'
import generateBoard from './helpers/generateBoard';
import Customization from './components/Customization';
import Endofgame from './components/Endofgame';
import styles from './styles/App.module.css'
import Dashboard from './components/Dashboard';
import useOrangeMan from './characters/useOrangeMan';
import useLineMan from './characters/useLineMan';
import fromYou from './messagelisteners/fromYou';
import fromEnemy from './messagelisteners/fromEnemy';
import useTimer from './hooks/timer';
import postGame from './messagelisteners/postGame';
import preGame from './messagelisteners/preGame';
import Games from './components/Games';


const cookies = new Cookies()

function App() {

  const socket = useRef(null);
  const [gameProgress, setGameProgress] = useState('preplacement')
  const [boardState, setBoardState] = useState(() => generateBoard(true, true))
  const [boatNames, setBoatNames] = useState(['destroyer', 'cruiser', 'battleship', 'carrier'])
  const [messages, setMessages] = useState([])
  const [chat, setChat] = useState([])
  const [freeShotMiss, setFreeShotMiss] = useState(0)
  const [enemyFreeShotMiss, setEnemyFreeShotMiss] = useState(0)
  const [turnNumber, setTurnNumber] = useState(0)
  const [enemyTurnNumber, setEnemyTurnNumber] = useState(turnNumber)
  const [enemyBoardState, setEnemyBoardState] = useState(() => generateBoard(true, true))
  const [enemyInfo, setEnemyInfo] = useState({})
  const [character, setCharacter] = useState(false)
  const [turn, setTurn] = useState(true)
  const [orientation, setOrientation] = useState('h')
  const [games, setGames] = useState([])
  const [display, setDisplay] = useState('home')
  const timer = useTimer()
  let { bluffing, setBluffing, OrangeManUI } = useOrangeMan()
  let { setLastShots, LineManUI, shootLine, setCharges } = useLineMan()
  // websocket connection
  // TODO: figure out how to deal with dependencies in `onmessage` without creating a new websocket every time
  // I think there are some issues with having these inside an effect callback
  // https://overreacted.io/a-complete-guide-to-useeffect/
  // socket connect/reconnect
  useEffect(function connect() {
    socket.current = new WebSocket('ws://localhost:8080/ws');
    // attempt reconnect after 1s
    socket.current.onclose = (e) => {
      console.log('closed')
      // console.log('Socket closed:', e.reason)
      setTimeout(() => connect(), 1000)//attempted connections create more closes, these wait for the server to open it seems
    }

    // close on error
    // socket.current.onerror = (e) => {
    //   console.error('Socket error:', e.code || 'unknown');
    //   socket.current.close()
    // }
    return () => {
      socket.current.close()
    }
  }, [])

  useEffect(() => {
    if (gameProgress !== 'placement' && gameProgress !== 'ongoing') {
      setFreeShotMiss(0)
      setEnemyFreeShotMiss(0)
      setTurnNumber(0)
      setEnemyTurnNumber(0)
      setBoardState(() => generateBoard(true, true))
      setMessages([])
      setEnemyBoardState(() => generateBoard(true, true))
    }
  }, [gameProgress])

  // socket open
  useEffect(() => {
    let ss = {
      setFreeShotMiss, setTurn, setEnemyFreeShotMiss, setLastShots, setMessages, setBluffing, setCharacter,
      setEnemyBoardState, setBoardState, setGameProgress, setTurnNumber, setEnemyTurnNumber, setCharges, setEnemyInfo,
      timer, setChat
    }
    let messageListener = (event) => {
      let message = JSON.parse(event.data)
      if (message.code) console.log(message.code)
      if (message.games) setGames(message.games)
      console.log(message)
      if (message.cookies) {  // set cookies received from server
        Object.entries(message.cookies).forEach(([name, value]) => {
          cookies.set(name, value)
        })
      }
      if (message.for === 'player') {
        fromYou({ message, ss })
      } else if (message.for === 'opponent') {
        fromEnemy({ message, ss })
      }
      preGame({ message, cookies, ss })
      postGame({ message, cookies, ss })
    }
    socket.current.addEventListener('message', messageListener)
    return () => {
      socket.current.removeEventListener('message', messageListener)
    }
  }, [bluffing, setLastShots, setBluffing, setCharges, timer])



  return (
    <div className={styles.app}>
      {/* {(socket?.readyState !== undefined && gameProgress === 'preplacement') && <div>connected</div>} */}
      <h1 className={styles.title}>WELCOME TO BATTLESHIP</h1>

      <div className={styles.boardcontainer}>

        {(gameProgress === 'preplacement' && cookies.get('user')?.state === 'prematching') ?
          <div className={styles.pagecontent}>
            {display === 'home' &&
              <div className={styles.boardmockmenu}>{[...Array(9)].map((i, index) => {
                if (index === 0) {
                  return <div onClick={() => {
                    setDisplay('current games')
                  }}><p>current games</p></div>
                } else if (index === 2) {
                  return <div onClick={() => {
                    setDisplay('finished games')
                  }}><p>finished games</p></div>
                } else if (index === 3) {
                  return <div onClick={() => {
                    setDisplay('open games')
                  }}><p>open games</p></div>
                } else if (index === 4) {
                  return <div onClick={() => {
                    cookies.set('user', { ...cookies.get('user'), state: 'matching' })
                    setMessages([...messages])
                  }}><p>Play</p></div>
                } else
                  return <div></div>
              })}
              </div>
            }
            {display === 'current games' && <div className={styles.games}>
              <Games games={games} current />
            </div>
            }
            {display === 'finished games' && <div className={styles.games}>
              <Games games={games} finished />
            </div>
            }
            {display === 'open games' && <div className={styles.games}>
              <Games games={games} socket={socket} cookies={cookies} open />
            </div>
            }
          </div>
          // </div>
          : (gameProgress === 'placement' || gameProgress === 'ongoing') ? <>
            {gameProgress === 'placement' && <button
              onClick={() => { orientation === 'v' ? setOrientation('h') : setOrientation('v') }}>
              change boat orientation
            </button>
            }

            <Board player board={boardState} character={character} socket={socket.current}
              boatNames={boatNames} setBoatNames={setBoatNames}
              cookies={cookies} setCookie={cookies.set}
              boardState={boardState} setBoardState={setBoardState}
              orientation={orientation} gameProgress={gameProgress} setGameProgress={setGameProgress}
              timer={timer}
            />
            <EnemyBoard character={character} board={boardState} enemyBoardState={enemyBoardState} socket={socket}
              cookies={cookies} setCookie={cookies.set} setEnemyBoardState={setEnemyBoardState}
              boardState={boardState} turn={turn} setTurn={setTurn}
              enemyInfo={enemyInfo}
              setBoardState={setBoardState} gameProgress={gameProgress} setGameProgress={setGameProgress}
              shootLine={shootLine}
              bluffing={bluffing} timer={timer}
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
              enemyInfo={enemyInfo}
            />
          </> : cookies.get('user')?.state === 'matching' ?
            <>
              <button onClick={() => {
                cookies.set('user', { ...cookies.get('user'), state: 'prematching' })
                console.log(cookies.get('user'))
                setMessages([...messages])
              }}>games</button>
              <Customization character={character} setCharacter={setCharacter} boatNames={boatNames}
                setBoatNames={setBoatNames} cookies={cookies}
                socket={socket} />
            </> : cookies.get('user')?.state === 'aftergame' ?
              <Endofgame gameProgress={gameProgress} cookies={cookies} setGameProgress={setGameProgress} socket={socket}
                enemyInfo={enemyInfo} chat={chat} setChat={setChat} />
              : <div></div>
        }
      </div>
    </div>
  )
}

export default App
