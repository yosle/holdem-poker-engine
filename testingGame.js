const Table = require('./dist/Table').default
const Game = require('./dist/Game').default
// const { Rank, Suit } = require('./dist/card')
const { PlayerAction } = require('./dist/Player')
const Player = require("./dist/Player").default

const { GAME_EVENTS } = require('./dist/Table')



const table = new Table({
    playerTurnTimeLimit: 10
});

const player1 = new Player(1, 'Juan', 100);
const player2 = new Player(2, 'Pedro', 100);
const player3 = new Player(3, 'Lucas', 100);

table.seatPlayer(player1);
table.seatPlayer(player2);
table.seatPlayer(player3);


table.startGame()

// table.playerAction(2, PlayerAction.Bet, 50)
// table.playerAction(3, PlayerAction.Call)
// table.playerAction(4, PlayerAction.Call)
// table.playerAction(5, PlayerAction.Call)
// table.playerAction(6, PlayerAction.Call)
// table.playerAction(7, PlayerAction.Call)
// table.playerAction(1, PlayerAction.Call)

console.log("Esto deberia estar en el flop", player1.getHandEmojiString())
table.events.on(GAME_EVENTS.GAME_ENDED, (data) => {
    console.log("data de winners", data)
})
// console.log(JSON.stringify(table.history, undefined, 4))


// table.playerAction(3, PlayerAction.Check)
// table.playerAction(1, PlayerAction.Check)
// table.playerAction(2, PlayerAction.Check)

// setTimeout(() => {
//     table.playerAction(3, PlayerAction.Check)
// }, 1000); // El jugador actúa después de 15 segundos

// console.log("Players antes de startGame", JSON.stringify(table.history));


// table.playerAction(1, PlayerAction.Check)
// table.playerAction(3, PlayerAction.Check)

