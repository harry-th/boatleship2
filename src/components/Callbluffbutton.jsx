const Callbluffbutton = ({ setTurn, cookies, socket }) => {

    return (<button onClick={() => {
        setTurn(false)
        socket.current.send(JSON.stringify({ id: cookies.get('user').id, callbluff: true, }))

    }}>call bluff</button>)
}
export default Callbluffbutton