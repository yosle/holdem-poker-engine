import { setTimeout } from "timers";
import Table from "./Table";
import { GameState } from "./Table";
import { GAME_EVENTS } from "./Table";
import { logger } from "./Utils";
class PlayerTurnTimeout {
  private table: Table;

  constructor(table: Table) {
    this.table = table;
    this.table.events.on(GAME_EVENTS.PLAYER_TURN, this.startTimer.bind(this));
  }

  startTimer(data: { playerId: string; action?: string; amount?: number }) {
    if (this.table.gameState == GameState.Ended) return;
    logger.debug(`Set waiting time for player ${data.playerId} turn`, {
      seconds: this.table.playerTurnTimeLimit,
      playerId: data.playerId,
      action: data.action,
    });
    const timeout = this.table.playerTurnTimeLimit * 1000; // 15 seconds
    this.table.playerTurnTimeout = setTimeout(() => {
      // fold as default behavior?
      this.table.events.emit(GAME_EVENTS.PLAYER_TURN_EXPIRED, data);
    }, timeout);
  }
}

export default PlayerTurnTimeout;
