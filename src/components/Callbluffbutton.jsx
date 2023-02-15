import { client } from '../server/client';


const Callbluffbutton = ({ setTurn, cookies }) => {

    return (<button onClick={() => {
        client.send(JSON.stringify({ id: cookies.get('user').id, callbluff: true, }))
    }}>call bluff</button>)
}
export default Callbluffbutton