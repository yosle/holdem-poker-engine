import Card, {
  CardSuit,
  CardRank,
  cardToString,
  cardToEmojiString,
} from "./Card";
import { GameLogEntry } from "./GameLogEntry";
import { Player, PlayerAction } from "./Player";
import { evalHand } from "poker-evaluator-ts";
import PokerEngineEvents from "./PokerEngineEvents";
import PlayerTurnTimeout from "./PlayerTurnTimeOut";
import { clearTimeout } from "timers";

export enum GameState {
  WaitingForPlayers,
  PreFlop,
  Flop,
  Turn,
  River,
  Showdown,
  Ended,
}

export default class Table {
  public events: PokerEngineEvents;
  private deck: Card[] = [];
  private players: Player[] = [];
  private pot: number = 0;
  gameState: GameState = GameState.WaitingForPlayers;
  private communityCards: Card[] = [];
  private currentPlayerIndex: number = 0;
  private currentDealerIndex: number = 0;
  private currentBigBlindIndex: number = 0;
  private currentSmallBlindIndex: number = 1;
  private minimumBet: number = 5; // Apuesta mínima para cada ronda
  private currentBet: number = 0; // Apuesta actual en la ronda
  private smallBlind: number = 5;
  private bigBlind: number = 10;
  public playerTurnTimeLimit = 5;
  history: GameLogEntry[] = [];
  public playerTurnTimeout: any;

  constructor(
    private maxPlayers: number = 10,
    players: Player[] = [],
    currentDealerIndex = 0,
    minimunbet = 5,
    playerTurnTimeLimit = 15
  ) {
    this.events = new PokerEngineEvents();
    this.playerTurnTimeout = new PlayerTurnTimeout(this);
    this.maxPlayers = maxPlayers;
    this.players = players;
    this.currentDealerIndex = currentDealerIndex;
    this.minimumBet = minimunbet;
    this.playerTurnTimeLimit = playerTurnTimeLimit;
    this.initializeDeck();
  }

  // Inicializa el mazo con 52 cartas
  private initializeDeck(): void {
    this.deck = [];
    for (let suit in CardSuit) {
      for (let rank in CardRank) {
        this.deck.push({
          suit: CardSuit[suit as keyof typeof CardSuit],
          rank: CardRank[rank as keyof typeof CardRank],
        });
      }
    }
    this.shuffleDeck();
  }

  /**
   * Shuffles the deck of cards using the Fisher-Yates shuffle algorithm
   * @see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
   * @returns {void}
   */
  private shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }
  /**
   * Add player to table. set seat and assign seat number secuentially
   * if not seat number is specified
   * @param player {Player} The player to add
   * @param seatNumber? {number} Optional seat number
   * @returns {boolean} True if the player was added, false otherwise
   */
  seatPlayer(player: Player, seatNumber?: number): boolean {
    if (this.players.length >= this.maxPlayers) {
      throw new Error("Todos los asientos del juego estan ocupados");
    }
    const isSeatTaken = this.players.some((p) => p.seatNumber === seatNumber);
    if (isSeatTaken) {
      throw new Error(`El asiento ${seatNumber} ya esta ocupado`);
    }

    if (this.players.length < this.maxPlayers) {
      player.seatNumber = seatNumber ?? this.players.length + 1;
      this.players.push(player);
      return true;
    }
    return false;
  }

  // Inicia el juego
  startGame(): void {
    if (this.players.length < 2) {
      throw new Error("No hay suficientes jugadores para iniciar el juego.");
    }
    this.gameState = GameState.PreFlop;
    this.dealInitialCards();

    // assign dealer, big blind and small blinds
    this.currentDealerIndex = 0;
    // if two players dealer is also the smallBlind
    this.currentSmallBlindIndex = this.players.length === 2 ? 0 : 1;
    this.currentBigBlindIndex = this.currentSmallBlindIndex + 1;

    // hand's up game: is Dealer/small blind turn. else is small blind turn
    this.currentPlayerIndex = this.currentSmallBlindIndex;
    // Once game start is 1st player turn
    this.events.emit("PlayerTurn", {
      playerId: this.players[this.currentPlayerIndex].id,
    });

    this.events.on("PlayerTurnExpired", (data) => {
      if (this.gameState === GameState.Ended) return;
      let autoPlay: PlayerAction = PlayerAction.Check;
      if (this.gameState === GameState.Showdown) {
        autoPlay = PlayerAction.Hide; // later implement this
      }
      const player = this.players[this.currentPlayerIndex];
      if (player.betAmount < this.currentBet) {
        autoPlay = PlayerAction.Fold;
      }
      console.log(
        `Time is up! Automatic play for player is ${autoPlay} game state: ${this.gameState}`
      );
      this.playerAction(player.id, autoPlay);
    });
  }

  // Reparte dos cartas a cada jugador
  private dealInitialCards(): void {
    for (let player of this.players) {
      player.hand = [this.deck.pop()!, this.deck.pop()!];
    }
  }

  // Procede a la siguiente ronda (Flop, Turn, River, Showdown)
  proceedToNextRound(): void {
    switch (this.gameState) {
      case GameState.PreFlop:
        this.gameState = GameState.Flop;
        this.dealCommunityCards(3);
        this.history.push({
          timestamp: new Date(),
          type: "GameStateChange",
          communityCards: this.communityCards,
          details: {
            newState: "flop",
          },
          players: this.players.map((p) => {
            return {
              playerId: p.id,
              chips: p.chips,
              cards: p.hand,
              isFolded: p.isFolded,
              betAmount: p.betAmount,
            };
          }),
        });
        break;
      case GameState.Flop:
        this.gameState = GameState.Turn;
        this.dealCommunityCards(1);
        this.history.push({
          timestamp: new Date(),
          type: "GameStateChange",
          communityCards: this.communityCards,
          details: {
            newState: "turn",
          },
          players: this.players.map((p) => {
            return {
              playerId: p.id,
              chips: p.chips,
              cards: p.hand,
              isFolded: p.isFolded,
              betAmount: p.betAmount,
            };
          }),
        });
        break;
      case GameState.Turn:
        this.gameState = GameState.River;
        this.dealCommunityCards(1);
        this.history.push({
          timestamp: new Date(),
          type: "GameStateChange",
          communityCards: this.communityCards,
          details: {
            newState: "river",
          },
          players: this.players.map((p) => {
            return {
              playerId: p.id,
              chips: p.chips,
              cards: p.hand,
              isFolded: p.isFolded,
              betAmount: p.betAmount,
            };
          }),
        });
        break;
      case GameState.River:
        this.gameState = GameState.Showdown;

        this.history.push({
          timestamp: new Date(),
          type: "GameStateChange",
          communityCards: this.communityCards,
          details: {
            newState: "showdown",
          },
          players: this.players.map((p) => {
            return {
              playerId: p.id,
              chips: p.chips,
              cards: p.hand,
              isFolded: p.isFolded,
              betAmount: p.betAmount,
            };
          }),
        });
        break;
      case GameState.Showdown:
        this.determineWinners();
        this.gameState = GameState.Ended;

        this.history.push({
          timestamp: new Date(),
          type: "GameStateChange",
          communityCards: this.communityCards,
          details: {
            newState: "ended",
          },
          players: this.players.map((p) => {
            return {
              playerId: p.id,
              chips: p.chips,
              cards: p.hand,
              isFolded: p.isFolded,
              betAmount: p.betAmount,
            };
          }),
        });
        break;
      case GameState.Ended:
        // would do somtheing here in the future
        clearTimeout(this.playerTurnTimeout);
        break;
      default:
        throw new Error("Invalid Game State");
    }
  }

  // Reparte cartas comunitarias
  private dealCommunityCards(count: number): void {
    for (let i = 0; i < count; i++) {
      this.communityCards.push(this.deck.pop()!);
    }
  }

  // Determina los ganadores de la mano actual
  private determineWinners(): Player[] {
    console.log("Determining winners");
    let winners: Player[] = [];
    // Evaluar la mano de cada jugador y determinar el/los ganador(es)
    // Simplificado para este ejemplo; se requiere lógica real de evaluación de manos de póker
    const activePlayers = this.players.filter((player) => !player.isFolded);

    const communityCards = this.communityCards.map((card) =>
      cardToString(card)
    );
    // compare hand of all active players
    let highestValue = -Infinity;

    if (activePlayers.length === 1) {
      // One player left is the winner
      winners = activePlayers;
    } else {
      activePlayers.forEach((player) => {
        const playerHand = player.hand.map((card) => cardToString(card));
        const handValue = evalHand([...playerHand, ...communityCards]).value;
        if (handValue > highestValue) {
          highestValue = handValue;
          winners = [player]; // Nueva mano con mayor valor
        } else if (handValue === highestValue) {
          winners.push(player); // Empate, agregamos al jugador
        }
      });
    }

    console.log(
      "Comunity cards: ",
      this.communityCards.map((card) => cardToEmojiString(card)).join(" ")
    );
    console.log("Hand in showdown: ");
    activePlayers.map((player) =>
      console.log(
        "Name: " +
          player.name +
          " Hand: " +
          player.hand.map((card) => cardToEmojiString(card)).join(" ")
      )
    );
    console.log("Winner(s): ");
    winners.map((player) => {
      console.log(
        "Name: " + player.name + " Hand: ",
        [
          ...player.hand.map((card) => cardToEmojiString(card)),
          ...this.communityCards.map((card) => cardToEmojiString(card)),
        ].join(" ")
      );
    });

    const dividedPot = this.pot / winners.length;
    winners.forEach((winner) => (winner.chips += dividedPot));
    console.log(
      "Winners: " +
        winners.map(
          (player) => player.name + " with " + player.chips + " chips"
        )
    );

    this.pot = 0;
    return winners;
  }

  // Inicia una ronda de apuestas
  startBettingRound(): void {
    this.minimumBet = this.getBigBlind(); // Supongamos que hay ciegas en el juego
    this.currentBet = 0;
    this.players.forEach((player) => (player.betAmount = 0));
    this.currentPlayerIndex = this.getNextPlayerIndex(this.currentPlayerIndex);
    this.processPlayerAction();
  }

  // Procesa la acción de un jugador (el flujo de apuestas)
  processPlayerAction(): void {
    const player = this.players[this.currentPlayerIndex];
    if (player.isFolded || player.chips === 0) {
      this.nextPlayer();
      return;
    }
    this.events.emit("PlayerTurn", {
      playerId: this.players[this.currentPlayerIndex].id,
    });
  }

  // Acción del jugador (modificada para la ronda de apuestas)
  playerAction(playerId: string, action: PlayerAction, amount?: number): void {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error("Jugador no encontrado.");
    }
    // check player turn
    const currentPlayerId = this.players[this.currentPlayerIndex].id;
    if (playerId != currentPlayerId) {
      throw new Error(
        `It's not player ${playerId} turn to play. Is player id: ${currentPlayerId} turn`
      );
    }

    this.events.on(
      "PlayerAction",
      (data: { playerId: string; action: PlayerAction }) => {
        clearTimeout(this.playerTurnTimeout); // Si el jugador actúa, cancelar el timeout
        console.log(`El jugador ${playerId} hizo una acción: ${data.action}`);

        // Update history
        this.history.push({
          timestamp: new Date(),
          type: "PlayerAction",
          communityCards: this.communityCards,
          details: {
            action: data.action,
            playerId: data.playerId,
          },
          players: this.players.map((p) => {
            return {
              playerId: p.id,
              chips: p.chips,
              cards: p.hand,
              isFolded: p.isFolded,
              betAmount: p.betAmount,
            };
          }),
        });
      }
    );

    switch (action) {
      case PlayerAction.Fold:
        player.isFolded = true;
        const activePlayers = this.players.filter((p) => !p.isFolded);
        if (activePlayers.length === 1) {
          this.gameState = GameState.Showdown;
        }
        // pasar el turno al proximo jugador

        break;
      case PlayerAction.Call:
        const callAmount = this.currentBet - player.betAmount;
        if (player.chips < callAmount)
          throw new Error("No hay saldo suficiente para igualar");
        player.chips -= callAmount;
        player.betAmount = this.currentBet;
        this.pot += callAmount;
        this.events.emit("PlayerAction", { playerId, action });
        // Create log entry

        break;
      case PlayerAction.Raise:
        if (amount !== undefined) {
          const raiseAmount = amount - player.betAmount;
          if (player.chips < raiseAmount)
            throw new Error("No hay fichas suficientes para Raise");
          player.chips -= raiseAmount;
          player.betAmount += raiseAmount;
          this.pot += raiseAmount;
          this.currentBet = this.currentBet + raiseAmount; // Actualiza la apuesta actual
        } else {
          throw new Error("Se debe especificar el monto para Raise");
        }
        this.events.emit("PlayerAction", { playerId, action });
        break;
      case PlayerAction.Bet:
        if (this.gameState != GameState.PreFlop) {
          throw new Error("bet action only allowed in PreFlop");
        }
        if (amount === undefined)
          throw new Error("Debe especificar un monto para accion Bet");
        if (amount < this.minimumBet) {
          throw new Error(`El monto minimo es ${this.minimumBet}`);
        }

        if (
          player.id === this.players[this.currentSmallBlindIndex].id &&
          amount < this.smallBlind
        ) {
          throw new Error(
            `Small Blind must bet at least ${this.smallBlind} amount`
          );
        }
        // Big Blind cant be lower than game big blind
        if (
          player.id === this.players[this.currentBigBlindIndex].id &&
          amount < this.bigBlind
        ) {
          throw new Error(
            `Big Blind must bet at least ${this.bigBlind} amount`
          );
        }
        // Big Blind can't be lower that the previous Small Blind bet
        if (
          player.id === this.players[this.currentBigBlindIndex].id &&
          amount < this.currentBet
        ) {
          throw new Error(
            `Big Blind must bet at least ${this.bigBlind} amount`
          );
        }

        player.chips -= amount;
        player.betAmount = amount;
        this.pot += amount;
        this.currentBet = amount;
        this.events.emit("PlayerAction", { playerId, action, amount });
        break;
      case PlayerAction.Check:
        // El jugador pasa sin
        this.events.emit("PlayerAction", { playerId, action });
        break;
      default:
        throw new Error("Acción inválida.");
    }

    if (this.isBettingRoundOver()) {
      this.proceedToNextRound();
    }
    this.nextPlayer();
  }

  // Comprueba si la ronda de apuestas ha terminado
  private isBettingRoundOver(): boolean {
    // La ronda de apuestas termina si todos los jugadores han igualado la apuesta actual o se han retirado
    return this.players.every(
      (player) => player.isFolded || player.betAmount === this.currentBet
    );
  }

  // Avanza al siguiente jugador
  private nextPlayer(): void {
    this.currentPlayerIndex = this.getNextPlayerIndex(this.currentPlayerIndex);
    this.processPlayerAction();
  }

  // Encuentra el siguiente índice del jugador que no se haya retirado
  private getNextPlayerIndex(currentIndex: number): number {
    let index = (currentIndex + 1) % this.players.length;
    while (this.players[index].isFolded && index !== currentIndex) {
      index = (index + 1) % this.players.length;
    }
    return index;
  }

  // Devuelve el valor de la ciega grande
  private getBigBlind(): number {
    return 10; // Valor predeterminado para simplificación
  }

  private getSmallBlind() {
    return 10;
  }

  // Obtener la apuesta máxima actual
  private getMaxBet(): number {
    return Math.max(...this.players.map((p) => p.betAmount));
  }

  // Reinicia la mesa para una nueva mano
  resetTable(): void {
    this.communityCards = [];
    this.players.forEach((player) => {
      player.hand = [];
      player.isFolded = false;
      player.betAmount = 0;
    });
    this.initializeDeck();
    this.gameState = GameState.PreFlop;
  }

  getHandHistory(): GameLogEntry[] {
    return this.history;
  }

  handlePlayerTurnTimeout(playerId: string) {
    // Handle the player turn timeout (e.g., fold the player's hand)
    // ...
    console.log(`Player ${playerId} timeout event!`);
  }
}
