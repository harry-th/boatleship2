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
import { useCookies } from 'react-cookie';


const nonStateCookies = new Cookies()

function App() {

  const socket = useRef(null);
  const [cookies, setCookie, removeCookie] = useCookies(['user']);

  const [gameProgress, setGameProgress] = useState('preplacement')
  const [boardState, setBoardState] = useState(() => generateBoard(true, true, 100))
  const [boatNames, setBoatNames] = useState(cookies?.user?.boatNames || ['destroyer', 'cruiser', 'battleship', 'carrier'])
  const [messages, setMessages] = useState([])
  const [chat, setChat] = useState([])
  const [freeShotMiss, setFreeShotMiss] = useState(0)
  const [enemyFreeShotMiss, setEnemyFreeShotMiss] = useState(0)
  const [turnNumber, setTurnNumber] = useState(0)
  const [enemyTurnNumber, setEnemyTurnNumber] = useState(turnNumber)
  const [enemyBoardState, setEnemyBoardState] = useState(() => generateBoard(true, true, 100))
  const [enemyInfo, setEnemyInfo] = useState({})
  const [character, setCharacter] = useState(false)
  const [turn, setTurn] = useState(true)
  const [orientation, setOrientation] = useState('h')
  const [games, setGames] = useState([])
  const [opengames, setOpengames] = useState([])
  const [display, setDisplay] = useState('home')
  const timer = useTimer()
  const [menuArray, setMenuArray] = useState(generateBoard(true, true, 9))

  const [joinLobbyErrorMessage, setJoinLobbyErrorMessage] = useState(false)

  let { bluffing, setBluffing, OrangeManUI } = useOrangeMan()
  let { setLastShots, LineManUI, shootLine, setCharges } = useLineMan()
  // websocket connection
  // TODO: figure out how to deal with dependencies in `onmessage` without creating a new websocket every time
  // I think there are some issues with having these inside an effect callback
  // https://overreacted.io/a-complete-guide-to-useeffect/
  // socket connect/reconnect
  useEffect(function connect() {
    //wss://boatle.xyz:8080
    //ws://localhost:8080/ws
    socket.current = new WebSocket('wss://boatle.xyz:8080');

    socket.current.onopen = (e) => {
      // when socket opens, send cookies if they exist
      const id = nonStateCookies.get('id')?.id;
      socket.current.send(JSON.stringify({ id }));
    }
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
    if ((gameProgress !== 'placement' && gameProgress !== 'ongoing')) {
      setFreeShotMiss(0)
      setEnemyFreeShotMiss(0)
      setTurnNumber(0)
      setEnemyTurnNumber(0)
      setBoardState(generateBoard(true, true, 100))
      setMessages([])
      setEnemyBoardState(generateBoard(true, true, 100))
    }
  }, [gameProgress])

  useEffect(() => {
    if ((gameProgress !== 'placement' && gameProgress !== 'ongoing' && (timer.timer1 || timer.timer2))) {
      timer.clear(1)
      timer.clear(2)
    }
  }, [gameProgress, timer])
  // socket open
  useEffect(() => {
    let ss = {
      setFreeShotMiss, setTurn, setEnemyFreeShotMiss, setLastShots, setMessages, setBluffing, setCharacter,
      setEnemyBoardState, setBoardState, setGameProgress, setTurnNumber, setEnemyTurnNumber, setCharges, setEnemyInfo,
      timer, setChat, setCookie
    }
    let messageListener = (event) => {
      let message = JSON.parse(event.data)
      console.log(message)
      console.log(message.issue)

      if (message.games) setGames(message.games)
      if (message.opengames) setOpengames(Object.values(message.opengames))
      if (message.cookies) {  // set cookies received from server
        setCookie('user', { state: 'prematching', ...cookies.user })
        Object.entries(message.cookies).forEach(([name, value]) => {
          nonStateCookies.set(name, value)
        })
      }
      if (message.issue) console.log('issue')
      if (message.issue === 'wrong password') {
        console.log('set error')
        setJoinLobbyErrorMessage({ ...message, msg: message.issue })
        setTimeout(() => {
          setJoinLobbyErrorMessage(false)
        }, 1500);
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
  }, [bluffing, setLastShots, setBluffing, setCharges, timer, cookies, setCookie])

  const menuSquare = ({ index, page = 'home', special }) => {
    return (
      <div onClick={() => {
        if (special) special()
        setDisplay(page)
        setMenuArray(prev => {
          prev[index].hover = false
          return { ...prev }
        })
      }}
        onMouseEnter={() => {
          setMenuArray(prev => {
            prev[index].hover = 'hovered'
            return { ...prev }
          })
        }}
        onMouseLeave={() => {
          setMenuArray(prev => {
            prev[index].hover = false
            return { ...prev }
          })
        }}
        className={[styles[(menuArray)[index].state],
        styles[(menuArray)[index].hover]].join(' ')}
      >
        {page !== 'home' && <p>{page}</p>}
      </div>
    )
  }
  const [menuState, setMenuState] = useState('idle')
  const [idleCode, setIdlecode] = useState(null)
  const idleMenu = (i = 0) => {
    let process = (i) => {
      let j = i
      setMenuArray(prev => {
        prev[i].hover = 'hovered'
        return { ...prev }
      })
      setIdlecode({
        code: setTimeout(() => {
          setMenuArray(prev => {
            prev[j].hover = false
            return { ...prev }
          })
          if (Math.random() < 0.1) i += 3
          else i++
          if (i > 8) i = 0
          process(i)
        }, 1700), i
      })
    }
    process(i)
  }
  useEffect(() => {
    if (cookies?.user?.state === 'prematching')
      idleMenu()
  }, [cookies?.user?.state])
  // useEffect(() => {
  //   setCookie('user', { dingus: 'bingus' })
  // })
  return (
    <div className={styles.app}>
      {/* {(socket?.readyState !== undefined && gameProgress === 'preplacement') && <div>connected</div>} */}
      <h1 className={styles.title}>{socket.current?.readyState === 1 ? 'WELCOME TO BATTLESHIP' : 'WAITING FOR SERVER CONNECTION'}</h1>


      {(gameProgress === 'preplacement' && cookies?.user?.state === 'prematching') ?
        <div className={styles.pagecontent}>
          {display === 'home' &&
            <div className={[styles.boardmockmenu, styles[menuState]].join(' ')}
              onMouseEnter={() => {
                clearTimeout(idleCode.code)
                setMenuArray(prev => {
                  prev[idleCode.i].hover = false
                  return { ...prev }
                })
                setMenuState('active')
              }}
              onMouseLeave={() => {
                if (display === 'home') {
                  idleMenu(idleCode.i)
                  setMenuState('idle')
                }
              }}
            >{[...Array(9)].map((i, index) => {
              let page, special
              if (index === 0) page = 'current games'
              if (index === 2) page = 'finished games'
              if (index === 4) {
                page = 'play'
                special = () => {
                  setCookie('user', { ...cookies?.user, state: 'matching' })
                  setMessages([...messages])
                }
              }
              return menuSquare({ index, page, special })

            })}
            </div>
          }
          {display === 'current games' && <div className={styles.games}>
            <Games games={games} setDisplay={setDisplay}
              socket={socket} current />
          </div>
          }
          {display === 'finished games' && <div className={styles.games}>
            <Games games={games} setDisplay={setDisplay} socket={socket} finished />
          </div>
          }
        </div>
        // </div>
        : (gameProgress === 'placement' || gameProgress === 'ongoing') ? <>
          <div className={styles.boardcontainer}>
            {gameProgress === 'placement' && <button
              onClick={() => { orientation === 'v' ? setOrientation('h') : setOrientation('v') }}>
              change boat orientation
            </button>
            }
            <Board player board={boardState} character={character} socket={socket.current}
              turn={turn}
              boatNames={boatNames} setBoatNames={setBoatNames}
              cookies={cookies} setCookie={setCookie}
              boardState={boardState} setBoardState={setBoardState}
              orientation={orientation} gameProgress={gameProgress} setGameProgress={setGameProgress}
              timer={timer}
            />
            <EnemyBoard character={character} board={boardState} enemyBoardState={enemyBoardState} socket={socket}
              cookies={cookies} setCookie={setCookie} setEnemyBoardState={setEnemyBoardState}
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
          </div>
        </> : cookies?.user?.state === 'matching' ?
          <div className={styles.pagecontent}>
            <Customization character={character} setCharacter={setCharacter} boatNames={boatNames}
              setBoatNames={setBoatNames} cookies={cookies} setCookie={setCookie}
              setMainMenuDisplay={setDisplay} opengames={opengames}
              joinLobbyErrorMessage={joinLobbyErrorMessage} setJoinLobbyErrorMessage={setJoinLobbyErrorMessage}
              socket={socket} />
          </div> : cookies?.user?.state === 'aftergame' ?
            <div className={styles.pagecontent}>
              <Endofgame gameProgress={gameProgress} cookies={cookies}
                setCookie={setCookie}
                setGameProgress={setGameProgress} socket={socket}
                enemyInfo={enemyInfo} chat={chat} setChat={setChat}
                setMainMenuDisplay={setDisplay}
              />
            </div>
            : <div></div>
      }
      <footer>
        wow
      </footer>
    </div>
  )
}

export default App
