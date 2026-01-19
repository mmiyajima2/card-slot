// カードの定義と基本クラス
(() => {
    "use strict";

    // カードシンボルの定義
    const SYMBOLS = {
        GOLD_7: "GOLD_7",
        SILVER_3: "SILVER_3",
        CHERRY: "CHERRY",
        WATERMELON: "WATERMELON",
        BELL: "BELL",
        REPLAY: "REPLAY",
    };

    // シンボルの順序（デッキ構築用）
    const ORDERED_SYMBOLS = [
        SYMBOLS.GOLD_7,
        SYMBOLS.SILVER_3,
        SYMBOLS.CHERRY,
        SYMBOLS.WATERMELON,
        SYMBOLS.BELL,
        SYMBOLS.REPLAY,
    ];

    // 各カードの定義（枚数、スコア、SVG画像パス）
    const CARD_DEFINITIONS = {
        [SYMBOLS.GOLD_7]: {
            symbol: SYMBOLS.GOLD_7,
            count: 8,
            score: -1,
            display: "Gold 7",
            image: "assets/gold_7.svg",
        },
        [SYMBOLS.SILVER_3]: {
            symbol: SYMBOLS.SILVER_3,
            count: 5,
            score: -1,
            display: "Silver 3",
            image: "assets/silver_3.svg",
        },
        [SYMBOLS.CHERRY]: {
            symbol: SYMBOLS.CHERRY,
            count: 8,
            score: 2,
            display: "Cherry",
            image: "assets/cherry.svg",
        },
        [SYMBOLS.WATERMELON]: {
            symbol: SYMBOLS.WATERMELON,
            count: 8,
            score: 2,
            display: "Watermelon",
            image: "assets/watermelon.svg",
        },
        [SYMBOLS.BELL]: {
            symbol: SYMBOLS.BELL,
            count: 21,
            score: 1,
            display: "Bell",
            image: "assets/bell.svg",
        },
        [SYMBOLS.REPLAY]: {
            symbol: SYMBOLS.REPLAY,
            count: 13,
            score: 0,
            display: "REPLAY",
            image: "assets/replay.svg",
        },
    };

    // カード定義の取得
    function getCardDefinition(symbol) {
        return CARD_DEFINITIONS[symbol] || null;
    }

    // カードクラス
    let cardIdCounter = 0;

    class Card {
        constructor(symbol) {
            if (!CARD_DEFINITIONS[symbol]) {
                throw new Error(`Invalid card symbol: ${symbol}`);
            }
            this.symbol = symbol;
            this.id = cardIdCounter++;
            this.definition = CARD_DEFINITIONS[symbol];
        }

        get display() {
            return this.definition.display;
        }

        get score() {
            return this.definition.score;
        }

        get image() {
            return this.definition.image;
        }

        toString() {
            return `${this.display} (#${this.id})`;
        }
    }

    // グローバルに公開
    const CardSlot = {
        Card,
        SYMBOLS,
        ORDERED_SYMBOLS,
        CARD_DEFINITIONS,
        getCardDefinition,
    };

    globalThis.CardSlot = Object.assign(globalThis.CardSlot || {}, CardSlot);
})();
