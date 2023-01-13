import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
let randomstring = require("randomstring");


function App() {
  const socket = useRef(null);
  const [cookies, setCookie, removeCookie] = useCookies(['user']);
  const [message, setMessage] = useState([])
  const [mail, setMail] = useState('')
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

      if (message.matched) {
        setCookie('user', { ...cookies.user, state: 'matched' })
        return
      }
      setMessage(prev => [...prev, message.mail])
    }
    socket.current.addEventListener('message', messageListener)
    return () => {
      socket.current.removeEventListener('message', messageListener)
    }
  }, [cookies])
  return (
    <div>
      <button onClick={() => {
        socket.current.send(JSON.stringify({ ...cookies.user }))
      }}>find game</button>
      <button onClick={() => removeCookie('user')}>
        removeCookie
      </button>
      <div>
        <input onChange={(e) => setMail(e.target.value)} />
        <button onClick={() => {
          console.log(mail)
          socket.current.send(JSON.stringify({ id: cookies.user.id, mail }))
        }}>
          send mail!
        </button>
      </div>
      cookies:  {cookies?.user?.state}
      <ul>{message.map((item) => {
        return <li>{item}</li>
      })}</ul>
      <form>

      </form>
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
