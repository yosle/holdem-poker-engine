// Ejemplo de uso de la clase Game
import Game, { GameOptions } from './Game';
import Player, { PlayerAction } from './interfaces/Player';
import { nanoid } from 'nanoid';

// Función para crear un nuevo jugador
function createPlayer(name, chips = 1000) {
  return {
    id: nanoid(8),
    name,
    chips,
    hand: [],
    isFolded: false,
    betAmount: 0,
    showCards: false,
    seat: -1
  };
}

// Configuración del juego
const gameOptions = {
  maxPlayers: 6,
  smallBlind: 5,
  bigBlind: 10,
  startingChips: 1000,
  playerTurnTimeLimit: 30
};

// Crear una instancia del juego
const pokerGame = new Game(gameOptions);

// Añadir jugadores
const player1 = createPlayer('Alice');
const player2 = createPlayer('Bob');
const player3 = createPlayer('Charlie');
const player4 = createPlayer('David');

pokerGame.addPlayer(player1);
pokerGame.addPlayer(player2);
pokerGame.addPlayer(player3);
pokerGame.addPlayer(player4);

console.log(`Jugadores en la mesa: ${pokerGame.getPlayers().length}`);

// Iniciar la primera mano
let currentHand = pokerGame.startNewHand();

// Configurar escuchas de eventos para la mano actual
currentHand.events.on('PLAYER_TURN', (data) => {
  console.log(`Es el turno de ${data.playerId}`);
  
  // Simulación de acción del jugador
  // En un caso real, esto vendría de la interfaz de usuario o de una IA
  const player = currentHand.players.find(p => p.id === data.playerId);
  if (player) {
    // Ejemplo: el jugador hace call o check dependiendo de la situación
    if (currentHand.currentBet > player.betAmount) {
      // Hay una apuesta que igualar
      currentHand.events.emit('PLAYER_ACTION', {
        playerId: data.playerId,
        action: PlayerAction.Call
      });
    } else {
      // No hay apuesta que igualar
      currentHand.events.emit('PLAYER_ACTION', {
        playerId: data.playerId,
        action: PlayerAction.Check
      });
    }
  }
});

// Escuchar cuando la mano termina
currentHand.events.on('GAME_ENDED', () => {
  console.log('La mano ha terminado');
  console.log('Estado de los jugadores:');
  
  pokerGame.getPlayers().forEach(player => {
    console.log(`${player.name}: ${player.chips} fichas`);
  });
  
  // Iniciar una nueva mano después de un tiempo
  setTimeout(() => {
    if (pokerGame.getPlayers().length >= 2) {
      console.log('\nIniciando nueva mano...');
      currentHand = pokerGame.startNewHand();
      // Aquí se configurarían nuevamente los escuchas de eventos para la nueva mano
    } else {
      console.log('No hay suficientes jugadores para una nueva mano');
    }
  }, 3000);
});

// Simulación de un jugador que abandona después de algunas manos
setTimeout(() => {
  console.log(`\n${player3.name} abandona la partida`);
  pokerGame.removePlayer(player3.id);
}, 10000);

// Obtener estadísticas del juego después de un tiempo
setTimeout(() => {
  console.log('\nEstadísticas del juego:');
  console.log(`Total de manos jugadas: ${pokerGame.getHandCount()}`);
  console.log(`Jugadores restantes: ${pokerGame.getPlayers().length}`);
  
  // Finalizar el juego actual si existe
  const currentHandInstance = pokerGame.getCurrentHand();
  if (currentHandInstance) {
    pokerGame.endCurrentHand();
    console.log('Mano actual finalizada');
  }
  
  // Mostrar historial de manos
  const history = pokerGame.getHandHistory();
  console.log(`Entradas en el historial: ${history.length}`);
}, 20000);