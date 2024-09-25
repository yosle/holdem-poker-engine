const { Table } = require('./dist/table')
// const { Rank, Suit } = require('./dist/card')
const { PlayerAction } = require('./dist/player')
const { Player } = require("./dist/player")

const table = new Table(3);
const player1 = new Player(1, 'Player 1', 100);
const player2 = new Player(2, 'Player 2', 100);
table.seatPlayer(player1);
table.seatPlayer(player2);
table.seatPlayer({
    id: 3,
    name: "afdf",
    chips: 100
})
table.startGame()
console.log("Players antes de startGame", table.gameState);
table.playerAction(2, PlayerAction.Bet, 10);
table.playerAction(3, PlayerAction.Bet, 20);
table.playerAction(1, PlayerAction.Call);
table.playerAction(2, PlayerAction.Fold)
table.playerAction(3, PlayerAction.Fold)
// table.playerAction(1, PlayerAction.Fold)
// table.playerAction(3, PlayerAction.Check)
// table.playerAction(1, PlayerAction.Check)
// table.playerAction(3, PlayerAction.Check)

delete table.deck
console.log(table, JSON.stringify(table));