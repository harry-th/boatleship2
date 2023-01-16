import './App.css';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import Board from './components/Board'
import EnemyBoard from './components/EnemyBoard'
import { useCookies } from 'react-cookie';
import generateBoard from './helpers/generateBoard';
import Customization from './components/Customization';
import Endofgame from './components/Endofgame';
import styles from './styles/App.module.css'
import Dashboard from './components/Dashboard';
import useOrangeMan from './characters/useOrangeMan';
import useLineMan from './characters/useLineMan';
let randomstring = require("randomstring");


function App() {


  let { bluffing, setBluffing, OrangeManUI } = useOrangeMan()
  let { setLastShots, LineManUI, shootLine } = useLineMan()


  const socket = useRef(null);
  const [cookies, setCookie, removeCookie] = useCookies(['user']);

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

  const [turn, setTurn] = useState(sessionStorage.getItem('turn') ? JSON.parse(sessionStorage.getItem('turn')) : true);
  const [orientation, setOrientation] = useState('h')

  useEffect(() => {
    if (Object.keys(cookies).length === 0) {
      setCookie('user', { id: randomstring.generate(), state: 'matching', wins: 0, losses: 0 }
      )
    }
  }, [cookies, setCookie])
  useEffect(() => {
    socket.current = new WebSocket('ws://localhost:8080/ws');
    socket.current.onclose = () => {
      console.log('connection closed')
    }
  }, [])
  useEffect(() => {
    let messageListener = (event) => {
      let message = JSON.parse(event.data)
      console.log(message)
      setTurnNumber(message.turnNumber)
      setEnemyTurnNumber(message.enemyTurnNumber)
      if (message.twoShots) {
        setLastShots(message.twoShots)
      }
      if (message.you) {
        if (message.freeshotmiss || message.freeshotmiss === 0) {
          setFreeShotMiss(message.freeshotmiss)
        }
        if (message.enemyfreeshotmiss || message.enemyfreeshotmiss === 0) {
          setEnemyFreeShotMiss(message.enemyfreeshotmiss)
        }
        if (message.freeshot) setTurn(true)
        if (message.index) {
          setMessages(prev => {
            if (message.hit) return [...prev, `You fired at ${message.index} and it was a hit!`]
            else return [...prev, `You fired at ${message.index} but it missed!`]
          })
        }
        if (message?.shipsSunk?.length > 0) {
          setMessages(prev => {
            return [...prev, `you have sunk their ${message.shipsSunk.join('and')}`]
          })
        }
        if (message.orange) {
          setBoardState(prev => {
            if (!message.extrashot) {
              let proSq = Object.values(prev).filter((item) => {
                return item.state === 'protected'
              }).map(item => item.id)
              for (const sq of proSq) {
                prev[sq].state = prev[sq].oldState
                delete prev[sq].oldState
              }
            }
            prev[message.index].oldState ||= prev[message.index].state
            prev[message.index].state = 'protected'
            return { ...prev }
          })
        }
        if (message.bluffArray && message.retaliation) {
          setEnemyBoardState(prev => {
            for (const b of message.bluffArray) {
              prev[b].state = null
            }
            for (const shot of message.shotresults.missed) {
              prev[shot].state = 'missed'
            }
            for (const shot of message.shotresults.hit) {
              prev[shot].state = 'hit'
            }
            return { ...prev }
          })
        } else if (message.callbluff === 'success') {
          setMessages(prev => {
            return [...prev, `You called their bluff!`]
          })
        } else if (message.callbluff === 'failure') {
          setMessages(prev => {
            return [...prev, `they weren't bluffing!`]
          })
        }
        if (message.array) {
          setMessages(prev => {
            return [...prev, `You fired a volley of shots, they hit ${message.shotresults.hit.join(', ')}!
            and missed ${message.shotresults.missed.join(', ')}.`]
          })
          setEnemyBoardState(prev => {
            for (const shot of message.shotresults.missed) {
              prev[shot].state = 'missed'
            }
            for (const shot of message.shotresults.hit) {
              prev[shot].state = 'hit'
            }
            return { ...prev }
          })
        }
        if (message.missed) {
          setEnemyBoardState(prev => {
            prev[message.index].state = 'missed'
            return { ...prev }
          })
        } else if (message.hit) {
          if (Array.isArray(message.index)) {
            setEnemyBoardState(prev => {
              for (const shot of message.index)
                prev[shot].state = 'hit'
              return { ...prev }
            })
          } else
            setEnemyBoardState(prev => {
              prev[message.index].state = 'hit'
              return { ...prev }
            })
        }
        return
      } else if (!message.you) {
        if (message.freeshotmiss || message.freeshotmiss === 0) {
          setFreeShotMiss(message.freeshotmiss)
        }
        if (message.enemyfreeshotmiss || message.enemyfreeshotmiss === 0) {
          setEnemyFreeShotMiss(message.enemyfreeshotmiss)
        }
        if (!message.freeshot) setTurn(true)
        if (message?.shipsSunk?.length > 0) {
          setMessages(prev => {
            return [...prev, `They have sunk your ${message.shipsSunk.join('and')}`]
          })
        }
        if (message.index) {
          setMessages(prev => {
            if (message.hit) return [...prev, `They fired at ${message.index} and it was a hit!`]
            else return [...prev, `They fired at ${message.index} but it missed!`]
          })
        }
        if (bluffing) setBluffing('ready')
        if (message?.shipsSunk?.length > 0) {
          setMessages(prev => {
            return [...prev, `They sunk your ${message.shipsSunk.join('and')}`]
          })
        }
        if (message.orange) {
          setEnemyBoardState(prev => {
            if (!message.extrashot) {
              let proSq = Object.values(prev).filter((item) => {
                return item.state === 'protected'
              }).map(item => item.id)
              for (const sq of proSq) {
                prev[sq].state = prev[sq].oldState
                delete prev[sq].oldState
              }
            }
            prev[message.index].oldState ||= prev[message.index].state //very weird bug here
            prev[message.index].state = 'protected'
            return { ...prev }
          })
        }
        if (message.bluffArray && !message.callbluff) {
          setBoardState(prev => {
            for (const b of message.bluffArray) {
              prev[b].state = null
            }
            for (const shot of message.shotresults.missed) {
              prev[shot].state = 'missed'
            }
            for (const shot of message.shotresults.hit) {
              prev[shot].state = 'hit'
            }
            return { ...prev }
          })
        } else if (message.bluffArray && message.callbluff === 'success') {
          setMessages(prev => {
            return [...prev, `They called your bluff!`]
          })
          setBluffing(null)
          setEnemyBoardState(prev => {
            for (const shot of message.bluffArray.missed) {
              prev[shot].state = 'missed'
            }
            for (const shot of message.bluffArray.hit) {
              prev[shot].state = 'hit'
            }
            return { ...prev }
          })
        } else if (message.callbluff === 'failure') {
          setMessages(prev => {
            return [...prev, `They tried to call your bluff and failed!`]
          })
        }
        if (message.array) {
          setMessages(prev => {
            return [...prev, `They fired a volley of shots, they hit ${message.shotresults.hit.join(', ')}!
            and missed ${message.shotresults.missed.join(', ')}.`]
          })
          console.log(message, 'array')
          setBoardState(prev => {
            for (const shot of message.shotresults.missed) {
              prev[shot].state = 'missed'
            }
            for (const shot of message.shotresults.hit) {
              prev[shot].state = 'hit'
            }
            return { ...prev }
          })
        }
        if (message.missed) {
          setBoardState(prev => {
            prev[message.index].state = 'missed'
            return { ...prev }
          })
        }
        if (message.hit) {
          if (Array.isArray(message.index)) {
            setBoardState(prev => {
              for (const shot of message.index)
                prev[shot].state = 'hit'
              return { ...prev }
            })
          } else
            setBoardState(prev => {
              prev[message.index].state = 'hit'
              return { ...prev }
            })
        }
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
        removeCookie('user')
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
            cookies={cookies} setCookie={setCookie}
            boardState={boardState} setBoardState={setBoardState}
            enemyBoardState={enemyBoardState}
            orientation={orientation} gameProgress={gameProgress} setGameProgress={setGameProgress}
          />
          <EnemyBoard character={character} board={boardState} enemyBoardState={enemyBoardState} socket={socket}
            cookies={cookies} setCookie={setCookie} setEnemyBoardState={setEnemyBoardState}
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
        </> : cookies?.user?.state === 'matching' ?
          <>
            {/* <button onClick={() => {
              socket.current.send(JSON.stringify({ ...cookies.user, character }))
            }}>find game</button> */}
            <Customization character={character} setCharacter={setCharacter} boatNames={boatNames}
              setBoatNames={setBoatNames} setCookie={setCookie} cookies={cookies}
              socket={socket} />
          </> :
          <></>
          // <Endofgame gameProgress={gameProgress} setCookie={setCookie} cookies={cookies} setGameProgress={setGameProgress} socket={socket} />
        }
      </div>
    </div>
  );
}

export default App;


/* <div className={styles.title}>WELCOME TO BATTLESHIP</div>
<div className={styles.boardcontainer}>
   <button>
    change boat orientation
  </button>
  

  <Board  />
  <Board  />
  <Dashboard
  />
</> : cookies?.user?.state === 'matching' ? <>
  <Customization  />
</> : <Endofgame />}
</div> */
