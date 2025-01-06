import Card, { cardToEmojiString } from "./Card";

export const PlayerAction = {
  Fold: "Fold",
  Call: "Call",
  Raise: "Raise",
  Check: "Check",
  Bet: "Bet",
  Show: "Show",
  Hide: "Hide",
} as const;

export type PlayerAction = (typeof PlayerAction)[keyof typeof PlayerAction];

export default class Player {
  constructor(
    id: string,
    name: string,
    chips: number,
    hand: Card[] = [],
    isFolded: boolean = false,
    betAmount: number = 0
  ) {
    this.id = id;
    this.name = name;
    this.chips = chips;
    this.hand = hand;
    this.isFolded = isFolded;
    this.betAmount = betAmount;
  }
  readonly id: string = "";
  name = "";
  chips = 0;
  hand: Card[] = [];
  isFolded: boolean = false;
  betAmount: number = 0;
  seatNumber: number = -1;
  showCards: boolean = false;

  updateChips(amount: number) {
    this.chips += amount;
  }

  addCard(card: Card) {
    this.hand.push(card);
  }

  /**
   * set seat number
   * @param seatNumber {number}
   */
  setSeat(seatNumber: number) {
    this.seatNumber = seatNumber;
  }

  setBetAmount(amount: number) {
    this.betAmount = amount;
  }

  getHandEmojiString(): string[] {
    return this.hand.map((card) => cardToEmojiString(card));
  }
}
