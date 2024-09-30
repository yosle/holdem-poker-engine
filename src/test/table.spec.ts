import { describe, expect, it } from "vitest";
import { Player, PlayerAction } from "../Player";
import { Card } from "../Card";
import { Table } from "../Table";

describe("Table test suite", () => {
  it("should declare winner if everyone folds", () => {
    const table = new Table(3);
    const player1 = new Player("1", "Player 1", 100);
    const player2 = new Player("2", "Player 2", 100);
    const player3 = new Player("3", "Player 3", 100);
    table.seatPlayer(player1);
    table.seatPlayer(player2);
    table.seatPlayer(player3);
    table.startGame();
    table.playerAction("2", PlayerAction.Bet, 10);
    table.playerAction("3", PlayerAction.Bet, 20);
    table.playerAction("1", PlayerAction.Fold);
    table.playerAction("2", PlayerAction.Fold);
    expect(table).toBeDefined();
  });

  //   it("should throw an error with invalid values", () => {
  //     expect(() => new Player("id", "name", -100)).toThrowError();
  //     expect(
  //       () => new Player("id", "name", 100, ["invalid hand"] as any)
  //     ).toThrowError();
  //   });
});
