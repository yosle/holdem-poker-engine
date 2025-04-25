import { describe, expect, it } from "vitest";
import Table, { GameState } from "../Table";
import Player, { PlayerAction } from "../interfaces/Player";
import Card from "../interfaces/Card";
import PokerEngineEvents from "../PokerEngineEvents";

describe("Table class", () => {
  it("should create a new table with default values", () => {
    const table = new Table();
    expect(table.events).toBeInstanceOf(PokerEngineEvents);
    expect(table.players).toEqual([]);
    expect(table.pot).toBe(0);
    expect(table.gameState).toBe(GameState.WaitingForPlayers);
    expect(table.communityCards).toEqual([]);
    expect(table.minimumBet).toBe(5);
    expect(table.currentBet).toBe(0);
    expect(table.smallBlind).toBe(5);
    expect(table.bigBlind).toBe(10);
    expect(table.playerTurnTimeLimit).toBe(15);
    expect(table.history).toEqual([]);
  });

  it("should add a player to the table", () => {
    const table = new Table();
    const player = new Player("id", "name", 100);
    table.seatPlayer(player);
    expect(table.players).toEqual([player]);
    expect(player.seatNumber).toBe(1);
  });

  it("should throw an error if trying to add more players than maxPlayers", () => {
    const table = new Table({ maxPlayers: 2 });
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    const player3 = new Player("id3", "name3", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
    expect(() => table.seatPlayer(player3)).toThrowError(
      "No more players allowed for this game"
    );
  });

  it("should throw an error if trying to add a player to a seat that is already taken", () => {
    const table = new Table({ maxPlayers: 2 });
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    table.seatPlayer(player1, 1);
    expect(() => table.seatPlayer(player2, 1)).toThrowError(
      "El asiento 1 ya esta ocupado"
    );
  });

  it("should start a game", () => {
    const table = new Table({ maxPlayers: 2 });
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
    table.startGame();
    expect(table.gameState).toBe(GameState.PreFlop);
    expect(table.players[0].hand.length).toBe(2);
    expect(table.players[1].hand.length).toBe(2);
    expect(table.currentDealerIndex).toBe(0);
    expect(table.currentSmallBlindIndex).toBe(1);
    expect(table.currentBigBlindIndex).toBe(0);
    expect(table.currentPlayerIndex).toBe(1);
    expect(table.pot).toBe(15);
    expect(table.currentBet).toBe(10);
  });

  it("should ensure small blind is at least the minimum bet", () => {
    const table = new Table({
      maxPlayers: 2,
      minimunbet: 20,
      smallBlind: 5,
      bigBlind: 10,
    });
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
    table.startGame();
    expect(table.players[table.currentSmallBlindIndex].betAmount).toBe(20);
  });

  it("should deal initial cards to players", () => {
    const table = new Table({});
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
  });

  it("should start a betting round", () => {
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    const table = new Table({
      maxPlayers: 2,
      players: [player1, player2],
      minimunbet: 10,
      playerTurnTimeLimit: 1,
    });
    table.startGame();
    // el monto de smallblind no debe ser menor que minimumbet
    expect(table.gameState).toBe(GameState.PreFlop);
    // expect(table.currentBet).toBe(20);
  });

  it("should allow a player to fold", () => {
    const table = new Table({ maxPlayers: 2 });
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
    table.startGame();
    table.playerAction(player2.id, PlayerAction.Fold);
    expect(player2.isFolded).toBe(true);
  });

  it("should allow a player to check", () => {
    const table = new Table({ maxPlayers: 2 });
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
    table.startGame();
    table.playerAction(player2.id, PlayerAction.Check);
  });

  it("should allow a player to call", () => {
    const table = new Table({ maxPlayers: 2 });
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
    table.startGame();
    table.playerAction(player2.id, PlayerAction.Fold);
    table.playerAction(player1.id, PlayerAction.Call);
  });

  it("should allow a player to raise", () => {
    const table = new Table({ maxPlayers: 2 });
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
    table.startGame();
    table.playerAction(player2.id, PlayerAction.Raise, 20);
    expect(player2.betAmount).toBe(20);
    expect(table.currentBet).toBe(25);
  });

  it("should declare winner if 2 player and one folds", () => {
    const table = new Table({ maxPlayers: 2 });
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
    table.startGame();
    table.playerAction(player2.id, PlayerAction.Fold);
    table.proceedToNextRound();
    expect(table.gameState).toBe(GameState.Ended);
  });

  it("should determine the winner", () => {
    const table = new Table({ maxPlayers: 2 });
    const player1 = new Player("id1", "name1", 100);
    const player2 = new Player("id2", "name2", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
    table.startGame();
    table.playerAction(player2.id, PlayerAction.Fold);
    table.proceedToNextRound();
    table.proceedToNextRound();
    table.proceedToNextRound();
    table.proceedToNextRound();
  });
});
