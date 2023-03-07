const Callbluffbutton = ({ setTurn, cookies, socket }) => {

    return (<button onClick={() => {
        socket.current.send(JSON.stringify({ callbluff: true, }))
    }}>call bluff</button>)
}
export default Callbluffbutton