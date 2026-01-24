// ゲーム進行管理
(() => {
    "use strict";

    // CardSlotが利用可能になるまで待機
    if (!globalThis.CardSlot) {
        console.error("CardSlot is not available. Make sure card.js is loaded first.");
        return;
    }

    const {
        SYMBOLS,
        CENTER_SLOT,
        FORCED_REFRESH_SLOTS,
        Deck,
        DiscardPile,
        Board,
        Hand,
        Player,
        LineEffectResolver,
        CpuAI
    } = globalThis.CardSlot;

    class GameManager {
        constructor() {
            // ゲーム状態
            this.deck = null;
            this.discardPile = null;
            this.board = null;
            this.players = [];
            this.currentPlayerIndex = 0;
            this.gamePhase = "setup"; // "setup", "firstTurn", "normal", "ended"
            this.lineEffectResolver = null;
            this.winner = null;
            this.winReason = null;

            // ゲーム設定
            this.gameConfig = {
                mode: 'solo',      // 'solo' or 'cpu'
                firstPlayer: 1,    // 1 or 2
                cpuLevel: 'easy'   // 'easy', 'medium', 'hard'
            };

            // イベントハンドラ管理
            this.eventHandlers = new Map();
        }

        // ==================== イベントシステム ====================

        /**
         * イベントリスナーを登録
         * @param {string} eventName - イベント名
         * @param {Function} handler - ハンドラ関数
         */
        on(eventName, handler) {
            if (!this.eventHandlers.has(eventName)) {
                this.eventHandlers.set(eventName, []);
            }
            this.eventHandlers.get(eventName).push(handler);
        }

        /**
         * イベントを発火
         * @param {string} eventName - イベント名
         * @param {object} data - イベントデータ
         */
        emit(eventName, data) {
            const handlers = this.eventHandlers.get(eventName) || [];
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${eventName}:`, error);
                }
            });
        }

        // ==================== ゲーム初期化 ====================

        /**
         * ゲームを開始
         * @param {string} player1Name - プレイヤー1の名前
         * @param {string} player2Name - プレイヤー2の名前
         * @param {object} config - ゲーム設定 { mode: 'solo'/'cpu', firstPlayer: 1/2, cpuLevel: 'easy'/'medium'/'hard' }
         */
        startGame(player1Name = "Player 1", player2Name = "Player 2", config = {}) {
            // ゲーム設定を更新
            this.gameConfig = {
                mode: config.mode || 'solo',
                firstPlayer: config.firstPlayer || 1,
                cpuLevel: config.cpuLevel || 'easy'
            };

            // 初期化
            this.deck = Deck.createShuffledFullDeck();
            this.discardPile = new DiscardPile();
            this.board = new Board();
            this.lineEffectResolver = new LineEffectResolver(this.board, this.deck, this.discardPile);

            // プレイヤー作成
            const player1 = new Player(player1Name);
            player1.hand = new Hand(player1Name);
            const player2 = new Player(player2Name);
            player2.hand = new Hand(player2Name);

            this.players = [player1, player2];
            // 先攻プレイヤーを設定（firstPlayerは1または2）
            this.currentPlayerIndex = this.gameConfig.firstPlayer - 1;
            this.gamePhase = "setup";
            this.winner = null;
            this.winReason = null;

            // 各プレイヤーに13枚配る
            for (let i = 0; i < 13; i++) {
                player1.hand.addCard(this.deck.draw());
                player2.hand.addCard(this.deck.draw());
            }

            // Heavenly Hand判定
            const heavenlyHandPlayer = this._checkHeavenlyHand();
            if (heavenlyHandPlayer) {
                this.endGame(heavenlyHandPlayer, "heavenly_hand");
                return;
            }

            // ゲーム開始イベント
            this.emit("gameStarted", {
                players: this.players.map(p => ({
                    name: p.name,
                    handSize: p.getHandSize()
                })),
                deckSize: this.deck.size,
                currentPlayer: this.getCurrentPlayer().name
            });

            // 第1ターン開始（センタースロット配置フェーズ）
            this.gamePhase = "firstTurn";
            this.emit("firstTurnStarted", {
                currentPlayer: this.getCurrentPlayer().name
            });

            // CPUが先攻の場合、自動実行
            if (this.isCPUTurn()) {
                this._executeCPUTurn();
            }
        }

        /**
         * Heavenly Hand判定
         * @returns {Player|null} Heavenly Handを持つプレイヤー、いなければnull
         */
        _checkHeavenlyHand() {
            for (const player of this.players) {
                const gold7Count = player.hand.countBySymbol(SYMBOLS.RAINBOW_7);
                const silver3Count = player.hand.countBySymbol(SYMBOLS.SILVER_3);

                if (gold7Count === 5 && silver3Count === 5) {
                    return player;
                }
            }
            return null;
        }

        // ==================== ターン管理 ====================

        /**
         * 現在のプレイヤーを取得
         * @returns {Player}
         */
        getCurrentPlayer() {
            return this.players[this.currentPlayerIndex];
        }

        /**
         * 現在のターンがCPUかチェック
         * @returns {boolean}
         */
        isCPUTurn() {
            const result = this.gameConfig.mode === 'cpu' && this.currentPlayerIndex === 0;
            console.log(`[isCPUTurn] mode=${this.gameConfig.mode}, currentPlayerIndex=${this.currentPlayerIndex}, result=${result}`);
            return result;
        }

        /**
         * ターン開始前の処理（Forced Refresh Event含む）
         * @returns {object} 処理結果
         */
        beforePlayerTurn() {
            // ボードが満杯ならForced Refresh Event
            if (this.board.isFull()) {
                return this._executeForcedRefreshEvent();
            }
            return { occurred: false };
        }

        /**
         * Forced Refresh Eventを実行
         * スロット3と7を順次リフレッシュする
         * @returns {object} 実行結果
         */
        _executeForcedRefreshEvent() {
            const refreshResults = [];

            // スロット3と7を順次リフレッシュ
            for (const slotNumber of FORCED_REFRESH_SLOTS) {
                // デッキが空になったら即座にゲーム終了
                if (this.deck.isEmpty()) {
                    this._endGameByDeckEmpty();
                    return { occurred: true, gameEnded: true, refreshResults };
                }

                // デッキから1枚ドロー
                const newCard = this.deck.draw();

                // スロットをリフレッシュ
                const removedCard = this.board.forcedRefresh(slotNumber, newCard);

                // 削除されたカードを捨て札に
                if (removedCard) {
                    this.discardPile.add(removedCard);
                }

                refreshResults.push({
                    slot: slotNumber,
                    removedCard,
                    placedCard: newCard
                });
            }

            // イベント発火
            this.emit("forcedRefreshOccurred", {
                refreshResults: refreshResults.map(r => ({
                    slot: r.slot,
                    removedCard: r.removedCard ? { symbol: r.removedCard.symbol } : null,
                    placedCard: r.placedCard ? { symbol: r.placedCard.symbol } : null
                })),
                deckSize: this.deck.size
            });

            return {
                occurred: true,
                refreshResults,
                gameEnded: false
            };
        }

        /**
         * ターンを終了
         */
        endTurn() {
            const currentPlayer = this.getCurrentPlayer();

            // ターン終了イベント
            this.emit("turnEnded", {
                player: currentPlayer.name,
                handSize: currentPlayer.getHandSize()
            });

            // 次のプレイヤーへ
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

            // 通常フェーズに移行（第1ターン後）
            if (this.gamePhase === "firstTurn") {
                this.gamePhase = "normal";
            }

            // 次のターン開始
            const nextPlayer = this.getCurrentPlayer();
            this.emit("turnStarted", {
                player: nextPlayer.name,
                handSize: nextPlayer.getHandSize(),
                deckSize: this.deck.size
            });

            // Forced Refresh Eventチェック
            const refreshResult = this.beforePlayerTurn();
            if (refreshResult.gameEnded) {
                return;
            }

            // CPUターンなら自動実行
            if (this.isCPUTurn()) {
                // 強制リフレッシュが発生した場合、エフェクトを見せるために少し待機
                if (refreshResult.occurred) {
                    setTimeout(() => {
                        this._executeCPUTurn();
                    }, 1800); // エフェクト1.5秒 + 余裕0.3秒
                } else {
                    this._executeCPUTurn();
                }
            }
        }

        // ==================== カード配置 ====================

        /**
         * カードが配置可能かチェック
         * @param {number} slot - スロット番号
         * @param {object} card - カード
         * @returns {object} { valid: boolean, reason: string }
         */
        canPlaceCard(slot, card) {
            if (this.gamePhase === "ended") {
                return { valid: false, reason: "Game has ended" };
            }

            if (!card) {
                return { valid: false, reason: "Card is required" };
            }

            // 第1ターン：センタースロット必須、Rainbow 7/Silver 3禁止
            if (this.gamePhase === "firstTurn") {
                if (slot !== CENTER_SLOT) {
                    return { valid: false, reason: "First turn: must place on center slot" };
                }
                if (card.symbol === SYMBOLS.RAINBOW_7 || card.symbol === SYMBOLS.SILVER_3) {
                    return { valid: false, reason: "Rainbow 7 and Silver 3 cannot be placed on center slot during first turn" };
                }
            }

            // 通常ターン：スロットが空でなければならない
            if (this.gamePhase === "normal") {
                if (!this.board.isSlotEmpty(slot)) {
                    return { valid: false, reason: "Slot is not empty" };
                }
            }

            return { valid: true, reason: "" };
        }

        /**
         * カードを配置
         * @param {object} card - 配置するカード
         * @param {number} slot - スロット番号
         * @returns {object} 配置結果
         */
        placeCard(card, slot) {
            const currentPlayer = this.getCurrentPlayer();

            // 配置可能性チェック
            const canPlace = this.canPlaceCard(slot, card);
            if (!canPlace.valid) {
                throw new Error(canPlace.reason);
            }

            // 手札からカードを削除
            const removedCard = currentPlayer.hand.removeCard(card);
            if (!removedCard) {
                throw new Error("Card not found in player's hand");
            }

            // ボードに配置
            this.board.placeCard(slot, card);

            // カード配置イベント
            this.emit("cardPlaced", {
                player: currentPlayer.name,
                card: { symbol: card.symbol },
                slot,
                handSize: currentPlayer.getHandSize()
            });

            // ライン完成チェック
            const completedLines = this.board.getCompletedLines();

            if (completedLines.length > 0) {
                // ライン完成イベント
                this.emit("linesCompleted", {
                    player: currentPlayer.name,
                    lines: completedLines.map(line => ({
                        symbol: line.symbol,
                        slots: line.slots
                    })),
                    count: completedLines.length
                });
            }

            return {
                success: true,
                completedLines
            };
        }

        /**
         * ボード満杯時：スロットのカードを捨て札に移動（ボード満杯時の捨てカード処理）
         * Board is full flow:
         * 1) User clicks on a board slot (Slot 1-8 only, Slot 9 cannot be selected)
         * 2) Confirmation dialog appears: "Discard [Card] from Slot X?"
         * 3) If user confirms discard:
         *    - Discard the card from that slot
         *    - User then selects a card from hand to place on the now-empty slot
         *
         * @param {number} slot - スロット番号（1-8のみ）
         * @returns {object} { success: boolean, discardedCard: object }
         */
        discardCardFromSlot(slot) {
            // バリデーション
            if (this.gamePhase === "ended") {
                throw new Error("Game has ended");
            }

            if (slot === CENTER_SLOT) {
                throw new Error("Cannot discard center slot (Slot 9)");
            }

            const card = this.board.getCard(slot);
            if (!card) {
                throw new Error(`Slot ${slot} is empty, cannot discard`);
            }

            // 捨て札に移動
            this.discardPile.addCard(card);

            // ボードから削除
            this.board.removeCard(slot);

            // イベント発火
            this.emit("cardDiscarded", {
                player: this.getCurrentPlayer().name,
                slot,
                discardedCard: { symbol: card.symbol, display: card.display }
            });

            return {
                success: true,
                discardedCard: card
            };
        }

        // ==================== ライン解決 ====================

        /**
         * ライン解決後の手札0枚チェック
         * ライン効果が適用された後に呼び出すこと
         * @returns {object} { playerEliminated: boolean, winner: Player|null }
         */
        checkHandEmptyAfterLineResolution() {
            const currentPlayer = this.getCurrentPlayer();

            // 手札が0枚になったらチェック
            if (currentPlayer.hasEmptyHand()) {
                // Rainbow 7ラインが揃っているかチェック（即勝利が優先）
                const hasRainbow7Line = this.board.hasRainbow7Line();
                if (!hasRainbow7Line) {
                    // 手札0枚で敗北
                    currentPlayer.eliminate();

                    // 相手プレイヤーの勝利
                    const opponent = this.players.find(p => p !== currentPlayer);

                    // 手札枯渇による勝敗イベントを発行（実況エリア用）
                    this.emit("handDepletionVictory", {
                        eliminatedPlayer: currentPlayer.name,
                        winner: opponent.name
                    });

                    this.emit("playerEliminated", {
                        player: currentPlayer.name,
                        reason: "hand_empty"
                    });

                    this.endGame(opponent, "opponent_eliminated");
                    return {
                        playerEliminated: true,
                        winner: opponent
                    };
                }
            }

            return {
                playerEliminated: false,
                winner: null
            };
        }

        /**
         * ラインを解決
         * @param {object} selectedLine - 選択されたライン
         * @param {object} options - オプション（Silver 3/Cherry用のスロット選択など）
         * @returns {object} 解決結果
         */
        resolveLine(selectedLine, options = {}) {
            const currentPlayer = this.getCurrentPlayer();

            // ライン解決
            const result = this.lineEffectResolver.resolveLine(
                selectedLine,
                currentPlayer.hand,
                options
            );

            // Rainbow 7の即勝利
            if (result.instantWin) {
                this.emit("lineResolved", {
                    player: currentPlayer.name,
                    symbol: result.symbol,
                    instantWin: true
                });
                this.endGame(currentPlayer, "rainbow_7_line");
                return result;
            }

            // 銀3によるデッキ枯渇チェック
            if (result.deckEmpty) {
                this.emit("lineResolved", {
                    player: currentPlayer.name,
                    symbol: result.symbol,
                    deckEmpty: true
                });
                this._endGameByDeckEmpty();
                return result;
            }

            // ライン解決イベント
            this.emit("lineResolved", {
                player: currentPlayer.name,
                symbol: result.symbol,
                cardsAddedToHand: result.cardsAddedToHand.length,
                cardsDrawnFromDeck: result.cardsDrawnFromDeck.length,
                replayActionExecuted: result.replayActionExecuted,
                cardsDiscarded: result.cardsDiscarded || 0,
                handSize: currentPlayer.getHandSize(),
                deckSize: this.deck.size
            });

            // Replay Actionでライン完成しても評価しない（仕様通り）

            return result;
        }

        // ==================== CPU ターン実行 ====================

        /**
         * CPUターンを実行（非同期）
         */
        async _executeCPUTurn() {
            if (this.gamePhase === "ended") {
                return;
            }

            const currentPlayer = this.getCurrentPlayer();

            try {
                // 初期待機
                await CpuAI.sleep(CpuAI.randomBetween(1000, 2000));

                // 1. カード選択
                const selectedCard = CpuAI.selectCardToPlay(currentPlayer.hand, this.gamePhase);
                if (!selectedCard) {
                    console.error('[CPU] Failed to select card');
                    return;
                }

                this.emit("cpuCardSelected", {
                    player: currentPlayer.name,
                    card: { symbol: selectedCard.symbol }
                });

                await CpuAI.sleep(CpuAI.randomBetween(1000, 2000));

                // 2. スロット選択
                let selectedSlot = CpuAI.selectSlotForCard(this.board, selectedCard, this.gamePhase);

                // ボード満杯の場合、捨て札処理
                if (selectedSlot === null && this.board.isFull()) {
                    const discardSlot = CpuAI.selectSlotToDiscard(this.board);
                    if (discardSlot) {
                        this.emit("cpuDiscardSelected", {
                            player: currentPlayer.name,
                            slot: discardSlot
                        });

                        await CpuAI.sleep(CpuAI.randomBetween(600, 1000));
                        this.discardCardFromSlot(discardSlot);

                        // 捨て札後、再度スロット選択
                        selectedSlot = CpuAI.selectSlotForCard(this.board, selectedCard, this.gamePhase);
                    }
                }

                if (!selectedSlot) {
                    console.error('[CPU] Failed to select slot');
                    return;
                }

                this.emit("cpuSlotSelected", {
                    player: currentPlayer.name,
                    slot: selectedSlot
                });

                await CpuAI.sleep(CpuAI.randomBetween(1000, 1600));

                // 3. カード配置
                const placeResult = this.placeCard(selectedCard, selectedSlot);

                // 4. ライン解決処理
                if (placeResult.completedLines.length > 0) {
                    await this._handleCPULineResolution(placeResult.completedLines);
                } else {
                    // ライン完成なし：手札空チェックとターン終了
                    const handCheck = this.checkHandEmptyAfterLineResolution();
                    if (handCheck.playerEliminated) {
                        return;
                    }
                    this.endTurn();
                }

            } catch (error) {
                console.error('[CPU] Error during turn execution:', error);
            }
        }

        /**
         * CPUのライン解決処理（複数ライン、Cherry効果含む）
         */
        async _handleCPULineResolution(completedLines) {
            await CpuAI.sleep(CpuAI.randomBetween(2000, 3000));

            // ライン選択
            const selectedLine = CpuAI.selectLineToResolve(completedLines);
            if (!selectedLine) {
                console.error('[CPU] Failed to select line');
                return;
            }

            this.emit("cpuLineSelected", {
                player: this.getCurrentPlayer().name,
                line: selectedLine
            });

            await CpuAI.sleep(CpuAI.randomBetween(1000, 1600));

            // Cherry効果の場合、カード選択が必要
            let options = {};
            if (selectedLine.symbol === SYMBOLS.CHERRY) {
                // 完成したラインのスロットを除外して選択可能なスロットを取得
                const nonEmptySlots = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(slot =>
                    !this.board.isSlotEmpty(slot) &&
                    slot !== CENTER_SLOT &&
                    !selectedLine.slots.includes(slot)
                );

                if (nonEmptySlots.length > 0) {
                    const selectedSlots = CpuAI.selectCardsForCherry(nonEmptySlots, 1);
                    options = { selectedSlots };

                    this.emit("cpuCherryCardsSelected", {
                        player: this.getCurrentPlayer().name,
                        slots: selectedSlots
                    });

                    await CpuAI.sleep(CpuAI.randomBetween(1000, 1600));
                }
            }

            // ライン解決実行
            const resolveResult = this.resolveLine(selectedLine, options);

            // ゲーム終了チェック（Rainbow 7 or Silver 3）
            if (resolveResult.instantWin || resolveResult.deckEmpty) {
                return;
            }

            // 手札空チェック
            const handCheck = this.checkHandEmptyAfterLineResolution();
            if (handCheck.playerEliminated) {
                return;
            }

            // ターン終了
            this.endTurn();
        }

        // ==================== 勝敗判定 ====================

        /**
         * デッキ枯渇によるゲーム終了
         */
        _endGameByDeckEmpty() {
            // アクティブなプレイヤーのみ評価
            const activePlayers = this.players.filter(p => p.isActive());

            if (activePlayers.length === 0) {
                // 全員敗北（引き分け扱い）
                this.endGame(null, "deck_empty_no_winner");
                return;
            }

            if (activePlayers.length === 1) {
                // 1人だけ生き残り
                this.endGame(activePlayers[0], "deck_empty_survival");
                return;
            }

            // 2人とも生存：スコア比較
            const player1 = activePlayers[0];
            const player2 = activePlayers[1];
            const score1 = player1.getScore();
            const score2 = player2.getScore();

            // スコア判定イベントを発行（実況エリア用）
            this.emit('deckEmptyScoreJudgment', {
                player1: {
                    name: player1.name,
                    score: score1
                },
                player2: {
                    name: player2.name,
                    score: score2
                },
                winner: score1 > score2 ? player1.name :
                        score2 > score1 ? player2.name :
                        'Draw'
            });

            if (score1 > score2) {
                this.endGame(player1, "deck_empty_score");
            } else if (score2 > score1) {
                this.endGame(player2, "deck_empty_score");
            } else {
                // 同点（引き分け）
                this.endGame(null, "deck_empty_draw");
            }
        }

        /**
         * ゲームを終了
         * @param {Player|null} winner - 勝者（引き分けの場合null）
         * @param {string} reason - 勝利理由
         */
        endGame(winner, reason) {
            this.gamePhase = "ended";
            this.winner = winner;
            this.winReason = reason;

            this.emit("gameEnded", {
                winner: winner ? winner.name : null,
                reason,
                players: this.players.map(p => ({
                    name: p.name,
                    handSize: p.getHandSize(),
                    score: p.getScore(),
                    isEliminated: p.isEliminated
                }))
            });
        }

        // ==================== ゲーム状態取得 ====================

        /**
         * ゲーム状態を取得
         * @returns {object} ゲーム状態
         */
        getGameState() {
            return {
                phase: this.gamePhase,
                currentPlayer: this.getCurrentPlayer().name,
                currentPlayerIndex: this.currentPlayerIndex,
                deckSize: this.deck ? this.deck.size : 0,
                discardPileSize: this.discardPile ? this.discardPile.size : 0,
                players: this.players.map(p => ({
                    name: p.name,
                    handSize: p.getHandSize(),
                    score: p.getScore(),
                    isEliminated: p.isEliminated
                })),
                winner: this.winner ? this.winner.name : null,
                winReason: this.winReason
            };
        }

        /**
         * デバッグ用：ゲーム状態を文字列化
         */
        toString() {
            const state = this.getGameState();
            const lines = [
                `=== Game State ===`,
                `Phase: ${state.phase}`,
                `Current Player: ${state.currentPlayer}`,
                `Deck: ${state.deckSize} cards`,
                `Discard Pile: ${state.discardPileSize} cards`,
                ``,
                `Players:`,
            ];

            state.players.forEach((p, i) => {
                const current = i === this.currentPlayerIndex ? " (CURRENT)" : "";
                const eliminated = p.isEliminated ? " [ELIMINATED]" : "";
                lines.push(`  ${p.name}${current}${eliminated}: ${p.handSize} cards, Score: ${p.score}`);
            });

            if (state.winner) {
                lines.push(``);
                lines.push(`Winner: ${state.winner} (${state.winReason})`);
            }

            return lines.join("\n");
        }
    }

    const CardSlot = {
        GameManager,
    };

    globalThis.CardSlot = Object.assign(globalThis.CardSlot || {}, CardSlot);
})();
