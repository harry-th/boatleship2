import styles from '../styles/Dashboard.module.css'
import Callbluffbutton from './Callbluffbutton'
import Log from './Log'
const Dashboard = ({
    messages
    , gameProgress
    , turnNumber
    , enemyTurnNumber
    , character
    , OrangeManUI
    , turn
    , setTurn
    , socket
    , enemyBoardState
    , enemyTargets
    , cookies
    , setEnemyBoardState
    , LineManUI
    , wasBluffing
    , boardState
    , freeShotMiss
    , setFreeShotMiss
    , enemyFreeShotMiss
    , setColors
    , enemyInfo }) => {
    return (
        <div className={styles.dashboard}>
            <div className={styles.logcontainer}>
                <Log messages={messages} />
            </div>
            <div className={styles.usercontainer}>
                <div className={styles.turncontainer}>
                    <div className={[(turn && gameProgress === 'ongoing') ? styles.turnIndicatorTrue : styles.turnIndicatorFalse, styles.turnIndicator].join(' ')}>
                        hello
                    </div>
                    <div className={styles.freeshotinformation}>
                        {freeShotMiss} e:{enemyFreeShotMiss} T: {turnNumber} e:{enemyTurnNumber}
                        {Math.floor(turnNumber) % 4 !== 0 || turnNumber === 0 || freeShotMiss ? <p>{4 - (turnNumber % 4 || 4) + 4 * freeShotMiss} turns until your freeshot</p> : Math.floor(turnNumber) % 4 === 4 || !turn ? <p>your free shot next</p> : <p> {Math.floor(turnNumber) === turnNumber ? 'take your free shot!' : 'extra shot!'}</p>}
                        {Math.floor(enemyTurnNumber) % 4 !== 0 || enemyTurnNumber === 0 || enemyFreeShotMiss ? <p>{4 - enemyTurnNumber % 4 + 4 * enemyFreeShotMiss} turns until opponents freeshot</p> : <p>{turn ? 'their free shot next!' : 'their free shot'}</p>}
                    </div>
                </div>
                <div className={styles.charcontainer}>
                    {character === 'orangeman' && <OrangeManUI turn={turn} setTurn={setTurn} socket={socket}
                        enemyBoardState={enemyBoardState} enemyTargets={enemyTargets} cookies={cookies}
                        setEnemyBoardState={setEnemyBoardState} />
                    }
                    {character === 'lineman' && <LineManUI turn={turn} enemyBoardState={enemyBoardState} setEnemyBoardState={setEnemyBoardState} socket={socket} cookies={cookies} setTurn={setTurn} setColors={setColors} />
                    }
                    {enemyInfo.character === 'orangeman' && <Callbluffbutton setTurn={setTurn}
                        wasBluffing={wasBluffing} boardState={boardState} cookies={cookies} socket={socket} setFreeShotMiss={setFreeShotMiss} />}
                </div>
            </div>
        </div >
    )
}

export default Dashboard