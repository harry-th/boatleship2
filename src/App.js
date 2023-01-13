import './App.css';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import Board from './components/Board'
import { useCookies } from 'react-cookie';
import generateBoard from './helpers/generateBoard';
import Customization from './components/Customization';
import Endofgame from './components/Endofgame';
import styles from './styles/App.module.css'
// import Dashboard from './components/Dashboard';
let randomstring = require("randomstring");


function App() {




  const socket = useRef(null);
  const [cookies, setCookie, removeCookie] = useCookies(['user']);

  const [boatPlacements, setBoatPlacements] = useState([])
  const [gameProgress, setGameProgress] = useState('preplacement')
  const [boardState, setBoardState] = useState(generateBoard(true, true))
  const [boats, setBoats] = useState([2, 3, 4, 5])
  const [boatNames, setBoatNames] = useState(['destroyer', 'cruiser', 'battleship', 'carrier'])
  // const [turnNumber, setTurnNumber] = useState(sessionStorage.getItem('turnNumber') ? JSON.parse(sessionStorage.getItem('turnNumber')) : 0)


  const [enemyBoardState, setEnemyBoardState] = useState(sessionStorage.getItem('enemyBoardState') ? JSON.parse(sessionStorage.getItem('enemyBoardState')) : generateBoard(true, true))
  // const [enemyName, setEnemyName] = useState(sessionStorage.getItem('enemyName'))

  const [character, setCharacter] = useState(sessionStorage.getItem('character') || 'none')

  const [turn, setTurn] = useState(sessionStorage.getItem('turn') ? JSON.parse(sessionStorage.getItem('turn')) : true);
  const [orientation, setOrientation] = useState('h')


  // const [message, setMessage] = useState([])
  // const [mail, setMail] = useState('')

  useEffect(() => {
    if (Object.keys(cookies).length === 0) {
      setCookie('user', { id: randomstring.generate(), state: 'matching', wins: 0, losses: 0 }
      )
    }
  }, [cookies, setCookie])
  useEffect(() => {
    socket.current = new WebSocket('ws://localhost:8080/ws');
  }, [])

  useEffect(() => {
    let messageListener = (event) => {
      let message = JSON.parse(event.data)
      console.log(message)
      if (message.missed && message.you) {
        setEnemyBoardState(message.ebs)
      }
      if (message.hit && message.you) {
        setEnemyBoardState(message.ebs)
      }
      if (message.missed && !message.you) {
        setBoardState(message.bs)
      }
      if (message.hit && !message.you) {
        setBoardState(message.bs)
      }

      if (message.matched) {
        setGameProgress('placement')
        return
      }
      if (message.boatsreceived) {
        setGameProgress('ongoing')
        console.log('got the boats')
      }
    }
    socket.current.addEventListener('message', messageListener)
    return () => {
      socket.current.removeEventListener('message', messageListener)
    }
  }, [])
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

          <Board board={boardState} player character={character} socket={socket.current} cookies={cookies} setCookie={setCookie}
            boardState={boardState} setBoardState={setBoardState}
            enemyBoardState={enemyBoardState} boatPlacements={boatPlacements}
            setBoatPlacements={setBoatPlacements} boats={boats} setBoats={setBoats}
            orientation={orientation} gameProgress={gameProgress} setGameProgress={setGameProgress}
            boatNames={boatNames}
            setBoatNames={setBoatNames} />
          <Board character={character} enemyBoardState={enemyBoardState} socket={socket}
            cookies={cookies} setCookie={setCookie} setEnemyBoardState={setEnemyBoardState}
            boardState={boardState} turn={turn} setTurn={setTurn}
            // enemyName={enemyName} 
            setBoardState={setBoardState} gameProgress={gameProgress} setGameProgress={setGameProgress}
          />
          {/* <Dashboard
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
          enemyTargets={enemyTargets}
          cookies={cookies}
          setEnemyBoardState={setEnemyBoardState}
          LineManUI={LineManUI}
          wasBluffing={wasBluffing}
          enemyBoatPlacements={enemyBoatPlacements}
          setEnemyBoatPlacements={setEnemyBoatPlacements}
          setTurnNumber={setTurnNumber}
          boardState={boardState}
          freeShotMiss={freeShotMiss}
          setFreeShotMiss={setFreeShotMiss}
          enemyFreeShotMiss={enemyFreeShotMiss}
          setEnemyFreeShotMiss={setEnemyFreeShotMiss}
        /> */}
        </> : cookies?.user?.state === 'matching' ? <>
          <button onClick={() => {
            socket.current.send(JSON.stringify({ ...cookies.user }))
          }}>find game</button>
          {/* <Customization character={character} setCharacter={setCharacter} boatNames={boatNames}
            setBoatNames={setBoatNames} setCookie={setCookie} cookies={cookies}
            socket={socket} /> */}
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
