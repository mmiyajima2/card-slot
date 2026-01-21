// ライン効果解決
(() => {
    "use strict";

    // CardSlotが利用可能になるまで待機
    if (!globalThis.CardSlot) {
        console.error("CardSlot is not available. Make sure card.js is loaded first.");
        return;
    }

    const { SYMBOLS, CENTER_SLOT } = globalThis.CardSlot;

    class LineEffectResolver {
        constructor(board, deck, discardPile) {
            this.board = board;
            this.deck = deck;
            this.discardPile = discardPile;
        }

        /**
         * ラインを解決する
         * @param {object} completedLine - board.getCompletedLines()から取得したライン情報
         * @param {object} playerHand - プレイヤーの手札 (addCard/removeCard メソッドを持つ)
         * @param {object} options - 効果解決のオプション
         * @param {number[]} options.selectedSlots - Silver 3/Cherry用: 選択したスロット番号の配列
         * @returns {object} 解決結果
         */
        resolveLine(completedLine, playerHand, options = {}) {
            if (!completedLine || !playerHand) {
                throw new Error("completedLine and playerHand are required");
            }

            const { symbol, slots } = completedLine;
            const result = {
                symbol,
                slots,
                success: false,
                instantWin: false,
                deckEmpty: false,
                cardsAddedToHand: [],
                cardsDrawnFromDeck: [],
                replayActionExecuted: false,
                replayCardPlaced: null,
            };

            // Rainbow 7の即勝利判定
            if (symbol === SYMBOLS.RAINBOW_7) {
                result.instantWin = true;
                result.success = true;
                // カードは捨て札には移動しない（ゲーム終了のため）
                return result;
            }

            // ラインのカードを捨て札に移動
            const removedCards = this.board.removeLineCards(slots);
            this.discardPile.addMultiple(removedCards);

            // 各シンボルの効果を解決
            switch (symbol) {
                case SYMBOLS.SILVER_3:
                    this._resolveSilver3Effect(playerHand, options.selectedSlots || [], result);
                    break;

                case SYMBOLS.CHERRY:
                    this._resolveCherryEffect(playerHand, options.selectedSlots || [], result);
                    break;

                case SYMBOLS.WATERMELON:
                    this._resolveWatermelonEffect(playerHand, result);
                    break;

                case SYMBOLS.BELL:
                    this._resolveBellEffect(playerHand, result);
                    break;

                case SYMBOLS.REPLAY:
                    this._resolveReplayEffect(result);
                    break;

                default:
                    throw new Error(`Unknown symbol: ${symbol}`);
            }

            result.success = true;
            return result;
        }

        /**
         * Silver 3効果: デッキのすべてのカードを捨て札に移動
         */
        _resolveSilver3Effect(playerHand, selectedSlots, result) {
            // デッキのすべてのカードを捨て札に移動
            while (!this.deck.isEmpty()) {
                const card = this.deck.draw();
                if (card) {
                    this.discardPile.add(card);
                }
            }
            result.deckEmpty = true;
        }

        /**
         * Cherry効果: ボードから最大1枚取得
         */
        _resolveCherryEffect(playerHand, selectedSlots, result) {
            const validSlots = this._getValidSlotsForPickup(selectedSlots, 1);
            validSlots.forEach((slot) => {
                const card = this.board.removeCard(slot);
                if (card) {
                    playerHand.addCard(card);
                    result.cardsAddedToHand.push({ slot, card });
                }
            });
        }

        /**
         * Watermelon効果: デッキから2枚ドロー
         */
        _resolveWatermelonEffect(playerHand, result) {
            for (let i = 0; i < 2; i++) {
                if (!this.deck.isEmpty()) {
                    const card = this.deck.draw();
                    if (card) {
                        playerHand.addCard(card);
                        result.cardsDrawnFromDeck.push(card);
                    }
                }
            }
        }

        /**
         * Bell効果: デッキから1枚ドロー
         */
        _resolveBellEffect(playerHand, result) {
            if (!this.deck.isEmpty()) {
                const card = this.deck.draw();
                if (card) {
                    playerHand.addCard(card);
                    result.cardsDrawnFromDeck.push(card);
                }
            }
        }

        /**
         * REPLAY効果: リプレイアクション
         * 1. デッキから1枚ドロー
         * 2. 最も小さい番号の空スロットに配置
         * 3. ライン効果は評価しない
         */
        _resolveReplayEffect(result) {
            result.replayActionExecuted = true;

            // デッキが空の場合は何もしない
            if (this.deck.isEmpty()) {
                return;
            }

            // デッキから1枚ドロー
            const card = this.deck.draw();
            if (!card) {
                return;
            }

            // 最も小さい番号の空スロットを取得
            const lowestEmptySlot = this.board.getLowestEmptySlot();
            if (lowestEmptySlot === null) {
                // 空スロットがない場合、カードを捨て札に移動
                this.discardPile.add(card);
                return;
            }

            // カードを配置
            this.board.placeCard(lowestEmptySlot, card);
            result.replayCardPlaced = { slot: lowestEmptySlot, card };
        }

        /**
         * ボードからカードを取得できる有効なスロットを検証
         * @param {number[]} selectedSlots - 選択されたスロット番号
         * @param {number} maxCount - 最大取得枚数
         * @returns {number[]} 有効なスロット番号
         */
        _getValidSlotsForPickup(selectedSlots, maxCount) {
            if (!Array.isArray(selectedSlots)) {
                return [];
            }

            const validSlots = [];
            for (const slot of selectedSlots) {
                // センタースロットは選択不可
                if (slot === CENTER_SLOT) {
                    continue;
                }

                // スロットにカードがあるか確認
                if (!this.board.isSlotEmpty(slot)) {
                    validSlots.push(slot);
                }

                // 最大枚数に達したら終了
                if (validSlots.length >= maxCount) {
                    break;
                }
            }

            return validSlots;
        }

    }

    const CardSlot = {
        LineEffectResolver,
    };

    globalThis.CardSlot = Object.assign(globalThis.CardSlot || {}, CardSlot);
})();
