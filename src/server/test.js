import Cookies from 'universal-cookie';
import Client from './client.js';


const cookies = new Cookies();
const client = new Client('ws://localhost:8080/ws');

client.addListener('message', (data) => {

});

