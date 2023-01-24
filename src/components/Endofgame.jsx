const Endofgame = ({ gameProgress, cookies, setGameProgress, socket }) => {
    return (<>
        <div>
            <header>
                {gameProgress === 'winning screen' ? <h2>you have won! congragurblations</h2> :
                    <h2>you have lost! how embarrasing!</h2>}
            </header>
            <p>well wasn't that fun! <button onClick={() => {
                cookies.set('user', { ...cookies.get('user'), state: 'matching' })
                setGameProgress('preplacement')
                socket.current.send(JSON.stringify({ id: cookies.get('user').id, reset: true }))
            }}>Back for more?</button></p>
        </div>
    </>)
}
export default Endofgame