const Table = require('./dist/Table').default
const Game = require('./dist/Game').default
// const { Rank, Suit } = require('./dist/card')
const { PlayerAction } = require('./dist/Player')
const { Player } = require("./dist/Player")

const table = new Table(3, [], 0, 5, 5);
const player1 = new Player(1, 'Player 1', 100);
const player2 = new Player(2, 'Player 2', 100);
table.seatPlayer(player1);
table.seatPlayer(player2);

table.startGame()
table.playerAction(1, PlayerAction.Bet, 10);
table.playerAction(2, PlayerAction.Bet, 20);

console.log(JSON.stringify(table.history))


// table.playerAction(3, PlayerAction.Check)
// table.playerAction(1, PlayerAction.Check)
// table.playerAction(2, PlayerAction.Check)

// setTimeout(() => {
//     table.playerAction(3, PlayerAction.Check)
// }, 1000); // El jugador actúa después de 15 segundos

// console.log("Players antes de startGame", JSON.stringify(table.history));

const game = new Game()

// table.playerAction(1, PlayerAction.Check)
// table.playerAction(3, PlayerAction.Check)

