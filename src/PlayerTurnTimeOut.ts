import { setTimeout } from "timers";
import Table from "./Table";
import { GameState } from "./Table";
import { GAME_EVENTS } from "./Table";
import Player, { PlayerAction } from "./interfaces/Player";
class PlayerTurnTimeout {
  private table: Table;

  constructor(table: Table) {
    this.table = table;
    this.table.events.on(GAME_EVENTS.PLAYER_TURN, this.startTimer.bind(this));
  }

  startTimer(data: { player: Player; action?: string; amount?: number }) {
    if (this.table.gameState == GameState.Ended) return;
    if (
      // is initial bet of small blind on pre-FLOP
      data.action === PlayerAction.Bet &&
      this.table.players[this.table.currentSmallBlindIndex].id ===
        data.player.id &&
      this.table.gameState === GameState.PreFlop
    )
      return;

    this.table.logger.debug(
      `Set waiting time for player ${data.player.name} turn`,
      {
        seconds: this.table.playerTurnTimeLimit,
        playerId: data.player.id,
      }
    );
    const timeout = this.table.playerTurnTimeLimit * 1000; // 15 seconds
    this.table.playerTurnTimeout = setTimeout(() => {
      // fold as default behavior?
      this.table.events.emit(GAME_EVENTS.PLAYER_TURN_EXPIRED, data);
    }, timeout);
  }
}

export default PlayerTurnTimeout;
