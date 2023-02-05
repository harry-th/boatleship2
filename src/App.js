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
import Client from './server/client';


const cookies = new Cookies();
const client = new Client('ws://localhost:8080/ws');

// handle session cookies
client.addListener('session', (data) => {
  for (const name in data) {
    cookies.set(name, data[name]);
  }
});


function App() {
  // user state
  const [name, setName] = useState()
  const [boatNames, setBoatNames] = useState(['destroyer', 'cruiser', 'battleship', 'carrier']);
  const [character, setCharacter] = useState(null);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  // game state
  const [gameProgress, setGameProgress] = useState('preplacement')
  const [boardState, setBoardState] = useState(() => generateBoard(true, true))
  const [messages, setMessages] = useState([])
  const [chat, setChat] = useState([])
  const [freeShotMiss, setFreeShotMiss] = useState(0)
  const [enemyFreeShotMiss, setEnemyFreeShotMiss] = useState(0)
  const [turnNumber, setTurnNumber] = useState(0)
  const [enemyTurnNumber, setEnemyTurnNumber] = useState(turnNumber)

  const [enemyBoardState, setEnemyBoardState] = useState(() => generateBoard(true, true))
  const [enemyInfo, setEnemyInfo] = useState({})

  const [turn, setTurn] = useState(true)
  const [orientation, setOrientation] = useState('h')

  const timer = useTimer()
  let { bluffing, setBluffing, OrangeManUI } = useOrangeMan()
  let { setLastShots, LineManUI, shootLine, setCharges } = useLineMan()


  const userState = {
    name, setName,
    boatNames, setBoatNames,
    character, setCharacter,
    wins, setWins,
    losses, setLosses
  };

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


  // handle state
  useEffect(() => {
    function stateListener(data) {


    }
    client.addListener('state', stateListener);
    return () => {
      client.removeListener('state', stateListener);
    };
  }, []);




  // // socket open
  // useEffect(() => {
  //   let ss = {
  //     setFreeShotMiss, setTurn, setEnemyFreeShotMiss, setLastShots, setMessages, setBluffing, setCharacter,
  //     setEnemyBoardState, setBoardState, setGameProgress, setTurnNumber, setEnemyTurnNumber, setCharges, setEnemyInfo,
  //     timer
  //   }
  //   let messageListener = (event) => {
  //     let message = JSON.parse(event.data)
  //     console.log(message)

  //     if (message.chat) {
  //       setChat(prev => [...prev, message.chat])
  //     }
  //     if (message.hasLeft) {
  //       setEnemyInfo(prev => {
  //         prev.lookingForRematch = 'left'
  //         return { ...prev }
  //       })
  //     }
  //     if (message.lookingForRematch) {
  //       setEnemyInfo(prev => {
  //         prev.lookingForRematch = 'looking'
  //         return { ...prev }
  //       })
  //     }
  //     if (message.rematchAccepted) {
  //       cookies.set('user', { ...cookies.get('user'), state: 'matched' })
  //       setFreeShotMiss(0)
  //       setEnemyFreeShotMiss(0)
  //       setTurnNumber(0)
  //       setEnemyTurnNumber(0)
  //       setBoardState(() => generateBoard(true, true))
  //       setMessages([])
  //       setEnemyBoardState(() => generateBoard(true, true))
  //       const { enemyinfo } = message
  //       setEnemyInfo(enemyinfo)
  //       setBluffing(false)
  //       setMessages(prev => {
  //         return [...prev, `Rematched with ${enemyinfo.name} playing as ${enemyinfo.character}!`]
  //       })
  //       setGameProgress('placement')
  //       return
  //     }
  //     if (message.win) {
  //       cookies.set('user', { ...cookies.get('user'), wins: cookies.get('user').wins + 1 })
  //       if (message.hasDisconnected) {
  //         timer.clear(2) //time
  //         setEnemyInfo(prev => {
  //           prev.disconnected = true
  //           return prev
  //         })
  //       }
  //       setGameProgress('winning screen')
  //     }
  //     if (message.loss) {
  //       if (message.hasDisconnected) {
  //         timer.clear(1) //time
  //         alert('ran out of time')
  //       }
  //       cookies.set('user', { ...cookies.get('user'), losses: cookies.get('user').losses + 1 })
  //       setGameProgress('losing screen')
  //     }

  //     if (message.cookies) {  // set cookies received from server
  //       console.log(message.cookies)
  //       Object.entries(message.cookies).forEach(([name, value]) => {
  //         cookies.set(name, value)
  //       })
  //     }
  //     if (message.for === 'player') {
  //       fromYou({ message, ss })
  //       return
  //     } else if (message.for === 'opponent') {
  //       fromEnemy({ message, ss })
  //     }
  //     if (message.matched) {
  //       cookies.set('user', { ...cookies.get('user'), state: 'matched' })

  //       const { enemyinfo } = message
  //       setEnemyInfo(enemyinfo)
  //       setMessages(prev => {
  //         return [...prev, `Matched with ${enemyinfo.name} playing as ${enemyinfo.character}!`]
  //       })
  //       setGameProgress('placement')
  //       return
  //     }
  //     if (message.boatsreceived) {
  //       cookies.set('user', { ...cookies.get('user'), state: 'ongoing' })
  //       if (message.charges) setCharges(message.charges)
  //       if (message.bluffing === false || message.bluffing) setBluffing(message.bluffing)
  //       if (message.turn) {
  //         setMessages(prev => {
  //           return [...prev, 'Game start! you go first!']
  //         })
  //       } else {
  //         setMessages(prev => {
  //           return [...prev, 'You will go second, freeshot 1 turn earlier...']
  //         })
  //       }
  //       setGameProgress('ongoing')
  //       setTurn(message.turn)
  //       console.log('got the boats')
  //     }
  //   }
  //   client.addListener('message', messageListener)
  //   return () => {
  //     client.removeListener('message', messageListener)
  //   }
  // }, [bluffing, setLastShots, setBluffing, setCharges, timer]);


  let page = <></>;
  if (gameProgress === 'preplacement') {
    page = <Customization character={character} setCharacter={setCharacter} boatNames={boatNames}
      setBoatNames={setBoatNames} cookies={cookies}
      socket={socket}/>
  }
  // } else if (gameProgress === 'placement' || gameProgress === 'ongoing') {
  //   page = <>{ gameProgress === 'placement' && 
  //     <button onClick={() => { orientation === 'v' ? setOrientation('h') : setOrientation('v') }}>
  //       change boat orientation
  //     </button>}

  //     <Board player board={boardState} character={character} socket={socket.current}
  //       boatNames={boatNames} setBoatNames={setBoatNames}
  //       cookies={cookies} setCookie={cookies.set}
  //       boardState={boardState} setBoardState={setBoardState}
  //       orientation={orientation} gameProgress={gameProgress} setGameProgress={setGameProgress}
  //       timer={timer}/>
  //     <EnemyBoard character={character} board={boardState} enemyBoardState={enemyBoardState} socket={socket}
  //       cookies={cookies} setCookie={cookies.set} setEnemyBoardState={setEnemyBoardState}
  //       boardState={boardState} turn={turn} setTurn={setTurn}
  //       enemyInfo={enemyInfo}
  //       setBoardState={setBoardState} gameProgress={gameProgress} setGameProgress={setGameProgress}
  //       shootLine={shootLine}
  //       bluffing={bluffing} timer={timer}/>
  //     <Dashboard
  //       messages={messages}
  //       gameProgress={gameProgress}
  //       turnNumber={turnNumber}
  //       enemyTurnNumber={enemyTurnNumber}
  //       character={character}
  //       OrangeManUI={OrangeManUI}
  //       turn={turn}
  //       setTurn={setTurn}
  //       socket={socket}
  //       enemyBoardState={enemyBoardState}
  //       cookies={cookies}
  //       setEnemyBoardState={setEnemyBoardState}
  //       LineManUI={LineManUI}
  //       setTurnNumber={setTurnNumber}
  //       boardState={boardState}
  //       freeShotMiss={freeShotMiss}
  //       setFreeShotMiss={setFreeShotMiss}
  //       enemyFreeShotMiss={enemyFreeShotMiss}
  //       setEnemyFreeShotMiss={setEnemyFreeShotMiss}
  //       enemyInfo={enemyInfo}/>
  //   </>
  // } else {
  //   <Endofgame gameProgress={gameProgress} cookies={cookies} setGameProgress={setGameProgress}
  //     socket={socket} enemyInfo={enemyInfo} chat={chat} setChat={setChat} />
  // }

  return (
    <div className={styles.app}>
      <button onClick={() => {
        cookies.remove('user', 'name')
        setGameProgress('preplacement')
      }}>remove cookie</button>
      <div className={styles.title}>WELCOME TO BATTLESHIP</div>

      <div className={styles.boardcontainer}>
        {page}
      </div>
    </div >
  );
}

export default App

/* 
      (gameProgress === 'placement' || gameProgress === 'ongoing') ? <>
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
        <Customization character={character} setCharacter={setCharacter} boatNames={boatNames}
          setBoatNames={setBoatNames} cookies={cookies}
          socket={socket} />
      </> :
      <Endofgame gameProgress={gameProgress} cookies={cookies} setGameProgress={setGameProgress} socket={socket} enemyInfo={enemyInfo} chat={chat} setChat={setChat} />
        } */