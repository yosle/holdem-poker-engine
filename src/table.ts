import Card, {
  CardSuit,
  CardRank,
  cardToString,
  cardToEmojiString,
} from "./Card";
import { GameLogEntry } from "./GameLogEntry";
import Player, { PlayerAction } from "./Player";
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

export const GAME_EVENTS = {
  PLAYER_TURN: "PLAYER_TURN",
  PLAYER_ACTION: "PLATER_ACTION",
  PLAYER_TURN_EXPIRED: "PLAYER_TURN_EXPIRED",
  GAME_STATE_CHANGED: "GAME_STATE_CHANGED",
  GAME_STARTED: "GAME_STARTED",
  GAME_ENDED: "GAME_ENDED",
  PLAYER_JOINED: "PLAYER_JOINED",
  PLAYER_LEFT: "PLAYER_LEFT",
  GAME_ACTION_PERFORMED: "GAME_ACTION_PERFORMED",
  GAME_ACTION_COMPLETED: "GAME_ACTION_COMPLETED",
  GAME_ACTION_CANCELLED: "GAME_ACTION_CANCELLED",
  SHOWDOWN: "SHOWDOWN",
};

export default class Table {
  public events: PokerEngineEvents;
  private deck: Card[] = [];
  public players: Player[] = [];
  public pot: number = 0;
  gameState: GameState = GameState.WaitingForPlayers;
  public communityCards: Card[] = [];
  private currentPlayerIndex: number = 0;
  private currentDealerIndex: number = 0;
  private currentBigBlindIndex: number = 0;
  private currentSmallBlindIndex: number = 1;
  public minimumBet: number = 5; // Apuesta mínima para cada ronda
  public currentBet: number = 0; // Apuesta actual en la ronda
  public smallBlind: number = 5;
  public bigBlind: number = 10;
  public playerTurnTimeLimit = 5;
  public history: GameLogEntry[] = [];
  public playerTurnTimeout: any;
  public maxPlayers: number;

  constructor(
    options: {
      maxPlayers?: number;
      players?: Player[];
      currentDealerIndex?: number;
      minimunbet?: number;
      playerTurnTimeLimit?: number;
    } = {}
  ) {
    this.events = new PokerEngineEvents();
    this.playerTurnTimeout = new PlayerTurnTimeout(this);
    this.maxPlayers =
      options.maxPlayers !== undefined ? options.maxPlayers : 10;
    this.players = options.players ?? [];
    this.currentDealerIndex = options.currentDealerIndex ?? 0;
    this.minimumBet = options.minimunbet ?? 5;
    this.playerTurnTimeLimit = options.playerTurnTimeLimit ?? 15;
    this.initializeDeck();
  }

  // Inicializa el mazo con 52 cartas
  public initializeDeck(): void {
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
      throw new Error("No more players allowed for this game");
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
    this.events.emit(GAME_EVENTS.PLAYER_TURN, {
      playerId: this.players[this.currentPlayerIndex].id,
    });

    this.events.on(GAME_EVENTS.PLAYER_TURN_EXPIRED, (data) => {
      if (this.gameState === GameState.Ended) return;
      let autoPlay: PlayerAction = PlayerAction.Check;
      if (this.gameState === GameState.Showdown) {
        autoPlay = PlayerAction.Hide; // later implement this
      }
      const player = this.players[this.currentPlayerIndex];

      // first turn of small blind on pre-flop, default action is bet the minimun bet
      if (
        this.gameState === GameState.PreFlop &&
        player.betAmount === 0 &&
        player.id === this.players[this.currentSmallBlindIndex].id
      ) {
        console.log(
          `Time is up for player ${player.name} turn! Automatic play for player is ${autoPlay} game state: ${this.gameState}`
        );
        this.playerAction(player.id, PlayerAction.Bet, this.minimumBet);
        return;
      }

      // If is first turn of big blind and times up for player automatic play is double of smallBlind
      if (
        this.gameState === GameState.PreFlop &&
        player.betAmount === 0 &&
        player.id === this.players[this.currentBigBlindIndex].id
      ) {
        console.log(
          `Time is up for player ${player.name} turn! Automatic play for player is ${autoPlay} game state: ${this.gameState}`
        );
        this.playerAction(player.id, PlayerAction.Bet, this.minimumBet * 2);
        return;
      }

      if (player.betAmount < this.currentBet) {
        autoPlay = PlayerAction.Fold;
      }
      console.log(
        `Time is up for player ${player.name} turn! Automatic play for player is ${autoPlay} game state: ${this.gameState}`
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
        console.debug(`Starting Flop. current bet: ${this.currentBet}`);
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
        console.debug(`Starting Turn. current bet: ${this.currentBet}`);
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
        console.debug(`Starting River. current bet: ${this.currentBet}`);
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
        console.debug(`Starting Showdown. current bet: ${this.currentBet}`);
        this.gameState = GameState.Showdown;
        this.events.emit(GAME_EVENTS.GAME_STATE_CHANGED, {
          details: {
            newState: GameState.Showdown,
          },
        });
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
        console.debug(`Game Ended`);
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

  private determineWinners(): any {
    console.debug("Determining winners");
    let winners: any[] = [];
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
        const handEval = evalHand([...playerHand, ...communityCards]);
        const handValue = handEval.value;
        if (handValue > highestValue) {
          highestValue = handValue;
          winners = [
            {
              player,
              rank: handEval.handRank,
              type: handEval.handType,
              value: handEval.value,
              name: handEval.handName,
            },
          ]; // Nueva mano con mayor valor
        } else if (handValue === highestValue) {
          winners.push({
            player,
            rank: handEval.handRank,
            type: handEval.handType,
            value: handEval.value,
            name: handEval.handName,
          }); // Empate, agregamos al jugador
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

    if (winners.length > 1) {
      const dividedPot = this.pot / winners.length;
      winners.forEach((winner) => (winner.chips += dividedPot));
    } else {
      winners[0].player.chips += this.pot;
    }
    // reset pot
    this.pot = 0;

    console.log("Winners: ");
    winners.map((winner) =>
      console.log(
        "Name: " +
          winner.player.name +
          " Hand: " +
          winner.player.hand
            .map((card: Card) => cardToEmojiString(card))
            .join(" ") +
          " Winning Hand: " +
          winner.name +
          " Value: " +
          winner.value +
          " Chips: " +
          winner.player.chips
      )
    );

    this.events.emit(GAME_EVENTS.GAME_ENDED, {
      winners,
      comunityCards: this.communityCards,
      // add more info like the hand name
    });
    return { winners, comunityCards: this.communityCards };
  }

  // Inicia una ronda de apuestas
  startBettingRound(): void {
    this.minimumBet = this.getBigBlind();
    this.currentBet = 0;
    this.players.forEach((player) => (player.betAmount = 0));
    this.currentPlayerIndex = this.getNextPlayerIndex(this.currentPlayerIndex);
    this.processPlayerAction();
  }

  processPlayerAction(): void {
    const player = this.players[this.currentPlayerIndex];
    if (player.isFolded || player.chips === 0) {
      this.nextPlayer();
      return;
    }
    this.events.emit(GAME_EVENTS.PLAYER_TURN, {
      playerId: this.players[this.currentPlayerIndex].id,
    });
  }

  /**
   * Process a player action.
   * @param {string} playerId the id of the player performing the action
   * @param {PlayerAction} action the action to perform
   * @param {number?} amount the amount to bet or raise
   * @throws {Error} if the player is not found
   * @throws {Error} if the player is not in turn
   * @throws {Error} if the amount is not specified for Bet or Raise actions
   * @throws {Error} if the player is trying to bet or raise with not enough chips
   * @throws {Error} if the player is trying to bet or raise with an invalid amount
   * @throws {Error} if the player is trying to show cards in a state that is not Showdown
   * @throws {Error} if the player is trying to hide cards in a state that is not Showdown
   */
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
      GAME_EVENTS.PLAYER_ACTION,
      (data: { playerId: string; action: PlayerAction; amount?: number }) => {
        clearTimeout(this.playerTurnTimeout); // Si el jugador actúa, cancelar el timeout
        console.log(`The player ${playerId} make: ${data.action}`);

        // Update history
        this.history.push({
          timestamp: new Date(),
          type: "PlayerAction",
          communityCards: this.communityCards,
          details: {
            action: data.action,
            playerId: data.playerId,
            amount: data?.amount,
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
        // pasar el turno al proximo jugador
        console.debug(`Player ${player.name} Folded. Bet: ${player.betAmount}`);
        this.events.emit(GAME_EVENTS.PLAYER_ACTION, { playerId, action });

        break;
      case PlayerAction.Call:
        const callAmount = this.currentBet - player.betAmount;
        if (player.chips < callAmount)
          throw new Error(
            `Player has no enough chips (${player.chips} to Call ${callAmount} and match ${this.currentBet})`
          );
        player.chips -= callAmount;
        player.betAmount = this.currentBet;
        this.pot += callAmount;
        this.events.emit(GAME_EVENTS.PLAYER_ACTION, { playerId, action });
        break;
      case PlayerAction.Raise:
        if (amount !== undefined) {
          const raiseAmount = amount - player.betAmount;
          if (player.chips < raiseAmount)
            throw new Error(
              `No enough chips (${player.chips}) to raise ${raiseAmount}`
            );
          player.chips -= raiseAmount;
          player.betAmount += raiseAmount;
          this.pot += raiseAmount;
          this.currentBet = this.currentBet + raiseAmount; // Actualiza la apuesta actual
          console.debug(
            `Player ${player.name} raised ${raiseAmount} to ${player.betAmount}.  Pot: ${this.pot}`
          );
        } else {
          throw new Error("Must specify amount to Raise");
        }
        this.events.emit(GAME_EVENTS.PLAYER_ACTION, { playerId, action });
        break;
      case PlayerAction.Bet:
        if (this.gameState != GameState.PreFlop) {
          throw new Error("Bet action only allowed in PreFlop");
        }
        if (amount === undefined)
          throw new Error("Amount must be specified for Bet action");
        if (amount < this.minimumBet) {
          throw new Error(
            `This min amount for this hand is ${this.minimumBet}`
          );
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
        console.debug(`Player ${player.name} Bet ${amount}. Pot: ${this.pot}`);
        this.events.emit(GAME_EVENTS.PLAYER_ACTION, {
          playerId,
          action,
          amount,
        });
        break;
      case PlayerAction.Check:
        console.debug(`Player ${player.name} Checked. Pot ${this.pot}`);
        this.events.emit(GAME_EVENTS.PLAYER_ACTION, { playerId, action });
        break;
      case PlayerAction.Hide:
        if (this.gameState != GameState.Showdown)
          throw "Cant show cards only in showdown";
        player.showCards = false;
        break;
      case PlayerAction.Show:
        if (this.gameState != GameState.Showdown)
          throw new Error("Cant show cards only in showdown");
        player.showCards = true;
        break;
      default:
        throw new Error(`Invalid player action, ${JSON.stringify(action)}`);
    }

    const activePlayers = this.players.filter((p) => !p.isFolded);
    if (activePlayers.length === 1) {
      console.debug(
        "Only one player left with bet. Game state changed showdown"
      );
      this.gameState = GameState.Showdown;
    }

    if (this.isBettingRoundOver()) {
      this.proceedToNextRound();
    }
    this.nextPlayer();
  }

  /**
   * Checks if the betting round is over.
   *
   * The betting round is considered over if all players have either folded
   * or matched the current bet amount.
   *
   * @returns {boolean} True if the betting round is over, otherwise false.
   */
  private isBettingRoundOver(): boolean {
    // La ronda de apuestas termina si todos los jugadores han igualado la apuesta actual o se han retirado
    return this.players.every(
      (player) => player.isFolded || player.betAmount === this.currentBet
    );
  }

  private nextPlayer(): void {
    this.currentPlayerIndex = this.getNextPlayerIndex(this.currentPlayerIndex);
    this.processPlayerAction();
  }

  private getNextPlayerIndex(currentIndex: number): number {
    let index = (currentIndex + 1) % this.players.length;
    while (this.players[index].isFolded && index !== currentIndex) {
      index = (index + 1) % this.players.length;
    }
    return index;
  }

  /**
   * Gets the current big blind value.
   *
   * @returns {number} The current big blind value.
   */
  private getBigBlind(): number {
    return this.bigBlind;
  }

  private getSmallBlind() {
    return this.smallBlind;
  }

  private getMaxBet(): number {
    return Math.max(...this.players.map((p) => p.betAmount));
  }

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
  /**
   * Returns the hand history for the current hand.
   *
   * @returns {GameLogEntry[]} An array of GameLogEntry objects representing
   * the actions and events that occurred during the current hand.
   */
  getHandHistory(): GameLogEntry[] {
    return this.history;
  }

  handlePlayerTurnTimeout(playerId: string) {
    // Handle the player turn timeout (e.g., fold the player's hand)
    // ...
    console.log(`Player ${playerId} timeout event!`);
  }
}
