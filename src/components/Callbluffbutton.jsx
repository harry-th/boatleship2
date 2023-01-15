const Callbluffbutton = ({ setTurn, wasBluffing, boardState, cookies, socket, setFreeShotMiss }) => {

    return (<button onClick={() => {
        setTurn(false)
        if (wasBluffing === 'yes') {
            alert('bluff called')
            let dbx = JSON.stringify(boardState)
            let newBoardState = JSON.parse(dbx)
            for (const square in newBoardState) {
                if (newBoardState[square].state === 'mine') newBoardState[square].state = null
                if (newBoardState[square].hover) newBoardState[square].hover = false
            }
            socket.send(JSON.stringify({ id: cookies.user.id, callBluff: true, boardState: newBoardState }))
        } else {
            socket.send(JSON.stringify({ id: cookies.user.id, callBluff: true, boardState: null }))
            setFreeShotMiss(prev => prev + 1)
            alert('wasn\'t bluffing')
        }
    }}>call bluff</button>)
}
export default Callbluffbutton