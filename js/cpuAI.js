/**
 * cpuAI.js
 * CPU AI decision logic for Card Slot game (Easy level)
 */

(function() {
    'use strict';

    const { SYMBOLS } = globalThis.CardSlot;

    /**
     * Utility: Random choice from array
     */
    function randomChoice(array) {
        if (!array || array.length === 0) return null;
        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }

    /**
     * Utility: Random number between min and max (inclusive)
     */
    function randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Utility: Sleep for specified milliseconds
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Card Selection Logic
     * Priority:
     * 1. If only 1 card in hand, select it
     * 2. If first turn (center slot), exclude Rainbow 7 and Silver 3
     * 3. Normal: Prefer cards other than Rainbow 7 and Silver 3
     * 4. Fallback: Random from all cards
     */
    function selectCardToPlay(hand, gamePhase) {
        const cards = hand.cards;

        if (cards.length === 0) {
            console.error('[CPU AI] No cards in hand');
            return null;
        }

        if (cards.length === 1) {
            return cards[0];
        }

        // First turn: Cannot place Rainbow 7 or Silver 3 on center slot
        if (gamePhase === 'firstTurn') {
            const validCards = cards.filter(card =>
                card.symbol !== SYMBOLS.RAINBOW_7 && card.symbol !== SYMBOLS.SILVER_3
            );

            if (validCards.length > 0) {
                return randomChoice(validCards);
            }

            // Fallback (should not happen in valid game state)
            console.warn('[CPU AI] No valid cards for first turn, selecting randomly');
            return randomChoice(cards);
        }

        // Normal turn: Prefer cards other than Rainbow 7 and Silver 3
        const preferredCards = cards.filter(card =>
            card.symbol !== SYMBOLS.RAINBOW_7 && card.symbol !== SYMBOLS.SILVER_3
        );

        if (preferredCards.length > 0) {
            return randomChoice(preferredCards);
        }

        // Only Rainbow 7 and Silver 3 left
        return randomChoice(cards);
    }

    /**
     * Helper: Find slots that would complete a line for the given card
     */
    function findLineCompletingSlots(board, card, emptySlots) {
        const completingSlots = [];

        for (const slot of emptySlots) {
            // Temporarily place the card
            board.placeCard(slot, card);

            // Check if any lines are completed
            const completedLines = board.getCompletedLines();

            // Remove the card
            board.removeCard(slot);

            if (completedLines.length > 0) {
                completingSlots.push(slot);
            }
        }

        return completingSlots;
    }

    /**
     * Helper: Find slots that would block opponent's line completion
     * Analyzes the board to detect if opponent has 2 matching cards in any line
     */
    function findOpponentBlockingSlots(board, emptySlots) {
        const blockingSlots = new Set();
        const lines = [
            [1, 2, 3],  // Horizontal top
            [8, 9, 4],  // Horizontal middle
            [7, 6, 5],  // Horizontal bottom
            [1, 8, 7],  // Vertical left
            [2, 9, 6],  // Vertical center
            [3, 4, 5],  // Vertical right
            [1, 9, 5],  // Diagonal top-left to bottom-right
            [3, 9, 7]   // Diagonal top-right to bottom-left
        ];

        for (const line of lines) {
            const cards = line.map(slot => board.getCard(slot)).filter(card => card !== null);
            const emptyInLine = line.filter(slot => board.isSlotEmpty(slot));

            // If line has exactly 2 cards and 1 empty slot
            if (cards.length === 2 && emptyInLine.length === 1) {
                const [card1, card2] = cards;

                // If both cards have the same symbol (opponent is close to completing)
                if (card1.symbol === card2.symbol) {
                    const emptySlot = emptyInLine[0];
                    if (emptySlots.includes(emptySlot)) {
                        blockingSlots.add(emptySlot);
                    }
                }
            }
        }

        return Array.from(blockingSlots);
    }

    /**
     * Slot Selection Logic
     * Priority:
     * 1. Complete own line
     * 2. Occupy center slot (9)
     * 3. Block opponent's line
     * 4. Random empty slot
     */
    function selectSlotForCard(board, card, gamePhase) {
        let emptySlots = board.getEmptySlots();

        // First turn: Must place on center slot
        if (gamePhase === 'firstTurn') {
            return 9;
        }

        // If board is full, need to discard first (handled separately)
        if (emptySlots.length === 0) {
            return null;
        }

        // Priority 1: Complete own line
        const completingSlots = findLineCompletingSlots(board, card, emptySlots);
        if (completingSlots.length > 0) {
            console.log('[CPU AI] Found line-completing slots:', completingSlots);
            return randomChoice(completingSlots);
        }

        // Priority 2: Occupy center slot (9)
        if (emptySlots.includes(9)) {
            console.log('[CPU AI] Selecting center slot (9)');
            return 9;
        }

        // Priority 3: Block opponent's line
        const blockingSlots = findOpponentBlockingSlots(board, emptySlots);
        if (blockingSlots.length > 0) {
            console.log('[CPU AI] Found blocking slots:', blockingSlots);
            return randomChoice(blockingSlots);
        }

        // Priority 4: Random empty slot
        console.log('[CPU AI] Selecting random empty slot');
        return randomChoice(emptySlots);
    }

    /**
     * Line Selection Logic
     * When multiple lines are completed, select one randomly
     */
    function selectLineToResolve(completedLines) {
        if (!completedLines || completedLines.length === 0) {
            return null;
        }

        if (completedLines.length === 1) {
            return completedLines[0];
        }

        return randomChoice(completedLines);
    }

    /**
     * Cherry Effect: Select cards from board
     * Select up to maxCards from selectable slots randomly
     */
    function selectCardsForCherry(selectableSlots, maxCards) {
        if (!selectableSlots || selectableSlots.length === 0) {
            return [];
        }

        // For Easy AI, just select 1 random card
        const numToSelect = Math.min(1, maxCards, selectableSlots.length);

        if (numToSelect === 0) {
            return [];
        }

        const selectedSlots = [];
        const availableSlots = [...selectableSlots];

        for (let i = 0; i < numToSelect; i++) {
            if (availableSlots.length === 0) break;

            const slot = randomChoice(availableSlots);
            selectedSlots.push(slot);

            // Remove selected slot from available
            const index = availableSlots.indexOf(slot);
            availableSlots.splice(index, 1);
        }

        return selectedSlots;
    }

    /**
     * Discard Slot Selection Logic
     * When board is full, select a non-center slot to discard
     */
    function selectSlotToDiscard(board) {
        const nonCenterSlots = board.getNonCenterEmptySlots();

        // Get all non-center slots that have cards
        const occupiedNonCenterSlots = [1, 2, 3, 4, 5, 6, 7, 8].filter(slot => !board.isSlotEmpty(slot));

        if (occupiedNonCenterSlots.length === 0) {
            console.error('[CPU AI] No valid slots to discard');
            return null;
        }

        return randomChoice(occupiedNonCenterSlots);
    }

    // Export to global namespace
    globalThis.CardSlot = globalThis.CardSlot || {};
    globalThis.CardSlot.CpuAI = {
        selectCardToPlay,
        selectSlotForCard,
        selectLineToResolve,
        selectCardsForCherry,
        selectSlotToDiscard,
        sleep,
        randomBetween
    };

})();
