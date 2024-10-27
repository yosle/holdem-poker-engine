const Table = require('./dist/Table').default
const Game = require('./dist/Game').default
// const { Rank, Suit } = require('./dist/card')
const { PlayerAction } = require('./dist/Player')
const Player = require("./dist/Player").default

const EventEmitter = require('events')

const eventEmitter = new EventEmitter();

const table = new Table(10, [], 0, 5, 5);

table.events.on("PlayerTurn", (data) => {
    console.log("Recibido desde fuera", data)
})
const player1 = new Player(1, 'Juan', 100);
const player2 = new Player(2, 'Pedro', 100);
const player3 = new Player(3, 'Lucas', 100);
const player4 = new Player(4, 'Ernesto', 100);
const player5 = new Player(5, 'Marcos', 100);
const player6 = new Player(6, 'Jesus', 100);
const player7 = new Player(7, 'simon', 100);
table.seatPlayer(player1);
table.seatPlayer(player2);
table.seatPlayer(player3);
table.seatPlayer(player4);
table.seatPlayer(player5);
table.seatPlayer(player6);
table.seatPlayer(player7);

table.startGame()

// console.log(JSON.stringify(table.history, undefined, 4))


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

