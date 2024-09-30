import { Table } from "./Table";
import type { HandHistory } from "./GameLogEntry";
class Game {
  private hands: Table[] = [];
  private currentHand?: Table;

  startNewHand() {
    const newTable = new Table(); // Start a new hand (Table instance)
    this.hands.push(newTable);
    this.currentHand = newTable;
  }

  getHandHistory() /* : HandHistory[] */ {
    return;
  }
}
