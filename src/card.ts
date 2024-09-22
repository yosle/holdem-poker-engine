export enum Suit {
    Hearts,
    Diamonds,
    Clubs,
    Spades,
}

export enum Rank {
    Two = 2,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace,
}

export interface Card {
    suit: Suit;
    rank: Rank;
}
