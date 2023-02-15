import { socket } from '../server/client';


const Callbluffbutton = ({ setTurn, cookies }) => {

    return (<button onClick={() => {
        socket.send(JSON.stringify({ id: cookies.get('user').id, callbluff: true, }))
    }}>call bluff</button>)
}
export default Callbluffbutton