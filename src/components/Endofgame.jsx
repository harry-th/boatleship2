import styles from '../styles/Endofgame.module.css'
const Endofgame = ({ gameProgress, cookies, setGameProgress,
    socket, enemyInfo, chat, setChat, setMainMenuDisplay, setCookie }) => {
    return (<>
        <div>
            <header>
                {enemyInfo?.disconnected && <span>your opponent has disconnected</span>}
                {gameProgress === 'winning screen' ? <h2>you have won! congragurblations</h2> : <h2>you have lost! how embarrasing!</h2>}
            </header>
            {enemyInfo?.lookingForRematch !== 'left' && <button onClick={() => {
                setCookie('user', { ...cookies.user })
                socket.current.send(JSON.stringify({ rematch: true }))
            }}
            >rematch?</button>}
            {enemyInfo?.lookingForRematch === 'looking' && <p>your last opponent {enemyInfo.name} is looking for a rematch!</p>}
            {enemyInfo?.lookingForRematch === 'left' && <p>your opponent has left.</p>}
            <p>chat:</p>
            <div className={styles.endgamechatbox}>
                <div className={styles.endgamechat}>
                    {chat.map(item => <p>{item}</p>)}
                </div>
                {enemyInfo?.lookingForRematch !== 'left' && <form onSubmit={(e) => {
                    e.preventDefault()
                    socket.current.send(JSON.stringify({ chat: `${cookies.user.name}: ${e.target.chat.value}` }))
                }}>
                    <input name='chat' />

                </form>}
            </div>
            <p>well wasn't that fun! <button onClick={() => {
                setCookie('user', { ...cookies.user, state: 'prematching' })
                setMainMenuDisplay('home')
                setChat([])
                setGameProgress('preplacement')
                socket.current.send(JSON.stringify({ newgame: true }))
            }}>Back for more?</button></p>
        </div>
    </>)
}
export default Endofgame