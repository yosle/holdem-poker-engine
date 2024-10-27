import { describe, expect, it } from "vitest";
import Table, { GameState } from "../Table";
import Player from "../Player";
import Card from "../Card";
import PokerEngineEvents from "../PokerEngineEvents";

describe("Table class", () => {
  // it("should create a new table with default values", () => {
  //   const table = new Table();
  //   expect(table.events).toBeInstanceOf(PokerEngineEvents);

  //   expect(table.players).toEqual([]);
  //   expect(table.pot).toBe(0);
  //   expect(table.gameState).toBe(GameState.WaitingForPlayers);
  //   expect(table.communityCards).toEqual([]);
  //   expect(table.minimumBet).toBe(5);
  //   expect(table.currentBet).toBe(0);
  //   expect(table.smallBlind).toBe(5);
  //   expect(table.bigBlind).toBe(10);
  //   expect(table.playerTurnTimeLimit).toBe(5);
  //   expect(table.history).toEqual([]);
  // });

  it("should add a player to the table", () => {
    const table = new Table();
    const player = new Player("id", "name", 100);
    table.players.push(player);
    expect(table.players).toEqual([player]);
  });

  it("should deal initial cards to players", () => {
    const table = new Table();
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
  });

  it("should start a betting round", () => {
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    const table = new Table(2, [player1, player2], 0, 10, 5);
    table.startGame();
    expect(table.minimumBet).toBe(10);
    expect(table.currentBet).toBe(0);
  });
});
