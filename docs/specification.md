# Card Slot
**Game Specification (v1.1.1)**

---

## 1. Game Overview

Card Slot is a two-player competitive board game inspired by slot machine symbols.  
Players place cards onto a 3×3 board, form lines (combinations), resolve their effects,  
and aim to achieve the win conditions.

Strategic placement, hand management, and **control of the Center Slot (9)** are core elements of the game.  
In addition, **Slots 3 and 7** are strategically important due to forced refresh rules.

**Survive First, Win Later**

---

## 2. Players

- Exactly 2 players

---

## 3. Cards

| Symbol       | Count |
|--------------|------:|
| Rainbow 7    | 5 |
| Silver 3     | 5 |
| Cherry       | 8 |
| Watermelon   | 8 |
| Bell         | 13 |
| REPLAY       | 13 |
| **Total**    | **52** |

---

## 4. Board

### 4.1 Slot Layout

```txt
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
2. Deal **10 cards** to each player as their **Hand**
3. Place the remaining cards face-down as the Deck
4. Prepare a face-down **Discard Pile**
5. Decide the first player by any fair method

---

## 6. Special Rules at Game Start

### 6.1 Center Slot Initialization

- No card is placed on Slot 9 during setup
- On the first player's first turn, they must place one card from Hand onto Slot 9

**Restrictions**

- Rainbow 7 and Silver 3 cannot be placed on Slot 9 during this initial placement

---

## 7. Turn Structure

### 7.1 Forced Refresh Event (Before Player Action)

If the Board is completely filled at the start of a turn:

1. Discard the card in Slot 3
2. Draw the top card of the Deck and place it onto Slot 3
3. Discard the card in Slot 7
4. Draw the top card of the Deck and place it onto Slot 7

**Notes**

- This is not a player action
- No Line effects are evaluated
- Rainbow 7 and Silver 3 may be placed
- **If the Deck becomes empty at any point, the game ends immediately**

---

### 7.2 Normal Turn

1. Choose 1 card from Hand
2. Place it on any empty Slot  
   - If no Slots are empty, discard 1 non-center card, then place the card
3. If one or more Lines are completed, select exactly 1 Line and resolve it
4. End the turn

---

## 8. Line Resolution Rules (Common)

- Resolving a Line is mandatory
- Players may not skip resolution, even if disadvantageous
- All resolved Line cards are discarded
- Cards gained by effects are added to Hand immediately
- Slot 9 cannot be directly selected by effects
- If the Deck is empty, draw effects do not occur

### 8.1 Center Slot (9) — Additional Notes

- Slot 9 may become empty via Line resolution
- Once empty, it is treated as a normal Slot
- Rainbow 7 and Silver 3 may then be placed on Slot 9

---

## 9. Line Effects

### 9.1 Silver 3 (Three of a Kind)

- Discard the resolved cards
- **Immediately set the Deck to 0**
- The game ends at once and proceeds to **End of Deck** evaluation

**Notes**

- This effect represents a deliberate decision to end the game
- Survival status is checked before scoring

---

### 9.2 Cherry (Three of a Kind)

- Discard the resolved cards
- Select up to 1 card from the Board and add it to Hand
- If no valid cards exist, the effect is skipped
- If only one valid card is available, taking it is mandatory

**Restrictions**

- Slot 9 cannot be selected

---

### 9.3 Watermelon (Three of a Kind)

- Discard the resolved cards
- Draw the top two cards from the Deck, one at a time

**Clarification**

- If the Deck contains only 1 card, that card is drawn and added to Hand
- The game then ends immediately when the Deck becomes empty
- Players must accept the drawn card even if it is disadvantageous in terms of score

---

### 9.4 Bell (Three of a Kind)

- Discard the resolved cards
- Draw the top card of the Deck

---

### 9.5 REPLAY (Three of a Kind)

- Discard the resolved cards
- Resolve a **Replay Action**

---

## 10. Replay Action

1. Discard cards from the top of the Deck, one at a time, **up to 3 cards**
2. Discarding stops early if the Deck becomes empty
3. **If the Deck reaches 0 cards during this process, the game ends immediately**
4. Replay Actions do not chain
5. No cards are drawn or placed on the Board
6. No Line effects are evaluated

**Notes**

- This action represents replaying and discarding the current outcome
- Replay does not directly affect the Board or Hands

---

## 11. Elimination

- A player with 0 cards in Hand is immediately eliminated

---

## 12. Win Conditions

### Survival Condition (Fundamental)

- Eliminated players can never win
- Survival is a prerequisite for victory

---

### 12.1 Immediate Win

- Forming three Rainbow 7 in a Line results in an immediate win
- This is valid even if the final card was the last card in Hand

---

### 12.2 End of Deck

- When the Deck reaches 0 cards, the game ends immediately
- Only non-eliminated players are evaluated

#### Hand Score

| Card       | Score |
|------------|------:|
| Rainbow 7  | -1 |
| Silver 3   | -1 |
| Cherry     | 1 |
| Watermelon | 2 |
| Bell       | 1 |
| REPLAY     | 0 |

---

## 13. Notes

- Slot 9 is the most strategically important Slot
- Slots 3 and 7 are important due to Forced Refresh
- Silver 3 represents a strategic choice to end the game
- Line resolution is mandatory and central to balance
- **Survive First, Win Later**
