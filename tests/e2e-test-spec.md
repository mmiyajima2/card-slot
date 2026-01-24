# Card Slot E2E Test Specification

**Version:** 1.0.0
**Game Specification Version:** v1.0.1
**Test Type:** End-to-End (E2E) / Acceptance Test
**Test Method:** Manual Testing (Single tester operates both Player 1 and Player 2)

---

## Test Overview

This document describes manual E2E test cases for the Card Slot game.
Each test case should be executed by a single tester controlling both players alternately.

### Test Status Legend
- [ ] Not tested
- [x] Passed
- [!] Failed (requires fix)

---

## 1. Game Initialization Tests

### TC001: Deck Preparation and Card Dealing
**Objective:** Verify correct deck composition and initial card distribution

**Preconditions:** None

**Test Steps:**
1. Start a new game
2. Verify total deck contains 71 cards:
   - Rainbow 7: 5 cards
   - Silver 3: 8 cards
   - Cherry: 8 cards
   - Watermelon: 8 cards
   - Bell: 21 cards
   - REPLAY: 21 cards
3. Verify Player 1 receives 13 cards
4. Verify Player 2 receives 13 cards
5. Verify remaining deck has 45 cards (71 - 13 - 13)

**Expected Result:**
- Deck composition matches specification
- Each player has exactly 13 cards in hand
- Remaining deck has 45 cards

**Status:** [x]

---

### TC002: Board Layout Verification
**Objective:** Verify the 3x3 board slot numbering

**Test Steps:**
1. Display the game board
2. Verify slot numbers are arranged as:
   ```
   1 2 3
   8 9 4
   7 6 5
   ```
3. Verify all 9 slots are initially empty except for the center slot rule

**Expected Result:**
- Slot numbering matches the specification
- All slots are visually distinguishable

**Status:** [x]

---

### TC003: First Player Center Slot Placement (Valid Cards)
**Objective:** Verify the first player must place a card on Slot 9 with restrictions

**Test Steps:**
1. Start a new game
2. Player 1's first turn begins
3. Attempt to place a Cherry, Watermelon, Bell, or REPLAY card on Slot 9
4. Verify the placement is accepted
5. Verify no line effects are triggered (board not yet complete)

**Expected Result:**
- Valid cards (not Rainbow 7 or Silver 3) can be placed on Slot 9
- Turn completes successfully

**Status:** [ ]

---

### TC004: First Player Center Slot Placement (Invalid Cards - Rainbow 7)
**Objective:** Verify Rainbow 7 cannot be placed on Slot 9 as the first move

**Test Steps:**
1. Start a new game where Player 1 has Rainbow 7 in hand
2. Player 1's first turn begins
3. Attempt to place Rainbow 7 on Slot 9
4. Verify the placement is rejected or prevented

**Expected Result:**
- Rainbow 7 cannot be placed on Slot 9 during initial placement
- Error message or UI prevention occurs

**Status:** [ ]

---

### TC005: First Player Center Slot Placement (Invalid Cards - Silver 3)
**Objective:** Verify Silver 3 cannot be placed on Slot 9 as the first move

**Test Steps:**
1. Start a new game where Player 1 has Silver 3 in hand
2. Player 1's first turn begins
3. Attempt to place Silver 3 on Slot 9
4. Verify the placement is rejected or prevented

**Expected Result:**
- Silver 3 cannot be placed on Slot 9 during initial placement
- Error message or UI prevention occurs

**Status:** [ ]

---

### TC006: First Player Must Place on Slot 9
**Objective:** Verify Player 1 cannot place the first card on other slots

**Test Steps:**
1. Start a new game
2. Player 1's first turn begins
3. Attempt to place a card on Slot 1, 2, 3, 4, 5, 6, 7, or 8
4. Verify all attempts are rejected

**Expected Result:**
- Only Slot 9 is available for the first move
- Other slots are disabled or show error

**Status:** [ ]

---

### TC007: Heavenly Hand Instant Win
**Objective:** Verify instant win condition with Heavenly Hand

**Preconditions:** Manually set up initial hands (if possible) or restart until conditions met

**Test Steps:**
1. Set Player 1's initial hand to exactly:
   - Rainbow 7 × 5
   - Silver 3 × 8
2. Player 1 declares Heavenly Hand
3. Verify Player 1 wins immediately

**Expected Result:**
- Game ends immediately
- Player 1 is declared the winner
- No turns are played

**Status:** [ ]

**Note:** This is a rare event and may require special setup or extensive restarts

---

## 2. Basic Turn Mechanics Tests

### TC010: Normal Card Placement on Empty Slot
**Objective:** Verify basic card placement on empty slots

**Test Steps:**
1. Start a game (after initial Slot 9 placement)
2. Player 2 selects a card from hand
3. Place the card on any empty slot (e.g., Slot 1)
4. Verify card is placed and hand count decreases by 1
5. Verify turn ends if no lines are formed

**Expected Result:**
- Card is placed successfully
- Hand count decreases
- Turn transitions to next player

**Status:** [ ]

---

### TC011: Card Placement When Board is Full (Discard Required)
**Objective:** Verify forced discard mechanism when board is full

**Test Steps:**
1. Play until all 9 slots are filled
2. Current player selects a card from hand
3. Select a non-center slot card to discard (e.g., Slot 1)
4. Place the new card on Slot 1
5. Verify old card is discarded and new card is placed

**Expected Result:**
- Player can select which card to discard (except Slot 9)
- New card replaces the selected slot
- Old card moves to discard pile

**Status:** [ ]

---

### TC012: Cannot Discard Center Slot (Slot 9) When Board is Full
**Objective:** Verify Slot 9 cannot be selected for discard when placing a card

**Test Steps:**
1. Play until all 9 slots are filled
2. Current player selects a card from hand
3. Attempt to select Slot 9 for discard
4. Verify Slot 9 cannot be selected or is disabled

**Expected Result:**
- Slot 9 is protected from discard selection
- Only other 8 slots can be selected

**Status:** [ ]

---

### TC013: Hand Count Decreases After Placement
**Objective:** Verify hand management works correctly

**Test Steps:**
1. Note current player's hand count (e.g., 13 cards)
2. Place a card on the board
3. Verify hand count is now 12 cards
4. Continue playing several turns
5. Verify hand count updates correctly each time

**Expected Result:**
- Hand count decreases by 1 after each placement
- UI displays accurate hand count

**Status:** [ ]

---

## 3. Line Formation and Resolution Tests

### TC020: Horizontal Line Detection (Top Row)
**Objective:** Verify horizontal line (1,2,3) is detected

**Test Steps:**
1. Play until Slots 1, 2, and 3 all contain the same card type (e.g., Bell)
2. Verify the game detects a line is formed
3. Verify the player is prompted to resolve the line

**Expected Result:**
- Line (1,2,3) is detected
- Player must select this line or another completed line

**Status:** [ ]

---

### TC021: Horizontal Line Detection (Middle Row)
**Objective:** Verify horizontal line (8,9,4) is detected

**Test Steps:**
1. Play until Slots 8, 9, and 4 all contain the same card type
2. Verify the game detects a line is formed

**Expected Result:**
- Line (8,9,4) is detected

**Status:** [ ]

---

### TC022: Horizontal Line Detection (Bottom Row)
**Objective:** Verify horizontal line (7,6,5) is detected

**Test Steps:**
1. Play until Slots 7, 6, and 5 all contain the same card type
2. Verify the game detects a line is formed

**Expected Result:**
- Line (7,6,5) is detected

**Status:** [ ]

---

### TC023: Vertical Line Detection (Left Column)
**Objective:** Verify vertical line (1,8,7) is detected

**Test Steps:**
1. Play until Slots 1, 8, and 7 all contain the same card type
2. Verify the game detects a line is formed

**Expected Result:**
- Line (1,8,7) is detected

**Status:** [ ]

---

### TC024: Vertical Line Detection (Center Column)
**Objective:** Verify vertical line (2,9,6) is detected

**Test Steps:**
1. Play until Slots 2, 9, and 6 all contain the same card type
2. Verify the game detects a line is formed

**Expected Result:**
- Line (2,9,6) is detected

**Status:** [ ]

---

### TC025: Vertical Line Detection (Right Column)
**Objective:** Verify vertical line (3,4,5) is detected

**Test Steps:**
1. Play until Slots 3, 4, and 5 all contain the same card type
2. Verify the game detects a line is formed

**Expected Result:**
- Line (3,4,5) is detected

**Status:** [ ]

---

### TC026: Diagonal Line Detection (Main Diagonal)
**Objective:** Verify diagonal line (1,9,5) is detected

**Test Steps:**
1. Play until Slots 1, 9, and 5 all contain the same card type
2. Verify the game detects a line is formed

**Expected Result:**
- Line (1,9,5) is detected

**Status:** [ ]

---

### TC027: Diagonal Line Detection (Anti-diagonal)
**Objective:** Verify diagonal line (3,9,7) is detected

**Test Steps:**
1. Play until Slots 3, 9, and 7 all contain the same card type
2. Verify the game detects a line is formed

**Expected Result:**
- Line (3,9,7) is detected

**Status:** [ ]

---

### TC028: Multiple Lines - Player Selects One
**Objective:** Verify when multiple lines form, player selects exactly one

**Test Steps:**
1. Set up a situation where placing a card creates 2+ lines simultaneously
2. Place the card
3. Verify game prompts player to select exactly one line to resolve
4. Select one line
5. Verify only the selected line is resolved
6. Verify cards from that line are discarded

**Expected Result:**
- Player must choose exactly one line
- Only chosen line is resolved
- Other lines remain on board

**Status:** [ ]

---

### TC029: Line Resolution is Mandatory
**Objective:** Verify player cannot skip line resolution

**Test Steps:**
1. Form a line
2. Attempt to skip or cancel the line resolution
3. Verify the game forces resolution

**Expected Result:**
- Player cannot skip line resolution
- Turn cannot proceed without resolving the line

**Status:** [ ]

---

## 4. Line Effect Tests - Silver 3

### TC030: Silver 3 - Pick 2 Cards from Board
**Objective:** Verify Silver 3 effect allows picking up to 2 cards

**Test Steps:**
1. Form a line with three Silver 3 cards
2. Resolve the line
3. Verify Silver 3 cards are discarded
4. Select 2 cards from remaining board (not Slot 9)
5. Verify selected cards are added to hand

**Expected Result:**
- Three Silver 3 cards are discarded
- Player can select up to 2 cards (excluding Slot 9)
- Selected cards move to hand

**Status:** [ ]

---

### TC031: Silver 3 - Cannot Select Slot 9
**Objective:** Verify Slot 9 cannot be selected with Silver 3 effect

**Test Steps:**
1. Form a Silver 3 line
2. Resolve the line
3. Attempt to select the card in Slot 9
4. Verify Slot 9 is disabled or selection is rejected

**Expected Result:**
- Slot 9 cannot be selected
- Only other slots can be selected

**Status:** [ ]

---

### TC032: Silver 3 - Pick Only 1 Card (Optional)
**Objective:** Verify player can choose to pick fewer than 2 cards

**Test Steps:**
1. Form a Silver 3 line
2. Resolve the line
3. Select only 1 card from the board
4. Confirm selection
5. Verify only 1 card is added to hand

**Expected Result:**
- Player can choose to pick 1 card instead of 2
- Effect completes successfully

**Status:** [ ]

---

### TC033: Silver 3 - Pick 0 Cards (Board Empty or Only Slot 9)
**Objective:** Verify effect is skipped when no valid cards exist

**Test Steps:**
1. Form a Silver 3 line when only Slot 9 has a card (or board is empty after discard)
2. Resolve the line
3. Verify effect is automatically skipped
4. Turn ends

**Expected Result:**
- Effect is skipped
- No cards are added to hand
- Game continues normally

**Status:** [ ]

---

## 5. Line Effect Tests - Cherry

### TC040: Cherry - Pick 1 Card from Board
**Objective:** Verify Cherry effect allows picking up to 1 card

**Test Steps:**
1. Form a line with three Cherry cards
2. Resolve the line
3. Verify Cherry cards are discarded
4. Select 1 card from remaining board (not Slot 9)
5. Verify selected card is added to hand

**Expected Result:**
- Three Cherry cards are discarded
- Player can select 1 card (excluding Slot 9)
- Selected card moves to hand

**Status:** [ ]

---

### TC041: Cherry - Cannot Select Slot 9
**Objective:** Verify Slot 9 cannot be selected with Cherry effect

**Test Steps:**
1. Form a Cherry line
2. Resolve the line
3. Attempt to select the card in Slot 9
4. Verify Slot 9 is disabled or selection is rejected

**Expected Result:**
- Slot 9 cannot be selected
- Only other slots can be selected

**Status:** [ ]

---

### TC042: Cherry - Pick 0 Cards (Board Empty or Only Slot 9)
**Objective:** Verify effect is skipped when no valid cards exist

**Test Steps:**
1. Form a Cherry line when only Slot 9 has a card
2. Resolve the line
3. Verify effect is automatically skipped

**Expected Result:**
- Effect is skipped
- No cards are added to hand

**Status:** [ ]

---

## 6. Line Effect Tests - Watermelon

### TC050: Watermelon - Draw 2 Cards from Deck
**Objective:** Verify Watermelon effect draws 2 cards

**Test Steps:**
1. Note current deck count (e.g., 40 cards remaining)
2. Note current hand count (e.g., 13 cards)
3. Form a Watermelon line
4. Resolve the line
5. Verify 3 Watermelon cards are discarded
6. Verify 2 cards are drawn from deck one at a time
7. Verify deck count is now 38
8. Verify hand count is now 9 (10 - 1 placement + 2 drawn = 11, but line discards may affect this)

**Expected Result:**
- Three Watermelon cards are discarded
- 2 cards are drawn from deck
- Deck count decreases by 2
- Hand count increases by 2

**Status:** [ ]

---

### TC051: Watermelon - Draw 1 Card (Only 1 Card in Deck)
**Objective:** Verify partial draw when deck has only 1 card

**Test Steps:**
1. Play until deck has exactly 1 card
2. Form a Watermelon line
3. Resolve the line
4. Verify 1 card is drawn from deck
5. Verify deck becomes empty
6. Verify game ends immediately

**Expected Result:**
- 1 card is drawn (not 2)
- Deck becomes empty
- Game ends and scoring begins

**Status:** [ ]

---

### TC052: Watermelon - Deck Empty During Draw
**Objective:** Verify no draw occurs when deck is empty

**Test Steps:**
1. Play until deck is empty (0 cards)
2. Form a Watermelon line (if possible)
3. Resolve the line
4. Verify no cards are drawn
5. Verify game has already ended or is ending

**Expected Result:**
- No cards are drawn
- Game ends due to empty deck

**Status:** [ ]

---

### TC053: Watermelon - Must Accept Drawn Cards
**Objective:** Verify player must accept drawn cards even if disadvantageous

**Test Steps:**
1. Form a Watermelon line near end of game
2. Resolve the line
3. Draw 2 cards (e.g., Rainbow 7 and Silver 3 which are negative points)
4. Verify cards are added to hand regardless of score value

**Expected Result:**
- All drawn cards are added to hand
- No option to refuse cards
- Cards are visible in hand

**Status:** [ ]

---

## 7. Line Effect Tests - Bell

### TC060: Bell - Draw 1 Card from Deck
**Objective:** Verify Bell effect draws 1 card

**Test Steps:**
1. Note current deck count
2. Note current hand count
3. Form a Bell line
4. Resolve the line
5. Verify 3 Bell cards are discarded
6. Verify 1 card is drawn from deck

**Expected Result:**
- Three Bell cards are discarded
- 1 card is drawn from deck
- Deck count decreases by 1
- Hand increases by 1

**Status:** [ ]

---

### TC061: Bell - No Draw When Deck is Empty
**Objective:** Verify no draw occurs when deck is empty

**Test Steps:**
1. Play until deck is empty
2. Form a Bell line (if possible)
3. Resolve the line
4. Verify no card is drawn

**Expected Result:**
- No card is drawn
- Game continues or ends based on deck status

**Status:** [ ]

---

## 8. Line Effect Tests - REPLAY

### TC070: REPLAY - Replay Action Execution
**Objective:** Verify REPLAY effect executes replay action

**Test Steps:**
1. Note current deck count (e.g., 40 cards)
2. Form a REPLAY line
3. Resolve the line
4. Verify 3 REPLAY cards are discarded to discard pile
5. Verify replay action begins:
   - Up to 3 cards are discarded from deck, one at a time
   - Cards go directly to discard pile (not placed on board)
6. Verify deck count decreased by 3 (or fewer if deck became empty)
7. Verify no cards were placed on board
8. Verify no line effects are triggered

**Expected Result:**
- Three REPLAY cards are discarded
- Up to 3 additional cards discarded from deck
- No cards placed on board
- Deck counter decreases correctly
- No line effects trigger from replay

**Status:** [ ]

---

### TC071: REPLAY - Discard Count Based on Deck Size
**Objective:** Verify replay discards correct number based on deck size

**Test Steps:**
1. Play until deck has exactly 2 cards
2. Note current deck and discard pile counts
3. Form a REPLAY line
4. Resolve the line
5. Verify only 2 cards are discarded from deck (not 3, because deck became empty)
6. Verify deck is now empty
7. Verify game ends immediately
8. Verify UI shows "Discarded 2 card(s)"

**Expected Result:**
- Only available cards are discarded (2 in this case)
- Deck becomes empty
- Game ends due to deck depletion
- Message reflects actual number of cards discarded

**Status:** [ ]

---

### TC072: REPLAY - No Chaining
**Objective:** Verify REPLAY actions do not chain

**Test Steps:**
1. Form a REPLAY line
2. Resolve the line
3. Verify replay discards up to 3 cards from deck
4. Verify no additional REPLAY actions are triggered
5. Verify game continues to next player's turn

**Expected Result:**
- REPLAY executes exactly once
- No cascading REPLAY actions
- Discarded cards do not trigger effects
- No infinite loops

**Status:** [ ]

---

### TC073: REPLAY - When Deck is Empty
**Objective:** Verify REPLAY behavior when deck is empty

**Test Steps:**
1. Play until deck has 0 cards
2. Form a REPLAY line (if board state allows)
3. Resolve the line
4. Verify 0 cards are discarded
5. Verify UI message shows "Deck was empty"
6. Verify game has already ended or ends due to empty deck

**Expected Result:**
- Replay cannot discard from empty deck
- 0 cards discarded
- Appropriate message displayed
- Game ends due to empty deck

**Status:** [ ]

---

## 9. Forced Refresh Event Tests

### TC080: Forced Refresh - Board Full at Turn Start
**Objective:** Verify forced refresh when board is completely filled

**Test Steps:**
1. Play until all 9 slots are filled
2. Next player's turn begins
3. Verify forced refresh event occurs BEFORE player action:
   - Card in Slot 3 is discarded
   - Top card from deck is drawn and placed on Slot 3
   - Card in Slot 7 is discarded
   - Top card from deck is drawn and placed on Slot 7
4. Verify no line effects are evaluated during this process
5. Verify player can now take their normal turn

**Expected Result:**
- Forced refresh happens automatically
- Slots 3 and 7 are refreshed
- No line effects trigger
- Player turn proceeds normally

**Status:** [ ]

---

### TC081: Forced Refresh - Rainbow 7 and Silver 3 Can Be Placed
**Objective:** Verify special cards can be placed during forced refresh

**Test Steps:**
1. Fill all 9 slots
2. Ensure deck top cards include Rainbow 7 or Silver 3
3. Trigger forced refresh
4. Verify Rainbow 7 or Silver 3 can be placed on Slot 3 or 7 during refresh

**Expected Result:**
- No restriction on Rainbow 7 or Silver 3 during forced refresh
- Cards are placed successfully on Slots 3 and 7

**Status:** [ ]

---

### TC082: Forced Refresh - Deck Empties During Refresh
**Objective:** Verify game ends if deck empties during forced refresh

**Test Steps:**
1. Play until deck has 1 card remaining
2. Fill all 9 slots
3. Trigger forced refresh
4. First card drawn for Slot 3 depletes the deck
5. Verify game ends immediately

**Expected Result:**
- Game ends when deck reaches 0 cards
- Forced refresh may be incomplete
- Game proceeds to scoring

**Status:** [ ]

---

### TC083: Forced Refresh - Not Triggered When Board Has Empty Slots
**Objective:** Verify forced refresh only occurs when board is full

**Test Steps:**
1. Play until 8 slots are filled (1 empty)
2. Next player's turn begins
3. Verify NO forced refresh occurs
4. Verify player takes normal turn

**Expected Result:**
- Forced refresh does not occur
- Normal turn mechanics apply

**Status:** [ ]

---

## 10. Center Slot (Slot 9) Special Rules

### TC090: Slot 9 - Becomes Empty After Line Resolution
**Objective:** Verify Slot 9 can become empty through line resolution

**Test Steps:**
1. Play until Slot 9 is part of a completed line (e.g., line 2-9-6)
2. Resolve that line
3. Verify Slot 9 is now empty
4. Verify Slot 9 is now treated as a normal slot

**Expected Result:**
- Slot 9 becomes empty after line resolution
- Slot 9 can be targeted for placement on subsequent turns

**Status:** [ ]

---

### TC091: Slot 9 - Rainbow 7 Can Be Placed After Becoming Empty
**Objective:** Verify Rainbow 7 can be placed on Slot 9 once empty

**Test Steps:**
1. Empty Slot 9 through line resolution
2. Player with Rainbow 7 in hand takes a turn
3. Place Rainbow 7 on Slot 9
4. Verify placement is accepted

**Expected Result:**
- Rainbow 7 can be placed on Slot 9 after it becomes empty
- No restriction applies

**Status:** [ ]

---

### TC092: Slot 9 - Silver 3 Can Be Placed After Becoming Empty
**Objective:** Verify Silver 3 can be placed on Slot 9 once empty

**Test Steps:**
1. Empty Slot 9 through line resolution
2. Player with Silver 3 in hand takes a turn
3. Place Silver 3 on Slot 9
4. Verify placement is accepted

**Expected Result:**
- Silver 3 can be placed on Slot 9 after it becomes empty
- No restriction applies

**Status:** [ ]

---

## 11. Elimination Tests

### TC100: Player Elimination - 0 Cards in Hand
**Objective:** Verify player with 0 cards is eliminated immediately

**Test Steps:**
1. Play until a player has only 1 card in hand
2. That player places their last card
3. No line effect provides additional cards
4. Verify player is immediately eliminated
5. Verify eliminated player cannot win

**Expected Result:**
- Player with 0 cards is eliminated
- Elimination message is displayed
- Remaining player can continue or wins

**Status:** [ ]

---

### TC101: Eliminated Player Cannot Win
**Objective:** Verify eliminated players are excluded from victory

**Test Steps:**
1. Player 1 is eliminated (0 cards in hand)
2. Player 2 continues playing
3. Game ends (deck empty or other condition)
4. Verify Player 1 cannot win regardless of board state or score

**Expected Result:**
- Eliminated player is not evaluated for victory
- Only surviving players can win

**Status:** [ ]

---

### TC102: Both Players Eliminated - Edge Case
**Objective:** Verify behavior if both players somehow reach 0 cards

**Test Steps:**
1. Manipulate game state where both players reach 0 cards (may be impossible by normal rules)
2. Verify game ends
3. Verify outcome (draw or no winner)

**Expected Result:**
- Game ends appropriately
- No winner or draw declared

**Status:** [ ]

**Note:** This may be impossible under normal game rules but should be defined for completeness

---

## 12. Win Condition Tests - Immediate Win

### TC110: Rainbow 7 Immediate Win
**Objective:** Verify three Rainbow 7 in a line causes immediate win

**Test Steps:**
1. Play until a player can form a line with three Rainbow 7 cards
2. Place the third Rainbow 7 to complete the line
3. Verify game ends immediately
4. Verify that player wins instantly

**Expected Result:**
- Game ends immediately upon forming Rainbow 7 line
- Winner is declared
- No further turns or scoring

**Status:** [ ]

---

### TC111: Rainbow 7 Win - Last Card in Hand
**Objective:** Verify Rainbow 7 win is valid even if it was the player's last card

**Test Steps:**
1. Play until a player has only 1 card in hand (Rainbow 7)
2. Place that Rainbow 7 to complete a Rainbow 7 line
3. Verify player wins immediately (not eliminated)

**Expected Result:**
- Player wins before elimination check
- Immediate victory takes precedence over elimination

**Status:** [ ]

---

## 13. Win Condition Tests - End of Deck

### TC120: Deck Empty - Game Ends Immediately
**Objective:** Verify game ends when deck reaches 0 cards

**Test Steps:**
1. Play until deck has 1 card
2. Trigger any effect that draws the last card (Bell, Watermelon, REPLAY, Forced Refresh)
3. Verify game ends immediately after deck becomes empty
4. Verify scoring phase begins

**Expected Result:**
- Game ends when deck = 0
- No further turns are played
- Scoring begins immediately

**Status:** [ ]

---

### TC121: Scoring - Hand Score Calculation
**Objective:** Verify correct score calculation for remaining hand

**Test Steps:**
1. Play until deck is empty
2. Note Player 1's hand composition
3. Calculate expected score:
   - Rainbow 7: -1 each
   - Silver 3: -1 each
   - Cherry: +1 each
   - Watermelon: +2 each
   - Bell: +1 each
   - REPLAY: 0 each
4. Verify displayed score matches calculation
5. Repeat for Player 2

**Expected Result:**
- Score is calculated correctly
- All card values are applied properly

**Status:** [ ]

---

### TC122: Scoring - Player with Higher Score Wins
**Objective:** Verify winner determination by score

**Test Steps:**
1. Play until deck is empty
2. Player 1 score: +5
3. Player 2 score: +3
4. Verify Player 1 is declared winner

**Expected Result:**
- Higher score wins
- Winner is announced correctly

**Status:** [ ]

---

### TC123: Scoring - Negative Score
**Objective:** Verify negative scores are handled correctly

**Test Steps:**
1. Play until deck is empty
2. Player 1 has many Rainbow 7 and Silver 3 (e.g., score: -7)
3. Player 2 has positive cards (e.g., score: +2)
4. Verify Player 2 wins

**Expected Result:**
- Negative scores are calculated correctly
- Player with higher (less negative) score wins

**Status:** [ ]

---

### TC124: Scoring - Tie Score
**Objective:** Verify tie handling when both players have same score

**Test Steps:**
1. Play until deck is empty
2. Both players have same hand score (e.g., both have +4)
3. Verify game declares a tie/draw

**Expected Result:**
- Tie is detected
- Both players are declared winners or game declares a draw

**Status:** [ ]

---

### TC125: Scoring - Eliminated Player Not Evaluated
**Objective:** Verify eliminated players don't participate in scoring

**Test Steps:**
1. Player 1 is eliminated earlier in game
2. Play until deck is empty
3. Only Player 2's score is evaluated
4. Verify Player 2 wins regardless of score

**Expected Result:**
- Eliminated player is not scored
- Surviving player wins automatically

**Status:** [ ]

---

## 14. Edge Cases and Error Handling

### TC130: Empty Deck - No Draw Effects Occur
**Objective:** Verify all draw effects are skipped when deck is empty

**Test Steps:**
1. Empty the deck
2. Attempt to resolve Bell, Watermelon, or REPLAY lines
3. Verify no draws occur
4. Verify game continues or ends appropriately

**Expected Result:**
- Draw effects are skipped
- No errors occur
- Game state remains consistent

**Status:** [ ]

---

### TC131: Invalid Line - Two Different Cards
**Objective:** Verify lines with non-matching cards are not detected

**Test Steps:**
1. Place Cherry on Slot 1
2. Place Bell on Slot 2
3. Place Cherry on Slot 3
4. Verify NO line is detected (cards don't match)

**Expected Result:**
- No line is formed
- No resolution occurs
- Game continues normally

**Status:** [ ]

---

### TC132: Partial Line - Two Matching Cards
**Objective:** Verify lines require exactly three matching cards

**Test Steps:**
1. Place Bell on Slot 1
2. Place Bell on Slot 2
3. Leave Slot 3 empty
4. Verify NO line is detected

**Expected Result:**
- No line is formed
- Game continues normally

**Status:** [ ]

---

### TC133: UI - Hand Card Count Display
**Objective:** Verify hand count is always accurate in UI

**Test Steps:**
1. Start game (13 cards each)
2. Play several turns with various effects
3. After each action, verify displayed hand count matches actual count

**Expected Result:**
- Hand count display is always accurate
- Updates occur immediately after each action

**Status:** [ ]

---

### TC134: UI - Deck Card Count Display
**Objective:** Verify deck count is always accurate in UI

**Test Steps:**
1. Start game (45 cards in deck)
2. Play several turns with various draw effects
3. After each draw, verify displayed deck count matches actual count

**Expected Result:**
- Deck count display is always accurate
- Updates occur immediately after draws

**Status:** [ ]

---

### TC135: UI - Board State Visibility
**Objective:** Verify all board cards are clearly visible

**Test Steps:**
1. Fill the board with various cards
2. Verify each slot clearly shows which card type is present
3. Verify card ownership is clear (if applicable)

**Expected Result:**
- All cards are visually distinguishable
- Slot numbers are clear
- Current game state is obvious

**Status:** [ ]

---

### TC136: Turn Indicator
**Objective:** Verify current player is clearly indicated

**Test Steps:**
1. Start game
2. Verify Player 1's turn is indicated
3. Complete turn
4. Verify Player 2's turn is indicated
5. Alternate several turns

**Expected Result:**
- Current player is always clearly shown
- Turn indicator updates after each turn

**Status:** [ ]

---

## 15. Game Flow Integration Tests

### TC140: Complete Game - Basic Victory (Rainbow 7)
**Objective:** Play a complete game to Rainbow 7 victory

**Test Steps:**
1. Start a new game
2. Play strategically to form a Rainbow 7 line
3. Complete the line
4. Verify immediate victory

**Expected Result:**
- Game progresses smoothly
- Victory is awarded correctly
- No errors occur

**Status:** [ ]

---

### TC141: Complete Game - Deck Empty Victory
**Objective:** Play a complete game until deck is empty

**Test Steps:**
1. Start a new game
2. Play until deck is depleted
3. Verify scoring occurs
4. Verify correct winner is determined

**Expected Result:**
- Game progresses smoothly to completion
- Scoring is accurate
- Winner determination is correct

**Status:** [ ]

---

### TC142: Complete Game - Player Elimination Victory
**Objective:** Play a complete game where one player is eliminated

**Test Steps:**
1. Start a new game
2. Play until one player reaches 0 cards
3. Verify elimination occurs
4. Verify other player wins

**Expected Result:**
- Elimination is detected immediately
- Remaining player wins
- Game ends appropriately

**Status:** [ ]

---

### TC143: Multiple Forced Refreshes in One Game
**Objective:** Verify multiple forced refresh events work correctly

**Test Steps:**
1. Play a game where board fills multiple times
2. Verify each forced refresh executes correctly
3. Verify deck depletes appropriately
4. Complete the game

**Expected Result:**
- All forced refreshes work correctly
- No errors or state corruption
- Game completes successfully

**Status:** [ ]

---

### TC144: Complex Turn - Multiple Lines Available
**Objective:** Test player choice when multiple lines are available

**Test Steps:**
1. Set up board state with 2+ completed lines
2. Verify player can choose which line to resolve
3. Choose one line
4. Verify only chosen line is resolved
5. Play additional turns to resolve remaining lines

**Expected Result:**
- Player has clear choice of which line to resolve
- Only selected line resolves
- Other lines remain available for future turns
- Game state is consistent

**Status:** [ ]

---

### TC145: Rapid Card Cycling with REPLAY and Bell
**Objective:** Test game stability with many card draws

**Test Steps:**
1. Play a game focusing on forming REPLAY and Bell lines frequently
2. Cycle through many cards rapidly
3. Verify deck count decreases correctly
4. Verify hand sizes remain consistent
5. Complete the game

**Expected Result:**
- Game handles many draws without errors
- All counts remain accurate
- No infinite loops or crashes

**Status:** [ ]

---

## Test Summary Template

After completing all tests, fill out this summary:

```
Total Test Cases: 145
Passed: ___
Failed: ___
Not Tested: ___

Critical Failures (game-breaking bugs): ___
Minor Failures (UI issues, edge cases): ___

Overall Test Coverage: ___%
Ready for Release: YES / NO

Notes:
[Add any observations, issues, or recommendations here]
```

---

## Appendix: Test Data Setup

### Sample Test Scenarios

**Scenario A: Quick Rainbow 7 Win Setup**
- Manually set Player 1 hand to include 3+ Rainbow 7
- Arrange board to allow easy line formation
- Useful for: TC110, TC111

**Scenario B: Near-Empty Deck Setup**
- Play until deck has 1-3 cards
- Useful for: TC051, TC052, TC082, TC120

**Scenario C: Full Board Setup**
- Fill all 9 slots with mixed cards
- Useful for: TC011, TC012, TC080-TC083

**Scenario D: Complex Multi-Line Setup**
- Arrange board with 2+ lines already formed
- Useful for: TC028, TC144

---

## Notes for Testers

1. **Save Game States:** If the game supports save/load, save critical game states for retesting
2. **Screenshot Bugs:** Capture screenshots of any failures for bug reports
3. **Record Timing:** Note which tests take longest to set up or execute
4. **Edge Case Variations:** Feel free to test additional edge cases beyond those listed
5. **Automation Potential:** Mark tests that could potentially be automated in future

---

**End of Test Specification**
