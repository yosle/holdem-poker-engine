export const CardSuit = {
  Hearts: "h",
  Diamonds: "d",
  Clubs: "c",
  Spades: "s",
};

const suitEmojiMap: { [key in Suit]: string } = {
  h: "♥️",
  d: "♦️",
  c: "♣️",
  s: "♠️",
};

export function cardToEmojiString(card: Card): string {
  return `${card.rank === "T" ? "10" : card.rank}${suitEmojiMap[card.suit]}`;
}

export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export const CardRank = {
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
  Six: 6,
  Seven: 7,
  Eight: 8,
  Nine: 9,
  Ten: "T",
  Jack: "J",
  Queen: "Q",
  King: "K",
  Ace: "A",
};

export type Rank = (typeof CardRank)[keyof typeof CardRank];
export type Suit = (typeof CardSuit)[keyof typeof CardSuit];

export default interface Card {
  suit: Suit;
  rank: Rank;
}
