// 山札
(() => {
    "use strict";

    // CardSlotが利用可能になるまで待機
    if (!globalThis.CardSlot || !globalThis.CardSlot.Card) {
        console.error("CardSlot.Card is not available. Make sure card.js is loaded first.");
        return;
    }

    const { Card, ORDERED_SYMBOLS, getCardDefinition } = globalThis.CardSlot;

    function buildFullDeck() {
        const cards = [];
        ORDERED_SYMBOLS.forEach((symbol) => {
            const definition = getCardDefinition(symbol);
            if (!definition) {
                return;
            }
            for (let i = 0; i < definition.count; i += 1) {
                cards.push(new Card(symbol));
            }
        });
        return cards;
    }

    function shuffleInPlace(cards) {
        for (let i = cards.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return cards;
    }

    class Deck {
        constructor(cards) {
            this.cards = Array.isArray(cards) ? cards.slice() : [];
        }

        static createShuffledFullDeck() {
            const cards = buildFullDeck();
            shuffleInPlace(cards);
            return new Deck(cards);
        }

        get size() {
            return this.cards.length;
        }

        isEmpty() {
            return this.cards.length === 0;
        }

        draw() {
            if (this.cards.length === 0) {
                return null;
            }
            return this.cards.shift();
        }

        shuffle() {
            shuffleInPlace(this.cards);
        }

        // すべてのカードを取得（読み取り専用のコピー）
        getAllCards() {
            return this.cards.slice();
        }

        // デバッグ用：山札の状態を文字列化
        toString() {
            return `Deck (${this.cards.length} cards remaining)`;
        }
    }

    const CardSlot = {
        Deck,
        buildFullDeck,
    };

    globalThis.CardSlot = Object.assign(globalThis.CardSlot || {}, CardSlot);
})();
