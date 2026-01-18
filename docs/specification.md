# Card Slot

**Game Specification (v1.0.0)**

---

## 1. Game Overview

Card Slot is a two-player competitive board game inspired by slot machine symbols.
Players place cards onto a 3×3 board, form lines (combinations), resolve their effects,
and aim to achieve the win conditions.

Strategic placement, hand management, and **control of the Center Slot (9)** are core elements of the game.
In addition, **Slot 1** is treated as the second most important slot due to forced refresh rules.

---

## 2. Players

* Exactly 2 players

---

## 3. Cards

| Symbol     |  Count |
| ---------- | -----: |
| Gold 7     |      8 |
| Silver 3   |      5 |
| Cherry     |      8 |
| Watermelon |      8 |
| Bell       |     21 |
| REPLAY     |     13 |
| **Total**  | **63** |

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

* Horizontal: (1,2,3) / (8,9,4) / (7,6,5)
* Vertical: (1,8,7) / (2,9,6) / (3,4,5)
* Diagonal: (1,9,5) / (3,9,7)

---

## 5. Setup

1. Shuffle all cards to form the **Deck**
2. Deal 13 cards to each player as their **Hand**
3. Place the remaining cards face-down as the Deck
4. Prepare a face-down **Discard Pile**
5. Decide the first player by any fair method (e.g., Rock–Paper–Scissors)

---

## 6. Special Rules at Game Start

### 6.1 Center Slot Initialization

* No card is placed on the Center Slot (9) during setup
* On the first player's first turn, they must place **one card from their Hand** onto Slot 9

**Restrictions**

* Gold 7 and Silver 3 **cannot** be placed on the Center Slot during this initial placement

---

### 6.2 Heavenly Hand (Rare Instant Win)

If a player's initial Hand of 13 cards consists of:

* Gold 7 × 8 cards
* Silver 3 × 5 cards

that player may **declare Heavenly Hand** and wins the game immediately.

* This declaration may be made regardless of turn order
* This is an extremely rare win condition, separate from normal gameplay

---

## 7. Turn Structure

### 7.1 Forced Refresh Event (Before Player Action)

If the Board is completely filled with cards at the start of a player's turn,
the following event occurs **before** any player action:

1. Discard the card in **Slot 1** to the Discard Pile
2. Draw the top card of the Deck
3. Place it onto **Slot 1**

**Important Notes**

* This is **not** a player action
* No Line effects are evaluated, even if a Line is completed
* Gold 7 and Silver 3 may be placed by this event
* If the Deck is empty when this event would occur, the game ends immediately

---

### 7.2 Normal Turn

After resolving the Forced Refresh Event (if any), the player performs a normal turn:

1. Choose 1 card from your Hand
2. Place it on any empty Slot on the Board

   * If no Slots are empty, discard 1 non-center card of your choice from the Board to the Discard Pile, then place the card
3. If one or more Lines are completed, **you must select exactly one Line and resolve it**
4. End the turn

---

## 8. Line Resolution Rules (Common)

* Resolving a Line is **mandatory** when one or more Lines are completed
* Players may not skip Line resolution, even if the effect is disadvantageous
* All cards forming the resolved Line are moved to the Discard Pile
* Cards obtained by effects are immediately added to the Hand
* Cards on the Center Slot (9) **cannot be directly selected or removed** by effects
* If the Deck is empty, draw effects do not occur

### 8.1 Center Slot (9) — Additional Notes

* Although cards on Slot 9 cannot be directly selected or removed by effects,
  Slot 9 **may become empty** as a result of resolving a Line that includes it
* Once Slot 9 is empty, it is treated as a normal empty Slot
* In this case, **Gold 7 and Silver 3 may be placed on Slot 9**
* The placement restriction for Slot 9 applies **only during game setup**

---

## 9. Line Effects

### 9.1 Silver 3 (Three of a Kind) — High Tier

1. Discard the resolved Silver 3 cards
2. Select up to **2 cards** from the Board and add them to your Hand

**Restrictions**

* Center Slot (9) cannot be selected
* If no valid cards exist, nothing happens

---

### 9.2 Cherry (Three of a Kind)

1. Discard the resolved Cherry cards
2. Select up to **1 card** from the Board and add it to your Hand

**Restrictions**

* Center Slot (9) cannot be selected
* If no valid cards exist, nothing happens

---

### 9.3 Watermelon (Three of a Kind)

* Discard the resolved Watermelon cards
* Draw **2 cards** from the top of the Deck
* If the Deck is empty, nothing happens

---

### 9.4 Bell (Three of a Kind)

* Discard the resolved Bell cards
* Draw **1 card** from the top of the Deck
* If the Deck is empty, nothing happens

---

### 9.5 REPLAY (Three of a Kind)

* Discard the resolved REPLAY cards
* Resolve a **Replay Action**

---

## 10. Replay Action

A Replay Action is **not a normal turn** and follows these rules:

1. Draw the top card of the Deck

   * If the Deck is empty, the Replay Action ends immediately and no card is placed
2. Place it on the empty Slot with the **lowest slot number**
3. No Line effects are evaluated
4. Replay Actions do not chain or repeat

---

## 11. Elimination

* A player with **0 cards in Hand** is immediately eliminated

---

## 12. Win Conditions

### Survival Condition (Fundamental)

* A player who is eliminated (Hand size becomes 0) can never win the game.
* **Survival is a fundamental requirement for victory.**
* All win condition evaluations are performed only among non-eliminated players.

---

### 12.1 Immediate Win

* If a player forms **three Gold 7 cards in a Line**, that player wins immediately, even if the played card was their last card in Hand.

---

### 12.2 End of Deck

* When the Deck reaches 0 cards, the game ends immediately
* Only non-eliminated players are evaluated

#### Hand Score

| Card       | Score |
| ---------- | ----: |
| Gold 7     |    -1 |
| Silver 3   |    -1 |
| Cherry     |     2 |
| Watermelon |     2 |
| Bell       |     1 |
| REPLAY     |     0 |

---

## 13. Notes

* The Center Slot (9) is the most strategically important Slot in the game
* Slot 1 is the second most important Slot due to the Forced Refresh Event
* Resolving Lines is mandatory and central to maintaining game flow
* In particular, REPLAY Lines may provide limited immediate benefit, but are essential to preventing board stagnation
* These placement rules and restrictions are intentional and central to game balance
* Endgame decisions often revolve around board control and hand score optimization
