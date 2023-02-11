import { useState } from "react";



// have a shared game state object
//     client: game state + player state
//     server: game state + both player states

// set state logic
//     client set -> setState, send data
//     server set -> assign value, queue and send shared/player-specific data
//                   that was updated

// on message logic
//     client on -> set state based on data fields
//     server on -> resolve data and set state



class PlayerState {
    constructor(socket, id) {
        this.id = id;
        this.page = 'home';
        this.name = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: ' ',
        length: 2,
        });
        this.boatNames = ['destroyer', 'cruiser', 'battleship', 'carrier'];
        this.character = null;
        this.wins = 0;
        this.losses = 0;
    }

}


class GameState {
  




}
