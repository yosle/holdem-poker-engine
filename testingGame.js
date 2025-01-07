const Table = require('./dist/Table').default;
const Player = require('./dist/Player').default;
const { PlayerAction } = require('./dist/Player');
const { GAME_EVENTS } = require('./dist/Table');

// Lista de acciones a realizar

const player1 = new Player(1, 'Player 1', 1000);
const player2 = new Player(2, 'Player 2', 1000);
const player3 = new Player(3, 'Player 3', 1000);
const player4 = new Player(4, 'Player 4', 1000);
const player5 = new Player(5, 'Player 5', 1000);
const player6 = new Player(6, 'Player 6', 1000);
const player7 = new Player(7, 'Player 7', 1000);
const player8 = new Player(8, 'Player 8', 1000);
const player9 = new Player(9, 'Player 9', 1000);
const player10 = new Player(10, 'Player 10', 1000);


const table = new Table(1, 10, 100, 200);
table.seatPlayer(player1);
table.seatPlayer(player2);
table.seatPlayer(player3);
table.seatPlayer(player4);
table.seatPlayer(player5);
table.seatPlayer(player6);
table.seatPlayer(player7);
table.seatPlayer(player8);
table.seatPlayer(player9);
table.seatPlayer(player10);

table.startGame();

const actions = [

    () => table.playerAction(2, PlayerAction.Bet, 20),    // Player 2 iguala
    () => table.playerAction(3, PlayerAction.Call),      // Player 3 iguala
    () => table.playerAction(4, PlayerAction.Raise, 40), // Player 4 sube a 40
    () => table.playerAction(5, PlayerAction.Fold),      // Player 5 se retira
    () => table.playerAction(6, PlayerAction.Call),      // Player 6 iguala
    () => table.playerAction(7, PlayerAction.Call),      // Player 7 iguala
    () => table.playerAction(8, PlayerAction.Fold),      // Player 8 se retira
    () => table.playerAction(9, PlayerAction.Call),      // Player 9 iguala
    () => table.playerAction(10, PlayerAction.Call),     // Player 10 iguala
    () => table.playerAction(1, PlayerAction.Call),      // Player 1 iguala
    () => table.playerAction(2, PlayerAction.Check)      // Player 2 pasa (flop)
];

// Función para ejecutar las acciones con un intervalo
function executeActions(actions, interval) {
    let currentAction = 0;

    const intervalId = setInterval(() => {
        if (currentAction < actions.length) {
            actions[currentAction](); // Ejecutar la acción actual
            currentAction++;
        } else {
            clearInterval(intervalId); // Detener el intervalo cuando todas las acciones hayan terminado
            console.log('Simulación completada.');
        }
    }, interval);
}

// Ejecutar las acciones con un intervalo de 5 segundos (5000 ms)
executeActions(actions, 5000);

// Manejar el evento de fin de juego

