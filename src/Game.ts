import Table from "./Table";
export default class Game {
  private hands: Table[] = [];
  private currentHand?: Table;

  startNewHand() {
    const newTable = new Table(); // Start a new hand (Table instance)
    this.hands.push(newTable);
    this.currentHand = newTable;
    return newTable;
  }

  getHandHistory() /* : HandHistory[] */ {
    return;
  }
}
