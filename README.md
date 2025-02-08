# Global Game Jam 2025

## Background

This is a game originally created for the Global Game Jam 2025.

The [state of the release time](https://github.com/p-runge/global-game-jam-2025/releases/tag/ggj-deadline) was tagged regardingly.

## What is this?

This is a game called **Magic: The Bubbling**. It is a 1v1 PvP card game inspired by games like Hearthstone or Magic: The Gathering.

It is designed to fit the Global Game Jam 2025's theme: "bubbles".

### How to play?

Wait for another player to join the queue. As soon as an opponent is found, a new game starts automatically.

Once the game begins, you draw cards from your deck, play creatures from your hand, let them fight the opponent's ones on the battlefield, and apply spells to them to strengthen or weaken them.

### How does the battling system work?

- Bubbles absorb each other.
- Bubbles can only absorb other ones that are smaller than themself.
- When absorbing another bubble their `Size` get summed up.
- When absorbing another bubble the bigger bubble's `Stability` gets reduced by the size of the absorbed bubble.
- When a bubble's `Stability` reaches 0 it pops.

### When do I win?

Reach a `Size` of 20 with any of your bubbles without popping before.
