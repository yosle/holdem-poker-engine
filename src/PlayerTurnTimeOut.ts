import { setTimeout } from "timers";
import Table from "./Table";
import { GameState } from "./Table";
import { GAME_EVENTS } from "./Table";
class PlayerTurnTimeout {
  private table: Table;

  constructor(table: Table) {
    this.table = table;
    this.table.events.on(GAME_EVENTS.PLAYER_TURN, this.startTimer.bind(this));
  }

  startTimer(data: { playerId: string; action?: string; amount?: number }) {
    if (this.table.gameState == GameState.Ended) return;
    console.log(
      `Waiting ${this.table.playerTurnTimeLimit} sec for player ${data.playerId} turn`
    );
    const timeout = 15 * 1000; // 15 seconds
    this.table.playerTurnTimeout = setTimeout(() => {
      // fold as default behavior?
      this.table.events.emit(GAME_EVENTS.PLAYER_TURN_EXPIRED, data);
    }, timeout);
  }
}

export default PlayerTurnTimeout;
