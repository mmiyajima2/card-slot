// 捨て札の場所
(() => {
    "use strict";

    // CardSlotが利用可能になるまで待機
    if (!globalThis.CardSlot) {
        console.error("CardSlot is not available. Make sure card.js is loaded first.");
        return;
    }

    class DiscardPile {
        constructor() {
            this.cards = [];
        }

        // カードを捨て札に追加
        add(card) {
            if (!card) {
                return;
            }
            this.cards.push(card);
        }

        // カードを捨て札に追加（エイリアス）
        addCard(card) {
            this.add(card);
        }

        // 複数のカードを捨て札に追加
        addMultiple(cards) {
            if (!Array.isArray(cards)) {
                return;
            }
            cards.forEach((card) => {
                if (card) {
                    this.cards.push(card);
                }
            });
        }

        // 捨て札の枚数を取得
        get size() {
            return this.cards.length;
        }

        // 捨て札が空かどうか
        isEmpty() {
            return this.cards.length === 0;
        }

        // 最後に捨てられたカードを確認（取り出しはしない）
        getTopCard() {
            if (this.cards.length === 0) {
                return null;
            }
            return this.cards[this.cards.length - 1];
        }

        // すべてのカードを取得（読み取り専用のコピー）
        getAllCards() {
            return this.cards.slice();
        }

        // 捨て札をクリア（デバッグ/リセット用）
        clear() {
            this.cards = [];
        }

        // シンボル別の枚数を集計
        countBySymbol() {
            const counts = {};
            this.cards.forEach((card) => {
                const symbol = card.symbol;
                counts[symbol] = (counts[symbol] || 0) + 1;
            });
            return counts;
        }

        // デバッグ用：捨て札の状態を文字列化
        toString() {
            if (this.cards.length === 0) {
                return "Discard Pile: (empty)";
            }

            const counts = this.countBySymbol();
            const countStrings = Object.entries(counts).map(
                ([symbol, count]) => {
                    const displayName = globalThis.CardSlot.CARD_DEFINITIONS[symbol]?.display || symbol;
                    return `${displayName}: ${count}`;
                }
            );

            return `Discard Pile (${this.cards.length} cards):\n  ${countStrings.join("\n  ")}`;
        }
    }

    const CardSlot = {
        DiscardPile,
    };

    globalThis.CardSlot = Object.assign(globalThis.CardSlot || {}, CardSlot);
})();
