/**
 * main.js
 * UIの初期化とイベント処理を担当するエントリポイント
 */

(function() {
    'use strict';

    const { SYMBOLS, GameManager, CENTER_SLOT } = globalThis.CardSlot || {};

    if (!GameManager) {
        console.error('GameManager is not available. Make sure all JS files are loaded.');
        return;
    }

    // DOM要素のキャッシュ
    let elements = {};

    // GameManagerのインスタンス
    let gameManager = null;

    // ゲーム状態
    let gameState = {
        selectedCard: null,           // 現在選択中のカード
        tentativePlacement: null,     // 仮配置 { card, slot }
        awaitingConfirmation: false,  // 配置確定待ち
        awaitingLineSelection: false, // ライン選択待ち
        awaitingCardSelection: false, // カード選択待ち（Silver 3/Cherry）
        completedLines: [],           // 完成したライン一覧
        selectableSlots: [],          // 選択可能なスロット
        selectedSlots: [],            // 選択済みスロット
        selectedLine: null,           // 選択されたライン
        maxSelectableCards: 0,        // 最大選択可能カード数
        discardTargetSlot: null,      // 捨てる予定のスロット番号
        discardTargetCard: null       // 捨てる予定のカード
    };

    /**
     * DOM要素を取得してキャッシュ
     */
    function cacheElements() {
        elements = {
            // ゲーム情報
            currentPlayer: document.getElementById('current-player'),
            deckCount: document.getElementById('deck-count'),

            // ボード
            board: document.getElementById('board'),

            // プレイヤーエリア
            player1Area: document.getElementById('player1-area'),
            player1Hand: document.getElementById('player1-hand'),
            player1Status: document.getElementById('player1-status'),
            player2Area: document.getElementById('player2-area'),
            player2Hand: document.getElementById('player2-hand'),
            player2Status: document.getElementById('player2-status'),

            // 実況表示エリア
            commentaryMessages: document.getElementById('commentary-messages'),

            // アクションボタン
            btnNewGame: document.getElementById('btn-new-game'),
            btnConfirmPlacement: document.getElementById('btn-confirm-placement'),
            btnCancelPlacement: document.getElementById('btn-cancel-placement'),

            // モーダル: ライン選択
            lineSelectionModal: document.getElementById('line-selection-modal'),
            lineOptions: document.getElementById('line-options'),
            btnConfirmLine: document.getElementById('btn-confirm-line'),

            // モーダル: カード選択
            cardSelectionModal: document.getElementById('card-selection-modal'),
            cardSelectionTitle: document.getElementById('card-selection-title'),
            cardSelectionOptions: document.getElementById('card-selection-options'),
            btnConfirmCards: document.getElementById('btn-confirm-cards'),

            // モーダル: 捨てカード確認
            discardConfirmModal: document.getElementById('discard-confirm-modal'),
            discardConfirmMessage: document.getElementById('discard-confirm-message'),
            btnConfirmDiscard: document.getElementById('btn-confirm-discard'),
            btnCancelDiscard: document.getElementById('btn-cancel-discard'),

            // モーダル: ゲームモード選択
            gameModeModal: document.getElementById('game-mode-modal'),
            btnStartGame: document.getElementById('btn-start-game')
        };
    }

    /**
     * ボードのスロット（1-9）を動的に生成
     */
    function initializeBoard() {
        // スロット配置: [1,2,3] / [8,9,4] / [7,6,5]
        const slotLayout = [
            [1, 2, 3],
            [8, 9, 4],
            [7, 6, 5]
        ];

        elements.board.innerHTML = '';

        slotLayout.forEach(row => {
            row.forEach(slotNumber => {
                const slot = document.createElement('div');
                slot.className = 'slot empty';
                slot.dataset.slotNumber = slotNumber;

                if (slotNumber === CENTER_SLOT) {
                    slot.classList.add('center');
                }

                slot.addEventListener('click', () => handleSlotClick(slotNumber));
                elements.board.appendChild(slot);
            });
        });
    }

    /**
     * イベントリスナーを設定
     */
    function setupEventListeners() {
        // New Gameボタン
        elements.btnNewGame.addEventListener('click', handleNewGame);

        // 配置確定ボタン
        elements.btnConfirmPlacement.addEventListener('click', handleConfirmPlacement);

        // 配置キャンセルボタン
        elements.btnCancelPlacement.addEventListener('click', handleCancelPlacement);

        // ライン選択確定ボタン
        elements.btnConfirmLine.addEventListener('click', handleConfirmLine);

        // カード選択確定ボタン
        elements.btnConfirmCards.addEventListener('click', handleConfirmCards);

        // 捨てカード確定ボタン
        elements.btnConfirmDiscard.addEventListener('click', handleConfirmDiscard);

        // 捨てカードキャンセルボタン
        elements.btnCancelDiscard.addEventListener('click', handleCancelDiscard);

        // ゲーム開始ボタン（モーダル内）
        elements.btnStartGame.addEventListener('click', handleStartGameFromModal);
    }

    /**
     * GameManagerからのイベントを購読
     */
    function subscribeToGameEvents() {
        // ゲーム開始イベント
        gameManager.on('gameStarted', (data) => {
            addLogMessage(`Game started! ${data.currentPlayer}'s turn`, 'success');
            showCommentary(`${data.currentPlayer}'s Turn`, 'turn');
            updateUI();
        });

        // ターン開始イベント
        gameManager.on('turnStarted', (data) => {
            addLogMessage(`${data.player}'s turn started`, 'info');
            showCommentary(`${data.player}'s Turn`, 'turn');
            updateUI();
        });

        // ターン終了イベント
        gameManager.on('turnEnded', (data) => {
            addLogMessage(`${data.player}'s turn ended`, 'info');
        });

        // 第1ターン開始イベント
        gameManager.on('firstTurnStarted', (data) => {
            addLogMessage(`${data.currentPlayer}, place a card on Center Slot (9). Rainbow 7 and Silver 3 are not allowed.`, 'info');
        });

        // カード配置イベント
        gameManager.on('cardPlaced', (data) => {
            addLogMessage(`${data.player} placed ${data.card.symbol} on Slot ${data.slot}`, 'success');
            updateUI();
        });

        // カード捨てイベント
        gameManager.on('cardDiscarded', (data) => {
            addLogMessage(`${data.player} discarded ${data.discardedCard.display} from Slot ${data.slot}`, 'info');
        });

        // ライン完成イベント
        gameManager.on('linesCompleted', (data) => {
            gameState.completedLines = data.lines;

            // ラインが1つだけの場合は自動選択
            if (data.count === 1) {
                addLogMessage(`Line completed! Resolving ${data.lines[0].symbol}...`, 'success');
                const selectedLine = data.lines[0];
                gameState.selectedLine = selectedLine;

                // Silver 3は即座にデッキを空にするため、カード選択不要
                if (selectedLine.symbol === SYMBOLS.SILVER_3) {
                    addLogMessage(`Silver 3: Discarding entire deck...`, 'info');
                    resolveSelectedLine({ selectedSlots: [] });
                } else if (selectedLine.symbol === SYMBOLS.CHERRY) {
                    const validSlots = getValidSelectableSlots(selectedLine.slots);
                    console.log('[DEBUG] Cherry - Valid slots:', validSlots, 'Count:', validSlots.length, 'Line slots:', selectedLine.slots);
                    if (validSlots.length === 1) {
                        // 有効なカードが1枚なら自動で取得
                        addLogMessage(`Cherry: Auto-selecting 1 card from board`, 'info');
                        resolveSelectedLine({ selectedSlots: validSlots });
                    } else if (validSlots.length === 0) {
                        // 有効なカードがない場合はそのまま解決
                        resolveSelectedLine({ selectedSlots: [] });
                    } else {
                        // 2枚以上ある場合は選択UIを表示
                        showCardSelectionUI(1, 'Cherry: Select up to 1 card from board');
                    }
                } else {
                    // それ以外はそのまま解決
                    resolveSelectedLine({});
                }
            } else {
                // 複数ラインの場合は選択モーダルを表示
                addLogMessage(`${data.count} line(s) completed! Select one to resolve.`, 'success');
                gameState.awaitingLineSelection = true;
                showLineSelectionUI(data.lines);
            }
        });

        // ライン解決イベント
        gameManager.on('lineResolved', (data) => {
            if (data.instantWin) {
                // 虹7が揃った時の実況メッセージ
                showCommentary(`🌈 Rainbow 7 Line!\n${data.player} Wins!`, 'victory');
                addLogMessage(`${data.player} completed Rainbow 7 line and wins!`, 'success');
                return;
            }
            addLogMessage(`${data.player} resolved ${data.symbol} line`, 'success');
            if (data.cardsAddedToHand > 0) {
                addLogMessage(`+${data.cardsAddedToHand} card(s) added to hand`, 'info');
            }
            if (data.cardsDrawnFromDeck > 0) {
                addLogMessage(`+${data.cardsDrawnFromDeck} card(s) drawn from deck`, 'info');
            }
            if (data.replayActionExecuted) {
                if (data.replayCardPlaced) {
                    addLogMessage(`REPLAY: Drew ${data.replayCardPlaced.card.symbol} and placed on Slot ${data.replayCardPlaced.slot}`, 'info');
                } else {
                    addLogMessage(`REPLAY: No empty slot available`, 'info');
                }
            }
            updateUI();
        });

        // 強制リフレッシュイベント
        gameManager.on('forcedRefreshOccurred', (data) => {
            addLogMessage(`Forced Refresh! Slots 3 and 7 refreshed`, 'info');
            showCommentary('Refresh Occurred', 'effect');
            data.refreshResults.forEach(r => {
                if (r.removedCard) {
                    addLogMessage(`Slot ${r.slot}: ${r.removedCard.symbol} → ${r.placedCard.symbol}`, 'info');
                }
            });
            updateUI();
        });

        // Deck枯渇時のスコア判定イベント
        gameManager.on('deckEmptyScoreJudgment', (data) => {
            const message = `Deck Empty! Score Judgment:\n${data.player1.name}: ${data.player1.score} pts\n${data.player2.name}: ${data.player2.score} pts\nWinner: ${data.winner}`;
            showCommentary(message, 'score-result');
            addLogMessage(message.replace(/\n/g, ' '), 'info');
        });

        // 手札枯渇による勝敗イベント
        gameManager.on('handDepletionVictory', (data) => {
            const message = `${data.eliminatedPlayer} ran out of cards!\n${data.winner} wins!`;
            showCommentary(message, 'elimination-result');
            addLogMessage(message.replace(/\n/g, ' '), 'info');
        });

        // プレイヤー敗北イベント
        gameManager.on('playerEliminated', (data) => {
            addLogMessage(`${data.player} eliminated (${data.reason})`, 'error');
            updateUI();
        });

        // CPU関連イベント
        gameManager.on('cpuCardSelected', (data) => {
            addLogMessage(`${data.player} selected ${data.card.symbol}`, 'info');
            showCommentary(`CPU selected\n${data.card.symbol}`, 'cpu-action');
        });

        gameManager.on('cpuSlotSelected', (data) => {
            addLogMessage(`${data.player} will place on Slot ${data.slot}`, 'info');
            showCommentary(`CPU places on\nSlot ${data.slot}`, 'cpu-action');
        });

        gameManager.on('cpuLineSelected', (data) => {
            addLogMessage(`${data.player} selected line: ${data.line.symbol}`, 'info');
            showCommentary(`CPU resolves\n${data.line.symbol}`, 'cpu-action');
        });

        gameManager.on('cpuCherryCardsSelected', (data) => {
            addLogMessage(`${data.player} selected ${data.slots.length} card(s) from board`, 'info');
            showCommentary(`CPU picks card\nfrom board`, 'cpu-action');
        });

        gameManager.on('cpuDiscardSelected', (data) => {
            addLogMessage(`${data.player} will discard from Slot ${data.slot}`, 'info');
            showCommentary(`CPU discards\nSlot ${data.slot}`, 'cpu-action');
        });

        // ゲーム終了イベント
        gameManager.on('gameEnded', (data) => {
            if (data.winner) {
                const reasonMessages = {
                    'rainbow_7_line': 'Rainbow 7 Line completed',
                    'heavenly_hand': 'Heavenly Hand',
                    'opponent_eliminated': 'Opponent eliminated',
                    'deck_empty_survival': 'Last player standing',
                    'deck_empty_score': 'Higher score',
                    'deck_empty_no_winner': 'No winner',
                    'deck_empty_draw': 'Draw'
                };
                const reasonText = reasonMessages[data.reason] || data.reason;

                // 実況エリアへの勝利メッセージ表示
                let commentaryMessage = '';
                switch (data.reason) {
                    case 'rainbow_7_line':
                        commentaryMessage = `🌈 Rainbow 7 Line!\n${data.winner} Wins!`;
                        break;
                    case 'heavenly_hand':
                        commentaryMessage = `✨ Heavenly Hand!\n${data.winner} Wins!`;
                        break;
                    case 'opponent_eliminated':
                        commentaryMessage = `${data.winner} Wins!\nOpponent eliminated`;
                        break;
                    case 'deck_empty_survival':
                        commentaryMessage = `${data.winner} Wins!\nLast player standing`;
                        break;
                    case 'deck_empty_score':
                        commentaryMessage = `${data.winner} Wins!\nHigher score`;
                        break;
                    default:
                        commentaryMessage = `${data.winner} Wins!\n${reasonText}`;
                }
                showCommentary(commentaryMessage, 'victory');

                addLogMessage(`GAME OVER! ${data.winner} WINS!`, 'success');
                addLogMessage(`Victory condition: ${reasonText}`, 'success');
            } else {
                // 引き分けの場合
                showCommentary('Game Over\nDraw', 'draw');
                addLogMessage(`Game Over! Draw (${data.reason})`, 'info');
            }
            updateUI();
        });
    }

    /**
     * UIを更新（ゲーム状態に基づく）
     */
    function updateUI() {
        if (!gameManager) return;

        const state = gameManager.getGameState();

        // ヘッダー情報更新
        elements.currentPlayer.textContent = `${state.currentPlayer}'s Turn`;
        elements.deckCount.textContent = `Deck: ${state.deckSize}`;

        // ボード更新
        updateBoard();

        // プレイヤーエリア更新
        updatePlayerArea(0, state.players[0]);
        updatePlayerArea(1, state.players[1]);

        // ボタン更新
        updateButtons();
    }

    /**
     * ボードの状態を更新
     */
    function updateBoard() {
        if (!gameManager || !gameManager.board) return;

        for (let slotNumber = 1; slotNumber <= 9; slotNumber++) {
            const slotElement = elements.board.querySelector(`[data-slot-number="${slotNumber}"]`);
            if (!slotElement) continue;

            const card = gameManager.board.getCard(slotNumber);

            // 仮配置カードのチェック
            const isTentative = gameState.tentativePlacement &&
                               gameState.tentativePlacement.slot === slotNumber;

            if (card || isTentative) {
                slotElement.className = 'slot occupied';
                if (slotNumber === CENTER_SLOT) {
                    slotElement.classList.add('center');
                }
                slotElement.innerHTML = '';

                const displayCard = isTentative ? gameState.tentativePlacement.card : card;
                const cardElement = createCardElement(displayCard);

                if (isTentative) {
                    cardElement.classList.add('tentative');
                }

                cardElement.style.pointerEvents = 'none'; // ボード上のカードはクリック不可
                slotElement.appendChild(cardElement);
            } else {
                slotElement.className = 'slot empty';
                if (slotNumber === CENTER_SLOT) {
                    slotElement.classList.add('center');
                }
                slotElement.innerHTML = '';
            }
        }
    }

    /**
     * プレイヤーエリアを更新
     * @param {number} playerIndex - プレイヤーインデックス（0 or 1）
     * @param {object} playerData - プレイヤーデータ
     */
    function updatePlayerArea(playerIndex, playerData) {
        const areaElement = playerIndex === 0 ? elements.player1Area : elements.player2Area;
        const handElement = playerIndex === 0 ? elements.player1Hand : elements.player2Hand;
        const statusElement = playerIndex === 0 ? elements.player1Status : elements.player2Status;

        // アクティブプレイヤーのハイライト
        const state = gameManager.getGameState();
        if (state.currentPlayer === playerData.name && state.phase !== 'ended') {
            areaElement.classList.add('active-player');
        } else {
            areaElement.classList.remove('active-player');
        }

        // 敗北状態
        if (playerData.isEliminated) {
            areaElement.classList.add('eliminated');
        } else {
            areaElement.classList.remove('eliminated');
        }

        // ステータス更新
        statusElement.innerHTML = `
            <span class="hand-count">Hand: ${playerData.handSize}</span>
            <span class="score">Score: ${playerData.score}</span>
        `;

        // 手札更新
        const player = gameManager.players[playerIndex];
        if (player && player.hand) {
            // 現在のターンのプレイヤーかどうかをチェック
            const isCurrentPlayer = (state.currentPlayer === playerData.name && state.phase !== 'ended');
            renderHand(handElement, player.hand.cards, isCurrentPlayer);
        }
    }

    /**
     * 手札を描画
     * @param {HTMLElement} handElement - 手札の親要素
     * @param {Array} cards - カード配列
     * @param {boolean} isCurrentPlayer - 現在のターンのプレイヤーかどうか
     */
    function renderHand(handElement, cards, isCurrentPlayer) {
        handElement.innerHTML = '';

        if (cards.length === 0) {
            handElement.className = 'hand empty';
            handElement.textContent = 'No cards';
            return;
        }

        handElement.className = 'hand';

        cards.forEach(card => {
            const cardElement = createCardElement(card);

            // 現在のターンのプレイヤーのみクリック可能
            if (isCurrentPlayer) {
                cardElement.addEventListener('click', () => handleCardClick(card));
            } else {
                cardElement.classList.add('disabled');
                cardElement.style.pointerEvents = 'none';
                cardElement.style.opacity = '0.6';
            }

            handElement.appendChild(cardElement);
        });
    }

    /**
     * カード要素を作成
     * @param {object} card - カードオブジェクト
     * @returns {HTMLElement} カード要素
     */
    function createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.symbol = card.symbol;
        cardElement.dataset.cardId = card.id;

        // SVG画像を表示
        const imageElement = document.createElement('img');
        imageElement.className = 'card-image';
        imageElement.src = card.image;
        imageElement.alt = card.display;

        cardElement.appendChild(imageElement);

        return cardElement;
    }

    /**
     * ボタンの有効/無効を更新
     */
    function updateButtons() {
        // Confirm Placementボタン: 仮配置中のみ有効
        elements.btnConfirmPlacement.disabled = !gameState.awaitingConfirmation;

        // Cancelボタン: 仮配置中のみ有効
        elements.btnCancelPlacement.disabled = !gameState.awaitingConfirmation;
    }

    /**
     * ゲームログにメッセージを追加（開発者向け・コンソールのみ）
     * @param {string} message - メッセージ
     * @param {string} type - メッセージタイプ ('info', 'success', 'error')
     */
    function addLogMessage(message, type = 'info') {
        // コンソールにのみ出力
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    /**
     * 実況メッセージを表示（プレイヤー向け）
     * @param {string} message - メッセージ
     * @param {string} type - メッセージタイプ ('turn', 'effect')
     */
    function showCommentary(message, type = 'turn') {
        if (!elements.commentaryMessages) return;

        // 新しいメッセージ要素を作成
        const messageDiv = document.createElement('div');
        messageDiv.className = `commentary-message ${type}`;
        messageDiv.textContent = message;

        // 既存のメッセージをクリア（常に最新の1件のみ表示）
        elements.commentaryMessages.innerHTML = '';

        // 新しいメッセージを追加
        elements.commentaryMessages.appendChild(messageDiv);
    }

    /**
     * New Gameボタンのハンドラ
     */
    function handleNewGame() {
        // ゲームモード選択モーダルを表示
        elements.gameModeModal.style.display = 'flex';
    }

    /**
     * モーダルからのゲーム開始ハンドラ
     */
    function handleStartGameFromModal() {
        // 選択されたゲームモードを取得
        const selectedMode = document.querySelector('input[name="game-mode"]:checked').value;
        const selectedFirstPlayer = document.querySelector('input[name="first-player"]:checked').value;

        // Google Analytics イベント送信
        if (globalThis.CardSlot && globalThis.CardSlot.Analytics) {
            globalThis.CardSlot.Analytics.trackNewGame();
        }

        // モーダルを閉じる
        elements.gameModeModal.style.display = 'none';

        // 実況メッセージをクリア
        if (elements.commentaryMessages) {
            elements.commentaryMessages.innerHTML = '';
        }

        // ゲーム状態をリセット
        gameState.selectedCard = null;
        gameState.tentativePlacement = null;
        gameState.awaitingConfirmation = false;
        gameState.awaitingLineSelection = false;
        gameState.awaitingCardSelection = false;
        gameState.completedLines = [];
        gameState.selectableSlots = [];
        gameState.selectedSlots = [];
        gameState.selectedLine = null;

        // ゲーム設定オブジェクトを作成
        const gameConfig = {
            mode: selectedMode,           // 'solo' or 'cpu'
            firstPlayer: parseInt(selectedFirstPlayer), // 1 or 2
            cpuLevel: 'easy'              // 現在は常に'easy'
        };

        // ゲーム開始
        gameManager.startGame('Player 1', 'Player 2', gameConfig);
    }

    /**
     * 配置確定ハンドラ
     */
    function handleConfirmPlacement() {
        if (!gameState.tentativePlacement) {
            addLogMessage('No tentative placement to confirm', 'error');
            return;
        }

        const { card, slot } = gameState.tentativePlacement;

        try {
            // GameManagerに反映（確定）
            const result = gameManager.placeCard(card, slot);

            // 仮配置状態をクリア
            gameState.tentativePlacement = null;
            gameState.awaitingConfirmation = false;

            // ライン完成チェック
            if (result.completedLines.length === 0) {
                // ライン完成なし → 手札0枚チェック後、ターン終了
                const handCheckResult = gameManager.checkHandEmptyAfterLineResolution();
                if (handCheckResult.playerEliminated) {
                    updateUI();
                    return;
                }

                addLogMessage('Card placed. Turn ended.', 'success');
                updateUI();
                gameManager.endTurn();
            }
            // ライン完成時はイベント経由でモーダルが表示され、解決後に自動的にターン終了

            // UI更新（ボタン状態を反映）
            updateUI();

        } catch (error) {
            addLogMessage(`Error: ${error.message}`, 'error');
            gameState.tentativePlacement = null;
            gameState.awaitingConfirmation = false;
            updateUI();
        }
    }

    /**
     * 配置キャンセルハンドラ
     */
    function handleCancelPlacement() {
        if (!gameState.tentativePlacement) {
            addLogMessage('No tentative placement to cancel', 'error');
            return;
        }

        const { card } = gameState.tentativePlacement;

        // 仮配置をキャンセル（カードは手札に戻る扱い）
        gameState.tentativePlacement = null;
        gameState.awaitingConfirmation = false;

        updateUI();
        addLogMessage(`Placement cancelled. ${card.display} returned to hand.`, 'info');
    }

    /**
     * 手札カードクリックのハンドラ
     * @param {object} card - クリックされたカード
     */
    function handleCardClick(card) {
        const state = gameManager.getGameState();

        if (state.phase === 'ended') {
            addLogMessage('Game has ended', 'error');
            return;
        }

        // CPUターン中は操作不可
        if (gameManager.isCPUTurn()) {
            addLogMessage('CPU is thinking...', 'info');
            return;
        }

        // 念のため、自分のターンかどうかを再確認（二重チェック）
        const currentPlayer = gameManager.getCurrentPlayer();
        const clickedPlayerHand = gameManager.players.find(p => p.hand.cards.includes(card));
        if (clickedPlayerHand !== currentPlayer) {
            addLogMessage('It is not your turn', 'error');
            return;
        }

        if (gameState.awaitingLineSelection || gameState.awaitingCardSelection) {
            addLogMessage('Please complete current action first', 'error');
            return;
        }

        // 仮配置中の場合は警告
        if (gameState.awaitingConfirmation) {
            addLogMessage('Please confirm or cancel the current placement first', 'error');
            return;
        }

        // 既に選択済みのカードをクリックした場合は選択解除
        if (gameState.selectedCard && gameState.selectedCard.id === card.id) {
            clearSelectedCard();
            addLogMessage('Card deselected', 'info');
            return;
        }

        // カードを選択
        gameState.selectedCard = card;
        updateCardSelection();
        addLogMessage(`Selected ${card.display}. Click on a slot to place it.`, 'info');
    }

    /**
     * スロットクリックのハンドラ
     * Board is full flow:
     * 1) User clicks on a board slot (Slot 1-8 only, Slot 9 cannot be selected)
     * 2) Confirmation dialog appears: "Discard [Card] from Slot X?"
     * 3) If user confirms discard -> card is discarded, then user selects card from hand to place
     *
     * @param {number} slotNumber - クリックされたスロット番号
     */
    function handleSlotClick(slotNumber) {
        const state = gameManager.getGameState();

        if (state.phase === 'ended') {
            addLogMessage('Game has ended', 'error');
            return;
        }

        // CPUターン中は操作不可
        if (gameManager.isCPUTurn()) {
            addLogMessage('CPU is thinking...', 'info');
            return;
        }

        // ボード満杯時の処理
        if (gameManager.board.isFull()) {
            // Slot 9（中央）は捨てられない
            if (slotNumber === CENTER_SLOT) {
                addLogMessage('Cannot discard center slot (Slot 9)', 'error');
                return;
            }

            // 捨てカード確認ダイアログを表示
            const card = gameManager.board.getCard(slotNumber);
            if (card) {
                showDiscardConfirmDialog(slotNumber, card);
            }
            return;
        }

        // 通常の配置フロー（ボード満杯でない場合）
        if (!gameState.selectedCard) {
            addLogMessage('Please select a card from your hand first', 'error');
            return;
        }

        // 配置可能かチェック
        const canPlace = gameManager.canPlaceCard(slotNumber, gameState.selectedCard);
        if (!canPlace.valid) {
            addLogMessage(`Cannot place card: ${canPlace.reason}`, 'error');
            return;
        }

        // 仮配置状態にする（GameManagerには反映しない）
        gameState.tentativePlacement = {
            card: gameState.selectedCard,
            slot: slotNumber
        };
        gameState.awaitingConfirmation = true;

        clearSelectedCard();
        updateBoard();
        updateButtons();

        addLogMessage(`Card placed tentatively on Slot ${slotNumber}. Click "Place Card" to finalize or "Cancel" to undo.`, 'info');
    }

    /**
     * 選択中のカードをクリア
     */
    function clearSelectedCard() {
        gameState.selectedCard = null;
        updateCardSelection();
    }

    /**
     * カード選択状態の表示を更新
     */
    function updateCardSelection() {
        // 全てのカードから選択状態を削除
        document.querySelectorAll('.card').forEach(el => {
            el.classList.remove('selected');
        });

        // 選択中のカードに選択状態を追加
        if (gameState.selectedCard) {
            const selectedElements = document.querySelectorAll(`[data-card-id="${gameState.selectedCard.id}"]`);
            selectedElements.forEach(el => el.classList.add('selected'));
        }
    }

    /**
     * ボード上のラインをハイライト
     * @param {Array} slots - スロット番号の配列
     */
    function highlightLineOnBoard(slots) {
        // 既存のハイライトをクリア
        clearBoardHighlight();

        // 該当スロットにハイライトクラスを追加
        slots.forEach(slotNumber => {
            const slotElement = elements.board.querySelector(`[data-slot-number="${slotNumber}"]`);
            if (slotElement) {
                slotElement.classList.add('line-highlighted');
            }
        });
    }

    /**
     * ボードのハイライトをクリア
     */
    function clearBoardHighlight() {
        const highlightedSlots = elements.board.querySelectorAll('.slot.line-highlighted');
        highlightedSlots.forEach(slot => {
            slot.classList.remove('line-highlighted');
        });
    }

    /**
     * ライン選択UIを表示
     * @param {Array} lines - 完成したライン配列
     */
    function showLineSelectionUI(lines) {
        elements.lineOptions.innerHTML = '';

        lines.forEach((line, index) => {
            const option = document.createElement('div');
            option.className = 'line-option';
            option.dataset.lineIndex = index;

            const label = document.createElement('label');
            label.innerHTML = `
                <input type="radio" name="line" value="${index}">
                ${line.symbol} - Slots: [${line.slots.join(', ')}]
            `;

            option.appendChild(label);
            option.addEventListener('click', () => {
                document.querySelectorAll('.line-option').forEach(el => el.classList.remove('selected'));
                option.classList.add('selected');
                option.querySelector('input').checked = true;

                // ボード上のラインをハイライト
                highlightLineOnBoard(line.slots);
            });

            elements.lineOptions.appendChild(option);
        });

        elements.lineSelectionModal.style.display = 'flex';
    }

    /**
     * ライン選択確定ハンドラ
     */
    function handleConfirmLine() {
        const selectedRadio = document.querySelector('input[name="line"]:checked');
        if (!selectedRadio) {
            addLogMessage('Please select a line', 'error');
            return;
        }

        const lineIndex = parseInt(selectedRadio.value);
        const selectedLine = gameState.completedLines[lineIndex];
        gameState.selectedLine = selectedLine;

        // ハイライトをクリア
        clearBoardHighlight();

        // モーダルを閉じる
        elements.lineSelectionModal.style.display = 'none';
        gameState.awaitingLineSelection = false;

        // Silver 3は即座にデッキを空にするため、カード選択不要
        if (selectedLine.symbol === SYMBOLS.SILVER_3) {
            addLogMessage(`Silver 3: Discarding entire deck...`, 'info');
            resolveSelectedLine({ selectedSlots: [] });
        } else if (selectedLine.symbol === SYMBOLS.CHERRY) {
            const validSlots = getValidSelectableSlots(selectedLine.slots);
            console.log('[DEBUG] Cherry (from line selection) - Valid slots:', validSlots, 'Count:', validSlots.length, 'Line slots:', selectedLine.slots);
            if (validSlots.length === 1) {
                // 有効なカードが1枚なら自動で取得
                addLogMessage(`Cherry: Auto-selecting 1 card from board`, 'info');
                resolveSelectedLine({ selectedSlots: validSlots });
            } else if (validSlots.length === 0) {
                // 有効なカードがない場合はそのまま解決
                resolveSelectedLine({ selectedSlots: [] });
            } else {
                // 2枚以上ある場合は選択UIを表示
                showCardSelectionUI(1, 'Cherry: Select up to 1 card from board');
            }
        } else {
            // それ以外はそのまま解決
            resolveSelectedLine({});
        }
    }

    /**
     * ボードから有効な選択可能スロットを取得（センタースロット以外）
     * @param {number[]} excludeSlots - 除外するスロット番号の配列（解決するラインのスロットなど）
     * @returns {number[]} 有効なスロット番号の配列
     */
    function getValidSelectableSlots(excludeSlots = []) {
        const validSlots = [];
        for (let slotNumber = 1; slotNumber <= 9; slotNumber++) {
            if (slotNumber === CENTER_SLOT) continue;
            if (excludeSlots.includes(slotNumber)) continue;
            const card = gameManager.board.getCard(slotNumber);
            if (card) {
                validSlots.push(slotNumber);
            }
        }
        return validSlots;
    }

    /**
     * カード選択UIを表示（Silver 3 / Cherry用）
     * @param {number} requiredCount - 必要な選択数（銀3=2, チェリー=1）
     * @param {string} title - タイトル
     */
    function showCardSelectionUI(requiredCount, title) {
        gameState.awaitingCardSelection = true;
        gameState.maxSelectableCards = requiredCount;
        gameState.selectedSlots = [];

        elements.cardSelectionTitle.textContent = title;
        elements.cardSelectionOptions.innerHTML = '';

        // 有効なスロットを取得（ラインのスロットを除外）
        const validSlotNumbers = getValidSelectableSlots(gameState.selectedLine.slots);
        const validSlots = validSlotNumbers.map(slotNumber => ({
            slotNumber,
            card: gameManager.board.getCard(slotNumber)
        }));

        // チェリー（1枚選択）の場合はラジオボタン、銀3（2枚選択）の場合はチェックボックス
        const inputType = requiredCount === 1 ? 'radio' : 'checkbox';
        const inputName = requiredCount === 1 ? 'card-slot' : '';

        validSlots.forEach(({ slotNumber, card }) => {
            const option = document.createElement('div');
            option.className = 'card-option';
            option.dataset.slotNumber = slotNumber;

            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = inputType;
            if (inputName) input.name = inputName;
            input.value = slotNumber;
            input.addEventListener('change', () => handleCardSlotSelection(requiredCount));

            label.appendChild(input);
            label.appendChild(document.createTextNode(` Slot ${slotNumber} - ${card.display}`));

            option.appendChild(label);
            elements.cardSelectionOptions.appendChild(option);
        });

        // Confirmボタンは初期状態で無効
        elements.btnConfirmCards.disabled = true;

        elements.cardSelectionModal.style.display = 'flex';
    }

    /**
     * カードスロット選択ハンドラ（チェックボックス/ラジオボタン用）
     * @param {number} requiredCount - 必要な選択数
     */
    function handleCardSlotSelection(requiredCount) {
        // 現在選択されているスロットを取得
        const selectedInputs = elements.cardSelectionOptions.querySelectorAll('input:checked');
        const selectedSlots = Array.from(selectedInputs).map(input => parseInt(input.value));

        gameState.selectedSlots = selectedSlots;

        // ボード上のハイライトを更新
        clearBoardHighlight();
        selectedSlots.forEach(slot => {
            const slotElement = elements.board.querySelector(`[data-slot-number="${slot}"]`);
            if (slotElement) {
                slotElement.classList.add('line-highlighted');
            }
        });

        // Confirmボタンの有効/無効を切り替え
        elements.btnConfirmCards.disabled = selectedSlots.length !== requiredCount;
    }

    /**
     * カード選択確定ハンドラ
     */
    function handleConfirmCards() {
        // 選択されたスロットでライン解決
        resolveSelectedLine({ selectedSlots: gameState.selectedSlots });

        // ハイライトをクリア
        clearBoardHighlight();

        // モーダルを閉じる
        elements.cardSelectionModal.style.display = 'none';
        gameState.awaitingCardSelection = false;
        gameState.selectedSlots = [];
    }

    /**
     * 選択されたラインを解決
     * @param {object} options - オプション（selectedSlots等）
     */
    function resolveSelectedLine(options) {
        if (!gameState.selectedLine) {
            addLogMessage('No line selected', 'error');
            return;
        }

        try {
            gameManager.resolveLine(gameState.selectedLine, options);
            gameState.selectedLine = null;
            gameState.completedLines = [];

            // ライン解決後、手札0枚チェック
            const handCheckResult = gameManager.checkHandEmptyAfterLineResolution();
            if (handCheckResult.playerEliminated) {
                updateUI();
                return;
            }

            // ゲームが終了している場合はターン終了処理をスキップ
            const currentState = gameManager.getGameState();
            if (currentState.phase === 'ended') {
                updateUI();
                return;
            }

            // ライン解決後、自動的にターン終了
            addLogMessage('Line resolved. Turn ended.', 'success');
            updateUI();
            gameManager.endTurn();
        } catch (error) {
            addLogMessage(`Error resolving line: ${error.message}`, 'error');
        }
    }

    /**
     * 捨てカード確認ダイアログを表示
     * @param {number} slotNumber - スロット番号
     * @param {object} card - カードオブジェクト
     */
    function showDiscardConfirmDialog(slotNumber, card) {
        gameState.discardTargetSlot = slotNumber;
        gameState.discardTargetCard = card;

        elements.discardConfirmMessage.textContent = `Discard ${card.display} from Slot ${slotNumber}?`;
        elements.discardConfirmModal.style.display = 'flex';

        addLogMessage(`Confirm to discard ${card.display} from Slot ${slotNumber}`, 'info');
    }

    /**
     * 捨てカード確認ダイアログを閉じる
     */
    function hideDiscardConfirmDialog() {
        elements.discardConfirmModal.style.display = 'none';
        gameState.discardTargetSlot = null;
        gameState.discardTargetCard = null;
    }

    /**
     * 捨てカード確定ハンドラ
     */
    function handleConfirmDiscard() {
        if (!gameState.discardTargetSlot) {
            addLogMessage('No slot selected for discard', 'error');
            return;
        }

        try {
            // スロットのカードを捨て札に移動
            const result = gameManager.discardCardFromSlot(gameState.discardTargetSlot);

            // ダイアログを閉じる
            hideDiscardConfirmDialog();

            // UIを更新
            updateUI();

            // 手札から配置するカードを選択するよう促す
            addLogMessage(`Slot ${gameState.discardTargetSlot} is now empty. Select a card from your hand to place.`, 'info');

        } catch (error) {
            addLogMessage(`Error: ${error.message}`, 'error');
        }
    }

    /**
     * 捨てカードキャンセルハンドラ
     */
    function handleCancelDiscard() {
        hideDiscardConfirmDialog();
        addLogMessage('Discard cancelled', 'info');
    }

    /**
     * アプリケーションの初期化
     */
    function initialize() {
        cacheElements();
        initializeBoard();
        setupEventListeners();

        // GameManagerのインスタンスを作成
        gameManager = new GameManager();
        subscribeToGameEvents();

        console.log('Card Slot initialized');
        addLogMessage('Welcome to Card Slot! Click "New Game" to start.', 'info');
    }

    // DOMContentLoadedで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
