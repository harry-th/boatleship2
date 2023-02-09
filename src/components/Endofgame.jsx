import styles from '../styles/Endofgame.module.css'
const Endofgame = ({ gameProgress, cookies, setGameProgress, socket, enemyInfo, chat, setChat }) => {
    return (<>
        <div>
            <header>
                {enemyInfo?.disconnected && <span>your opponent has disconnected</span>}
                {gameProgress === 'winning screen' ? <h2>you have won! congragurblations</h2> : <h2>you have lost! how embarrasing!</h2>}
            </header>
            {enemyInfo?.lookingForRematch !== 'left' && <button onClick={() => {
                cookies.set('user', { ...cookies.get('user') })
                socket.current.send(JSON.stringify({ id: cookies.get('user').id, rematch: true }))
            }}
            >rematch?</button>}
            {enemyInfo?.lookingForRematch === 'looking' && <p>your last opponent {enemyInfo.name} is looking for a rematch!</p>}
            {enemyInfo?.lookingForRematch === 'left' && <p>your opponent has left.</p>}
            <p>chat:</p>
            <div className={styles.endgamechat}>
                {chat.map(item => <p>{item}</p>)}
            </div>
            {enemyInfo?.lookingForRematch !== 'left' && <form onSubmit={(e) => {
                e.preventDefault()
                socket.current.send(JSON.stringify({ id: cookies.get('user').id, chat: `${cookies.get('user').name}: ${e.target.chat.value}` }))
            }}>
                <input name='chat' />
            </form>}
            <p>well wasn't that fun! <button onClick={() => {
                cookies.set('user', { ...cookies.get('user'), state: 'prematching' })
                setChat([])
                setGameProgress('preplacement')
                socket.current.send(JSON.stringify({ id: cookies.get('user').id, newgame: true }))
            }}>Back for more?</button></p>
        </div>
    </>)
}
export default Endofgame