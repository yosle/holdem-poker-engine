# APE (Another Poker Engine) – Texas Hold'em Poker Engine

---

Welcome to **APE**, the ultimate TypeScript-powered poker engine for building Texas Hold'em games! Whether you're building a multiplayer poker platform, a simulation engine, or just having some fun, APE provides a flexible, modular, and fully customizable engine for managing Texas Hold'em poker hands, game states, and player actions.

## Features

- 🌐 **Game Management**: Track multiple poker games with ease.
- 🃏 **Hand Management**: Each game consists of multiple hands, with full hand history tracking.
- 🎲 **Flexible Game States**: Seamless transitions between pre-flop, flop, turn, river, and showdown.
- 👤 **Player Actions**: Track player actions like **Bet**, **Call**, **Fold**, **Check**, and **Raise**.
- 💸 **Pot Management**: Automatically manage pot sizes and distribute winnings.
- 🔄 **Hand History**: Detailed logging of every action, bet, and game event for each hand.
- 🚀 **TypeScript Powered**: Written in TypeScript for full type safety and easy integration with modern projects.

## Installation

You can install the APE Poker Engine via `npm`:

```bash
npm install ape-poker-engine
```

Or via `yarn`:

```bash
yarn add ape-poker-engine
```

## Getting Started

Here’s a quick example to get you started with APE:

### 1. Create a new game instance

```typescript
import { Game } from 'ape-poker-engine';

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

## API Documentation

### `Game`
The main class that manages multiple hands in a poker game session.

- **`startNewHand()`**: Starts a new hand of poker.
- **`getHandHistory()`**: Returns the history of all hands played in the game.

### `Table`
Each `Table` represents a single hand in the game.

- **`recordPlayerAction(action: PlayerActionRecord)`**: Records an action taken by a player during the hand.
- **`recordGameStateChange(state: GameStateChange)`**: Records a change in the game state (e.g., transitioning from flop to turn).
- **`getHandHistory()`**: Returns the hand history for the current hand.

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

This should give a solid foundation for your poker engine library's `README.md`, providing installation instructions, usage examples, and API documentation!