# Card Slot
**Game Specification (vBeta.3)**

---

## 1. Game Overview

Card Slot is a two-player competitive board game inspired by slot machine symbols.
Players place cards onto a 3×3 board, form lines (combinations), resolve their effects,
and aim to achieve the win conditions.

Strategic placement, hand management, and **control of the Center Slot (9)** are core elements of the game.

---

## 2. Players

- Exactly 2 players

---

## 3. Cards

| Symbol | Count |
|------|------:|
| Gold 7 | 5 |
| Silver 3 | 4 |
| Cherry | 9 |
| Watermelon | 9 |
| Bell | 15 |
| REPLAY | 15 |
| **Total** | **57** |

---

## 4. Board

### 4.1 Slot Layout

```
+---+---+---+
| 1 | 2 | 3 |
+---+---+---+
| 8 | 9 | 4 |
+---+---+---+
| 7 | 6 | 5 |
+---+---+---+
```

### 4.2 Lines (8 Total)

- Horizontal: (1,2,3) / (8,9,4) / (7,6,5)
- Vertical: (1,8,7) / (2,9,6) / (3,4,5)
- Diagonal: (1,9,5) / (3,9,7)

---

## 5. Setup

1. Shuffle all cards to form the **Deck**
2. Deal 9 cards to each player as their **Hand**
3. Place the remaining cards face-down as the Deck
4. Prepare a face-down **Discard Pile**
5. Decide the first player by any fair method (e.g., Rock–Paper–Scissors)

---

## 6. Special Rules at Game Start

### 6.1 Center Slot Initialization

- No card is placed on the Center Slot (9) during setup
- On the first player's first turn, they must place **one card from their Hand** onto Slot 9

**Restrictions**

- Gold 7 and Silver 3 **cannot** be placed on the Center Slot

---

### 6.2 Heavenly Hand (Rare Instant Win)

If a player's initial Hand of 9 cards consists of:

- Gold 7 × 5 cards
- Silver 3 × 4 cards

that player may **declare Heavenly Hand** and wins the game immediately.

- This declaration may be made regardless of turn order
- This is an extremely rare win condition, separate from normal gameplay

---

## 7. Turn Structure

### 7.1 Normal Turn

1. Choose 1 card from your Hand
2. Place it on any empty Slot on the Board
   - If no Slots are empty, discard 1 non-center card from the Board to the Discard Pile, then place the card
3. If any Lines are completed, choose **one** Line to resolve
4. End the turn

---

## 8. Line Resolution Rules (Common)

- All cards forming the resolved Line are moved to the Discard Pile
- Cards obtained by effects are immediately added to the Hand
- Cards on the Center Slot (9) **cannot be selected or removed** by effects
- If the Deck is empty, draw effects do not occur

---

## 9. Line Effects

### 9.1 Silver 3 (Three of a Kind) — High Tier

1. Discard the resolved Silver 3 cards
2. Select up to **2 cards** from the Board and add them to your Hand

**Restrictions**

- Center Slot (9) cannot be selected
- If no valid cards exist, nothing happens

---

### 9.2 Cherry (Three of a Kind)

1. Discard the resolved Cherry cards
2. Select up to **1 card** from the Board and add it to your Hand

**Restrictions**

- Center Slot (9) cannot be selected
- If no valid cards exist, nothing happens

---

### 9.3 Watermelon (Three of a Kind)

- Discard the resolved Watermelon cards
- Draw **2 cards** from the top of the Deck

---

### 9.4 Bell (Three of a Kind)

- Discard the resolved Bell cards
- Draw **1 card** from the top of the Deck

---

### 9.5 REPLAY (Three of a Kind)

- Discard the resolved REPLAY cards
- Resolve a **Replay Action**

---

## 10. Replay Action

A Replay Action is **not a normal turn** and follows these rules:

1. Draw the top card of the Deck
2. Place it on the empty Slot with the **lowest slot number**
3. No Line effects are evaluated
4. Replay Actions do not chain or repeat

---

## 11. Elimination

- A player with **0 cards in Hand** is immediately eliminated

---

## 12. Win Conditions

### 12.1 Immediate Win

- If a player forms **three Gold 7 cards in a Line**, that player wins immediately

### 12.2 End of Deck

- When the Deck reaches 0 cards, the game ends at the end of that turn
- Only non-eliminated players are evaluated

#### Hand Score

| Card | Score |
|------|------:|
| Gold 7 | -1 |
| Silver 3 | -1 |
| Cherry | 2 |
| Watermelon | 2 |
| Bell | 1 |
| REPLAY | 0 |

---

## 13. Notes

- The Center Slot (9) is the most strategically important Slot in the game
- Its placement rules and restrictions are intentional and central to game balance
- Endgame decisions often revolve around board control and hand score optimization
