// 手札
(() => {
    "use strict";

    // CardSlotが利用可能になるまで待機
    if (!globalThis.CardSlot || !globalThis.CardSlot.SYMBOLS) {
        console.error("CardSlot is not available. Make sure card.js is loaded first.");
        return;
    }

    const { SYMBOLS } = globalThis.CardSlot;

    class Hand {
        constructor(playerName = "Player") {
            this.playerName = playerName;
            this.cards = [];
        }

        // カードを追加
        addCard(card) {
            if (!card) {
                return;
            }
            this.cards.push(card);
            this.sortBySymbol(); // カード追加後に自動ソート
        }

        // 複数のカードを追加
        addCards(cards) {
            if (!Array.isArray(cards)) {
                return;
            }
            cards.forEach((card) => {
                if (card) {
                    this.cards.push(card);
                }
            });
            this.sortBySymbol(); // カード追加後に自動ソート
        }

        // カードが手札に存在するかチェック
        hasCard(card) {
            if (!card) {
                return false;
            }
            return this.cards.some((c) => c.id === card.id);
        }

        // カードを削除（プレイ時）
        removeCard(card) {
            const index = this.cards.findIndex((c) => c.id === card.id);
            if (index === -1) {
                return null;
            }
            return this.cards.splice(index, 1)[0];
        }

        // インデックスでカードを削除
        removeCardByIndex(index) {
            if (index < 0 || index >= this.cards.length) {
                return null;
            }
            return this.cards.splice(index, 1)[0];
        }

        // 手札の枚数を取得
        get size() {
            return this.cards.length;
        }

        // 手札が空かどうか
        isEmpty() {
            return this.cards.length === 0;
        }

        // カードを取得（読み取り専用）
        getCard(index) {
            if (index < 0 || index >= this.cards.length) {
                return null;
            }
            return this.cards[index];
        }

        // すべてのカードを取得（読み取り専用のコピー）
        getAllCards() {
            return this.cards.slice();
        }

        // 特定のシンボルのカードを検索
        findCardsBySymbol(symbol) {
            return this.cards.filter((card) => card.symbol === symbol);
        }

        // 特定のシンボルのカード枚数を取得
        countBySymbol(symbol) {
            return this.cards.filter((card) => card.symbol === symbol).length;
        }

        // シンボル別の枚数を集計
        countAllSymbols() {
            const counts = {};
            this.cards.forEach((card) => {
                const symbol = card.symbol;
                counts[symbol] = (counts[symbol] || 0) + 1;
            });
            return counts;
        }

        // 手札のスコアを計算
        calculateScore() {
            return this.cards.reduce((total, card) => total + card.score, 0);
        }

        // 手札をソート（シンボル順）
        sortBySymbol() {
            const symbolOrder = [
                SYMBOLS.RAINBOW_7,
                SYMBOLS.SILVER_3,
                SYMBOLS.CHERRY,
                SYMBOLS.WATERMELON,
                SYMBOLS.BELL,
                SYMBOLS.REPLAY,
            ];

            this.cards.sort((a, b) => {
                const aIndex = symbolOrder.indexOf(a.symbol);
                const bIndex = symbolOrder.indexOf(b.symbol);
                return aIndex - bIndex;
            });
        }

        // 手札をソート（スコア順：高→低）
        sortByScore() {
            this.cards.sort((a, b) => b.score - a.score);
        }

        // 手札をクリア（デバッグ/リセット用）
        clear() {
            this.cards = [];
        }

        // 手札のクローン
        clone() {
            const newHand = new Hand(this.playerName);
            newHand.cards = this.cards.slice();
            return newHand;
        }

        // デバッグ用：手札の状態を文字列化
        toString() {
            if (this.cards.length === 0) {
                return `${this.playerName}'s Hand: (empty)`;
            }

            const counts = this.countAllSymbols();
            const countStrings = Object.entries(counts).map(
                ([symbol, count]) => {
                    const displayName = globalThis.CardSlot.CARD_DEFINITIONS[symbol]?.display || symbol;
                    return `${displayName}: ${count}`;
                }
            );

            const score = this.calculateScore();

            return [
                `${this.playerName}'s Hand (${this.cards.length} cards, Score: ${score}):`,
                `  ${countStrings.join(", ")}`,
            ].join("\n");
        }
    }

    const CardSlot = {
        Hand,
    };

    globalThis.CardSlot = Object.assign(globalThis.CardSlot || {}, CardSlot);
})();
