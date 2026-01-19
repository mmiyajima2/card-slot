# Card Slot
**Survive First, Win Later**

An original card game combining card placement mechanics with slot machine-style symbols.
Place cards on a 3×3 board, form combinations, and aim for victory through strategic play.

This repository contains the **game rules, implementation, and web deployment code**.

---

## Overview

- **Genre:** Card Game / Board Game
- **Players:** 2 players (Human vs Human or CPU)
- **Play Time:** 5-10 minutes
- **Platform:** Web Browser (HTML / CSS / JavaScript)
- **Monetization:** None (Non-commercial)

---

## Game Features

- **Slot-Inspired Combinations:** Form lines with matching card symbols
- **3×3 Strategic Board:** Tactical placement with center slot importance
- **Deck Management:** Draw, hand management, and discard pile mechanics
- **Line Effect Resolution:** Choose which completed line to resolve
- **REPLAY Mechanics:** Chain actions for additional card placements
- **Rainbow 7 Victory:** Instant win condition with three Rainbow 7s in a line

---

## Key Mechanics

### Cards (71 Total)
- **Rainbow 7** (5 cards): Rare card with instant win condition, negative score
- **Silver 3** (8 cards): Powerful board control effect
- **Cherry** (8 cards): Pick 1 card from board
- **Watermelon** (8 cards): Draw 2 cards from deck
- **Bell** (21 cards): Draw 1 card from deck
- **REPLAY** (21 cards): Automatic placement on lowest empty slot

### Victory Conditions
1. **Rainbow 7 Line:** Three Rainbow 7 cards in a line (instant win)
2. **Heavenly Hand:** Starting hand with 5 Rainbow 7s + 8 Silver 3s (instant win)
3. **Opponent Elimination:** Opponent runs out of cards
4. **Deck Exhaustion:** Higher hand score when deck is empty

### Special Rules
- **First Turn:** Must place on center slot (9), Rainbow 7 and Silver 3 forbidden
- **Forced Refresh:** When board is full, slots 3 and 7 are automatically refreshed
- **Center Slot Priority:** Slot 9 cannot be directly selected by card effects
- **Mandatory Line Resolution:** Players must resolve completed lines even if disadvantageous

---

## Game Status

- **Web Version:** In development
- **Purpose:**
  - Playable prototype for testing and feedback
  - Iteration based on player reviews
  - Balance and rule refinement

---

## Documentation

Detailed game rules and specifications are available in:

- **Game Specification (v1.0.1)**
  → `docs/specification.md`

※ Specifications are subject to change based on playtesting feedback.

---

## How to Play

1. Open `index.html` in a modern web browser
2. Click "New Game" to start
3. Players alternate turns placing cards on the 3×3 board
4. Complete lines (3 matching cards) to trigger effects
5. Win by achieving Rainbow 7 line, eliminating opponent, or having higher score when deck is empty

---

## Technical Details

### File Structure
```
card-slot/
├── index.html          # Main game page
├── css/
│   └── style.css       # Game styling
├── js/
│   ├── card.js         # Card definitions and mechanics
│   ├── deck.js         # Deck management
│   ├── board.js        # Board state and logic
│   ├── hand.js         # Hand management
│   ├── player.js       # Player state
│   ├── lineEffectResolver.js  # Line effect resolution
│   ├── gameManager.js  # Core game logic
│   └── main.js         # UI and event handling
├── assets/
│   └── *.svg           # Card graphics
└── docs/
    └── specification.md # Detailed game rules
```

### Technologies
- Pure JavaScript (ES6+)
- HTML5 / CSS3
- SVG graphics for cards
- No external dependencies

---

## Copyright & License

### Copyright
The following content in this repository is copyrighted by the author:
- Game specification documents
- Source code
- UI design
- Graphics and assets

While game mechanics and rules themselves are not subject to copyright,
**the expression and implementation in this repository are protected works**.

### Usage Terms
- Personal use and learning purposes are welcome
- **Commercial use and unauthorized distribution are prohibited**
- For modification or redistribution, please contact the author in advance

※ See `LICENSE` file for details.

---

## Author

- **Developer:** Card Slot Project
- **Type:** Independent Development
- **Contact:** mmiyajima2@gmail.com

This project is created as part of learning and creative activities.

---

## Disclaimer

- The author is not responsible for any damages resulting from the use of this game
- Specifications may change or public access may be suspended without notice
- This is an original game and does not reproduce any existing slot machines or commercial games

---

## Feedback

Feedback, improvement suggestions, and bug reports are welcome!
Please contact: mmiyajima2@gmail.com

---

© 2026 Card Slot Project
