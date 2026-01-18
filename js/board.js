// ボード
(() => {
    "use strict";

    // CardSlotが利用可能になるまで待機
    if (!globalThis.CardSlot) {
        console.error("CardSlot is not available. Make sure card.js is loaded first.");
        return;
    }

    const { SYMBOLS } = globalThis.CardSlot;

    // スロットレイアウト
    // +---+---+---+
    // | 1 | 2 | 3 |
    // +---+---+---+
    // | 8 | 9 | 4 |
    // +---+---+---+
    // | 7 | 6 | 5 |
    // +---+---+---+
    const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const CENTER_SLOT = 9;
    const FORCED_REFRESH_SLOTS = [3, 7];

    // ライン定義（8本）
    const LINES = [
        // 横
        [1, 2, 3],
        [8, 9, 4],
        [7, 6, 5],
        // 縦
        [1, 8, 7],
        [2, 9, 6],
        [3, 4, 5],
        // 斜め
        [1, 9, 5],
        [3, 9, 7],
    ];

    class Board {
        constructor() {
            // スロット番号をキー、カードを値とするマップ
            this.slots = new Map();
            SLOTS.forEach((slot) => {
                this.slots.set(slot, null);
            });
        }

        // カードを配置
        placeCard(slotNumber, card) {
            if (!SLOTS.includes(slotNumber)) {
                throw new Error(`Invalid slot number: ${slotNumber}`);
            }
            if (!card) {
                throw new Error("Card is required");
            }
            this.slots.set(slotNumber, card);
        }

        // カードを取得
        getCard(slotNumber) {
            if (!SLOTS.includes(slotNumber)) {
                return null;
            }
            return this.slots.get(slotNumber);
        }

        // カードを削除（捨て札などに移動する際）
        removeCard(slotNumber) {
            if (!SLOTS.includes(slotNumber)) {
                return null;
            }
            const card = this.slots.get(slotNumber);
            this.slots.set(slotNumber, null);
            return card;
        }

        // スロットが空かどうか
        isSlotEmpty(slotNumber) {
            return this.getCard(slotNumber) === null;
        }

        // 空のスロット番号を取得
        getEmptySlots() {
            return SLOTS.filter((slot) => this.isSlotEmpty(slot));
        }

        // ボードが満杯かどうか
        isFull() {
            return this.getEmptySlots().length === 0;
        }

        // センタースロット以外の空のスロットを取得
        getNonCenterEmptySlots() {
            return this.getEmptySlots().filter((slot) => slot !== CENTER_SLOT);
        }

        // 最も小さい番号の空スロットを取得（REPLAY用）
        getLowestEmptySlot() {
            const emptySlots = this.getEmptySlots();
            if (emptySlots.length === 0) {
                return null;
            }
            return Math.min(...emptySlots);
        }

        // センタースロットにカードがあるかどうか
        hasCenterCard() {
            return !this.isSlotEmpty(CENTER_SLOT);
        }

        // センタースロットのカードを取得
        getCenterCard() {
            return this.getCard(CENTER_SLOT);
        }

        // 完成しているラインを取得
        getCompletedLines() {
            const completedLines = [];

            LINES.forEach((line, index) => {
                const cards = line.map((slot) => this.getCard(slot));

                // すべてのスロットにカードがある
                if (cards.every((card) => card !== null)) {
                    // すべて同じシンボル
                    const firstSymbol = cards[0].symbol;
                    if (cards.every((card) => card.symbol === firstSymbol)) {
                        completedLines.push({
                            lineIndex: index,
                            slots: line,
                            cards: cards,
                            symbol: firstSymbol,
                        });
                    }
                }
            });

            return completedLines;
        }

        // Gold 7が3枚揃っているラインがあるかどうか
        hasGold7Line() {
            const completedLines = this.getCompletedLines();
            return completedLines.some(
                (line) => line.symbol === SYMBOLS.GOLD_7
            );
        }

        // ラインのカードを削除（捨て札に移動するため）
        removeLineCards(slots) {
            const removedCards = [];
            slots.forEach((slot) => {
                const card = this.removeCard(slot);
                if (card) {
                    removedCards.push(card);
                }
            });
            return removedCards;
        }

        // センタースロット以外のカードを取得
        getNonCenterCards() {
            const cards = [];
            SLOTS.forEach((slot) => {
                if (slot !== CENTER_SLOT) {
                    const card = this.getCard(slot);
                    if (card) {
                        cards.push({ slot, card });
                    }
                }
            });
            return cards;
        }

        // センタースロットに配置可能かどうかをチェック
        canPlaceOnCenterSlot(card) {
            if (!card) {
                return false;
            }
            // Gold 7とSilver 3はセンタースロットに配置できない
            return (
                card.symbol !== SYMBOLS.GOLD_7 &&
                card.symbol !== SYMBOLS.SILVER_3
            );
        }

        // 強制リフレッシュを実行（スロット3と7のカードを削除して新しいカードを配置）
        // @param {number} slotNumber - リフレッシュするスロット番号（3または7）
        // @param {object} newCard - 配置する新しいカード
        // @returns {object} 削除されたカード
        forcedRefresh(slotNumber, newCard) {
            if (!FORCED_REFRESH_SLOTS.includes(slotNumber)) {
                throw new Error(`Invalid forced refresh slot: ${slotNumber}`);
            }
            const removedCard = this.removeCard(slotNumber);
            if (newCard) {
                this.placeCard(slotNumber, newCard);
            }
            return removedCard;
        }

        // ボードの状態をクローン
        clone() {
            const newBoard = new Board();
            SLOTS.forEach((slot) => {
                const card = this.getCard(slot);
                if (card) {
                    newBoard.placeCard(slot, card);
                }
            });
            return newBoard;
        }

        // デバッグ用：ボードの状態を文字列化
        toString() {
            const getSymbolShort = (slot) => {
                const card = this.getCard(slot);
                if (!card) return "   ";
                switch (card.symbol) {
                    case SYMBOLS.GOLD_7:
                        return "G7 ";
                    case SYMBOLS.SILVER_3:
                        return "S3 ";
                    case SYMBOLS.CHERRY:
                        return "Ch ";
                    case SYMBOLS.WATERMELON:
                        return "Wm ";
                    case SYMBOLS.BELL:
                        return "Bl ";
                    case SYMBOLS.REPLAY:
                        return "Re ";
                    default:
                        return "?? ";
                }
            };

            return [
                "+---+---+---+",
                `|${getSymbolShort(1)}|${getSymbolShort(2)}|${getSymbolShort(3)}|`,
                "+---+---+---+",
                `|${getSymbolShort(8)}|${getSymbolShort(9)}|${getSymbolShort(4)}|`,
                "+---+---+---+",
                `|${getSymbolShort(7)}|${getSymbolShort(6)}|${getSymbolShort(5)}|`,
                "+---+---+---+",
            ].join("\n");
        }
    }

    const CardSlot = {
        Board,
        SLOTS,
        CENTER_SLOT,
        FORCED_REFRESH_SLOTS,
        LINES,
    };

    globalThis.CardSlot = Object.assign(globalThis.CardSlot || {}, CardSlot);
})();
