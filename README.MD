# HoldemEngine – Texas Hold'em Poker Engine

---

This project started when I realized I needed to build a state machine for a 2D poker game, but none of the existing solutions really fit my needs. So, I created APE – the ultimate TypeScript-powered poker engine for building Texas Hold'em games! Whether you're building a multiplayer poker platform, a simulation engine, or just having some fun, APE provides a flexible, modular, and fully customizable solution for managing poker hands, game states, and player actions. As I dove into the process, I ended up learning a ton along the way, and it’s been an amazing experience putting everything together!

## Features

1. Player Management
Players can join the table and be associated with a specific seat.
Player information includes name, hand, bet amount, and their status.
Players are tracked by their unique seat.
2. Game State Management
The game state is updated based on player actions (e.g., bets, folds).
Hand history tracking is implemented for reviewing the sequence of actions in a game.
State of the game is updated in real-time as players make moves.
3. Betting System
Players can place bets, fold, or check.
The engine tracks player bets for each round.
Pot management to accumulate the total money staked by players during a hand.
Player’s individual bet amounts are updated throughout the game.
4. Card Handling
Cards are represented in an object-oriented structure, likely using CardSuit and CardRank.
Deck of cards is shuffled and distributed to players.
Card actions such as revealing community cards (flop, turn, river) are handled.
Emoji-based visual representation for displaying cards.
5. Hand Evaluation
Each player's hand is evaluated to determine the best possible poker hand.
Multiple players can be evaluated at once to find the winners.
Hand rankings such as “High Card”, “Pair”, “Full House” are likely part of the hand evaluation logic.
6. Winner Determination
After all rounds are completed, the engine determines who wins based on the best hand.
Winners are printed with their hand details, hand ranking, and winning value.
7. Logging
Detailed logs are generated for players’ actions, including bet amounts and final hands.
Log output for the state of the game and the winners at the end of a hand.
8. AI & Game Flow Management
The game’s flow is managed by a state machine (likely implied), progressing through stages like pre-flop, flop, turn, and river.
Likely handling for multiple players acting sequentially.
9. Game Round Mechanics
Tracks and displays each phase of the poker hand.
Community cards are revealed progressively, and players act accordingly.
Likely has the ability to process player actions like folding, raising, checking, and all-in.
10. Multiplayer Support
Supports multiple players, each with their unique cards and actions.
Players interact with the game in real-time with their respective bets and actions.


## Installation

You can install the APE Poker Engine via `npm`:

```bash
npm install holdem-engine
```

Or via `yarn`:

```bash
yarn add holdem-engine
```

## Getting Started

Here’s a quick example to get you started with APE:

### 1. Create a new game instance

```typescript
import { Game } from 'holdem-engine';

const game = new Game();
```

### 2. Start a new hand

```typescript
game.startNewHand();
```

### 3. Record player actions

```typescript
game.currentHand.recordPlayerAction({
  playerId: 'player1',
  action: 'Bet',
  amount: 100
});
```

### 4. Transition game states

```typescript
game.currentHand.recordGameStateChange({
  newState: 'flop'
});
```

### 5. Track game history

```typescript
const gameHistory = game.getHandHistory();
console.log(gameHistory);
```

## Examples

Here are some examples of how to use the APE Poker Engine:

### Example 1: Setting up a table and starting a game

```javascript
const { Table } = require('holdem-engine');
const { Player } = require('holdem-engine');

const player1 = new Player(1, 'Player 1', 1000);
const player2 = new Player(2, 'Player 2', 1000);

const table = new Table({ maxPlayers: 2 });
table.seatPlayer(player1);
table.seatPlayer(player2);
table.startGame();

console.log('Game started!');
console.log('Player 1 hand:', player1.hand);
console.log('Player 2 hand:', player2.hand);
```

### Example 2: Player actions

```javascript
const { Table } = require('holdem-engine');
const { Player } = require('holdem-engine');
const { PlayerAction } = require('holdem-engine');

const player1 = new Player(1, 'Player 1', 1000);
const player2 = new Player(2, 'Player 2', 1000);

const table = new Table({ maxPlayers: 2 });
table.seatPlayer(player1);
table.seatPlayer(player2);
table.startGame();

table.playerAction(player1.id, PlayerAction.Bet, 10);
table.playerAction(player2.id, PlayerAction.Call);

console.log('Pot:', table.pot);
```

## API Documentation

### `Table`
Each `Table` represents a single hand in the game.

### `HandHistory`
Stores the full history of a specific hand, including actions, player states, and game events.

- **`gameLog: GameLogEntry[]`**: The list of all actions and events that occurred during the hand.

### `PlayerAction`
Represents possible player actions during the game.

```typescript
export const PlayerAction = {
  Fold: "Fold",
  Call: "Call",
  Raise: "Raise",
  Check: "Check",
  Bet: "Bet"
} as const;
```

### `GameLogEntry`
The log of any event or action that happens during a hand.

```typescript
interface GameLogEntry {
  type: 'PlayerAction' | 'GameStateChange' | 'PotUpdate' | 'RoundEnd';
  timestamp: Date;
  details: PlayerActionRecord | GameStateChange | PotUpdate | RoundEnd;
}
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you find a bug or want to improve the engine.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
