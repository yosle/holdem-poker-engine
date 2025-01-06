import { describe, expect, it } from "vitest";
import Player, { PlayerAction } from "../interfaces/Player";
import Card from "../interfaces/Card";

describe("Player class Test suite", () => {
  it("should create a new player with default values", () => {
    const player = new Player("id", "name", 100);
    expect(player.id).toBe("id");
    expect(player.name).toBe("name");
    expect(player.chips).toBe(100);
    expect(player.hand).toEqual([]);
    expect(player.isFolded).toBe(false);
    expect(player.betAmount).toBe(0);
  });

  it("should create a new player with custom values", () => {
    const hand: Card[] = [
      { suit: "h", rank: "K" },
      { suit: "c", rank: "T" },
    ];
    const player = new Player("id", "name", 100, hand, true, 50);
    expect(player.id).toBe("id");
    expect(player.name).toBe("name");
    expect(player.chips).toBe(100);
    expect(player.hand).toEqual(hand);
    expect(player.isFolded).toBe(true);
    expect(player.betAmount).toBe(50);
  });

  //   it("should throw an error with invalid values", () => {
  //     expect(() => new Player("id", "name", -100)).toThrowError();
  //     expect(
  //       () => new Player("id", "name", 100, ["invalid hand"] as any)
  //     ).toThrowError();
  //   });
});
