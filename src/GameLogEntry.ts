import { Card } from "./Card";
import { PlayerAction } from "./Player";

// Actions and Game States
export type LogEntryType =
  | "PlayerAction"
  | "GameStateChange"
  | "PotUpdate"
  | "RoundEnd";

export interface PlayerActionRecord {
  playerId: string;
  action: PlayerAction;
  amount?: number;
}

export interface GameStateChange {
  newState: "pre-flop" | "flop" | "turn" | "river" | "showdown";
}

export interface PotUpdate {
  potAmount: number;
}

export interface RoundEnd {
  winnerIds: string[];
  finalPot: number;
}

// General GameLogEntry to record any action or event
export interface GameLogEntry {
  type: LogEntryType;
  timestamp: Date;
  details: PlayerActionRecord | GameStateChange | PotUpdate | RoundEnd;
  players: { [playerId: string]: PlayerState };
  communityCards: Card[];
}

// Hand and Player State
export interface PlayerState {
  playerId: string;
  chips: number;
  cards: Card[];
  hand: Card[];
  isFolded: boolean;
  betAmount: number;
}

export interface HandHistory {
  gameLog: GameLogEntry[];
}

// For tracking multiple hands
export interface GameHistory {
  tableId: string;
  hands: HandHistory[];
}