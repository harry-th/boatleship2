import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

/**
 * 
 */
class UserInfo {
  constructor(id) {
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



/**
 * Stores the state of the game, including shared state and player state
 * objects. Each user is only able to see the shared state and their own
 * player state.
 */
class GameState {
  constructor(user1, user2) {
    this.turn = 0;

    this.isTurn = false;
  }
}

