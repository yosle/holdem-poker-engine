import Table, { GameState, GAME_EVENTS } from "./Table";
import Player, { PlayerAction } from "./interfaces/Player";
import { GameLogEntry } from "./interfaces/GameLogEntry";
import { createLogger } from "./Utils";
import { nanoid } from "nanoid";

export interface GameOptions {
  maxPlayers?: number;
  players?: Player[];
  minimumBet?: number;
  playerTurnTimeLimit?: number;
  smallBlind?: number;
  bigBlind?: number;
  startingChips?: number;
}

export default class Game {
  private hands: Table[] = [];
  private currentHand?: Table;
  private players: Player[] = [];
  private gameId: string;
  private logger: any;
  private options: GameOptions;
  private currentDealerIndex: number = 0;

  constructor(options: GameOptions = {}) {
    this.gameId = nanoid(8);
    this.logger = createLogger(this.gameId);
    this.options = {
      maxPlayers: options.maxPlayers || 10,
      minimumBet: options.minimumBet || 5,
      playerTurnTimeLimit: options.playerTurnTimeLimit || 15,
      smallBlind: options.smallBlind || 5,
      bigBlind: options.bigBlind || 10,
      startingChips: options.startingChips || 1000,
      players: options.players || []
    };
    
    this.players = this.options.players || [];
  }

  /**
   * Adds a player to the game
   * @param player The player to add
   * @param seatNumber Optional seat number
   * @returns True if the player was added successfully
   */
  public addPlayer(player: Player, seatNumber?: number): boolean {
    if (this.players.length >= this.options.maxPlayers!) {
      return false;
    }
    
    // Ensure player has chips
    if (player.chips === undefined || player.chips <= 0) {
      player.chips = this.options.startingChips!;
    }
    
    this.players.push(player);
    this.logger.info(`Player ${player.name} (${player.id}) joined the game`);
    
    // If there's a current hand, add the player to the table for the next hand
    if (this.currentHand) {
      // Player will join in the next hand
      this.logger.info(`Player ${player.name} will join in the next hand`);
      
      // Emit PLAYER_WAITING event
      this.currentHand.events.emit(GAME_EVENTS.PLAYER_WAITING, {
        playerId: player.id,
        playerName: player.name,
        waitingSince: new Date(),
        chips: player.chips
      });
    }
    
    return true;
  }

  /**
   * Removes a player from the game
   * @param playerId The ID of the player to remove
   * @returns True if the player was removed successfully
   */
  public removePlayer(playerId: string): boolean {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return false;
    }
    
    const player = this.players[playerIndex];
    this.players.splice(playerIndex, 1);
    this.logger.info(`Player ${player.name} (${player.id}) left the game`);
    
    // If the player was in the current hand, handle their departure
    if (this.currentHand) {
      // For now, we'll just let them fold automatically in the current hand
      if (this.currentHand.gameState !== GameState.Ended && 
          this.currentHand.players.some(p => p.id === playerId && !p.isFolded)) {
        this.currentHand.events.emit(GAME_EVENTS.PLAYER_ACTION, {
          playerId,
          action: PlayerAction.Fold
        });
      }
    }
    
    return true;
  }

  /**
   * Starts a new hand with the current players
   * @returns The new Table instance representing the hand
   */
  public startNewHand(): Table {
    // If there's a current hand that's not ended, end it first
    if (this.currentHand && this.currentHand.gameState !== GameState.Ended) {
      this.endCurrentHand();
    }
    
    // Rotate dealer position for the new hand
    if (this.hands.length > 0) {
      this.currentDealerIndex = (this.currentDealerIndex + 1) % this.players.length;
    }
    
    // Create a new table for this hand
    const newTable = new Table({
      maxPlayers: this.options.maxPlayers,
      players: [...this.players], // Copy the players array
      currentDealerIndex: this.currentDealerIndex,
      minimunbet: this.options.minimumBet,
      playerTurnTimeLimit: this.options.playerTurnTimeLimit,
      smallBlind: this.options.smallBlind,
      bigBlind: this.options.bigBlind
    });
    
    this.hands.push(newTable);
    this.currentHand = newTable;
    
    // Set up event listeners for this hand
    this.setupHandEventListeners(newTable);
    
    // Start the game on the table
    newTable.startGame();
    
    this.logger.info(`Started new hand #${this.hands.length}`);
    return newTable;
  }

  /**
   * Ends the current hand if one is in progress
   */
  public endCurrentHand(): void {
    if (!this.currentHand) {
      return;
    }
    
    if (this.currentHand.gameState !== GameState.Ended) {
      // Force the hand to end by proceeding to showdown
      while (this.currentHand.gameState !== GameState.Showdown) {
        this.currentHand.proceedToNextRound();
      }
      
      // Determine winners (using public method or event listener)
      // Note: We're not directly calling determineWinners as it's private
      this.logger.info(`Hand #${this.hands.length} ended`);
      
      // Update player chips from the table
      this.updatePlayerChipsFromTable();
    }
    
    this.currentHand = undefined;
  }

  /**
   * Updates the player chips based on the current table state
   */
  private updatePlayerChipsFromTable(): void {
    if (!this.currentHand) return;
    
    // Update the main player list with the chips from the table
    for (const tablePlayer of this.currentHand.players) {
      const gamePlayer = this.players.find(p => p.id === tablePlayer.id);
      if (gamePlayer) {
        gamePlayer.chips = tablePlayer.chips;
      }
    }
  }

  /**
   * Sets up event listeners for a hand
   * @param table The table instance to listen to events from
   */
  private setupHandEventListeners(table: Table): void {
    // Listen for game ended event
    table.events.on(GAME_EVENTS.GAME_ENDED, () => {
      this.updatePlayerChipsFromTable();
      this.logger.info(`Hand #${this.hands.length} ended`);
    });
    
    // You can add more event listeners here as needed
  }

  /**
   * Gets the history of all hands played
   * @returns Array of hand histories
   */
  public getHandHistory(): GameLogEntry[] {
    let allHistory: GameLogEntry[] = [];
    
    // Combine the history from all hands
    for (const hand of this.hands) {
      allHistory = allHistory.concat(hand.getHandHistory());
    }
    
    return allHistory;
  }

  /**
   * Gets the current hand in progress, if any
   * @returns The current Table instance or undefined if no hand is in progress
   */
  public getCurrentHand(): Table | undefined {
    return this.currentHand;
  }

  /**
   * Gets all players in the game
   * @returns Array of players
   */
  public getPlayers(): Player[] {
    return [...this.players];
  }

  /**
   * Gets the total number of hands played
   * @returns Number of hands played
   */
  public getHandCount(): number {
    return this.hands.length;
  }
}
