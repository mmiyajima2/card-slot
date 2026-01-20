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

            // ゲームログ
            gameLog: document.getElementById('game-log'),

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
            cardSelectionInstruction: document.getElementById('card-selection-instruction'),
            boardCardSelection: document.getElementById('board-card-selection'),
            btnConfirmCards: document.getElementById('btn-confirm-cards'),
            btnSkipCards: document.getElementById('btn-skip-cards'),

            // モーダル: 捨てカード確認
            discardConfirmModal: document.getElementById('discard-confirm-modal'),
            discardConfirmMessage: document.getElementById('discard-confirm-message'),
            btnConfirmDiscard: document.getElementById('btn-confirm-discard'),
            btnCancelDiscard: document.getElementById('btn-cancel-discard')
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

        // カード選択スキップボタン
        elements.btnSkipCards.addEventListener('click', handleSkipCards);

        // 捨てカード確定ボタン
        elements.btnConfirmDiscard.addEventListener('click', handleConfirmDiscard);

        // 捨てカードキャンセルボタン
        elements.btnCancelDiscard.addEventListener('click', handleCancelDiscard);
    }

    /**
     * GameManagerからのイベントを購読
     */
    function subscribeToGameEvents() {
        // ゲーム開始イベント
        gameManager.on('gameStarted', (data) => {
            addLogMessage(`Game started! ${data.currentPlayer}'s turn`, 'success');
            updateUI();
        });

        // ターン開始イベント
        gameManager.on('turnStarted', (data) => {
            addLogMessage(`${data.player}'s turn started`, 'info');
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
            addLogMessage(`${data.count} line(s) completed! Select one to resolve.`, 'success');
            gameState.completedLines = data.lines;
            gameState.awaitingLineSelection = true;
            showLineSelectionUI(data.lines);
        });

        // ライン解決イベント
        gameManager.on('lineResolved', (data) => {
            if (data.instantWin) {
                // instantWinの場合はgameEndedイベントで表示するため、ここでは何もしない
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
            data.refreshResults.forEach(r => {
                if (r.removedCard) {
                    addLogMessage(`Slot ${r.slot}: ${r.removedCard.symbol} → ${r.placedCard.symbol}`, 'info');
                }
            });
            updateUI();
        });

        // プレイヤー敗北イベント
        gameManager.on('playerEliminated', (data) => {
            addLogMessage(`${data.player} eliminated (${data.reason})`, 'error');
            updateUI();
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
                addLogMessage(`GAME OVER! ${data.winner} WINS!`, 'success');
                addLogMessage(`Victory condition: ${reasonText}`, 'success');
            } else {
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
     * ゲームログにメッセージを追加
     * @param {string} message - メッセージ
     * @param {string} type - メッセージタイプ ('info', 'success', 'error')
     */
    function addLogMessage(message, type = 'info') {
        const p = document.createElement('p');
        p.className = type;

        // 時刻を追加（控えめなスタイル）
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        timeSpan.textContent = `[${timeStr}] `;

        // メッセージテキストを追加
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;

        p.appendChild(timeSpan);
        p.appendChild(messageSpan);

        // 新しいメッセージを先頭に追加（最新が上）
        elements.gameLog.insertBefore(p, elements.gameLog.firstChild);
    }

    /**
     * New Gameボタンのハンドラ
     */
    function handleNewGame() {
        // Google Analytics イベント送信
        if (globalThis.CardSlot && globalThis.CardSlot.Analytics) {
            globalThis.CardSlot.Analytics.trackNewGame();
        }

        // ゲームログをクリア
        elements.gameLog.innerHTML = '';

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

        // ゲーム開始
        gameManager.startGame('Player 1', 'Player 2');
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

            // プレイヤー敗北チェック（手札0枚）
            if (result.playerEliminated) {
                updateUI();
                return;
            }

            // ライン完成チェック
            if (result.completedLines.length === 0) {
                // ライン完成なし → 即座にターン終了
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

        // モーダルを閉じる
        elements.lineSelectionModal.style.display = 'none';
        gameState.awaitingLineSelection = false;

        // Silver 3 / Cherryの場合、カード選択UIを表示
        if (selectedLine.symbol === SYMBOLS.SILVER_3) {
            showCardSelectionUI(2, 'Silver 3: Select up to 2 cards from board');
        } else if (selectedLine.symbol === SYMBOLS.CHERRY) {
            showCardSelectionUI(1, 'Cherry: Select up to 1 card from board');
        } else {
            // それ以外はそのまま解決
            resolveSelectedLine({});
        }
    }

    /**
     * カード選択UIを表示（Silver 3 / Cherry用）
     * @param {number} maxSelect - 最大選択可能数
     * @param {string} title - タイトル
     */
    function showCardSelectionUI(maxSelect, title) {
        gameState.awaitingCardSelection = true;
        gameState.maxSelectableCards = maxSelect;
        gameState.selectedSlots = [];

        elements.cardSelectionTitle.textContent = title;
        elements.cardSelectionInstruction.textContent = `Select up to ${maxSelect} card(s). Slot 9 (center) cannot be selected.`;

        // ボード上のカードを表示（Slot 9以外）
        elements.boardCardSelection.innerHTML = '';

        for (let slotNumber = 1; slotNumber <= 9; slotNumber++) {
            if (slotNumber === CENTER_SLOT) continue; // センタースロットは選択不可

            const card = gameManager.board.getCard(slotNumber);
            if (card) {
                const cardElement = createCardElement(card);
                cardElement.classList.add('selectable');
                cardElement.dataset.slotNumber = slotNumber;
                cardElement.addEventListener('click', () => handleBoardCardClick(slotNumber, cardElement));
                elements.boardCardSelection.appendChild(cardElement);
            }
        }

        elements.cardSelectionModal.style.display = 'flex';
    }

    /**
     * ボードカード選択ハンドラ
     * @param {number} slotNumber - スロット番号
     * @param {HTMLElement} cardElement - カード要素
     */
    function handleBoardCardClick(slotNumber, cardElement) {
        const index = gameState.selectedSlots.indexOf(slotNumber);

        if (index > -1) {
            // 選択解除
            gameState.selectedSlots.splice(index, 1);
            cardElement.classList.remove('selected');
        } else {
            // 選択
            if (gameState.selectedSlots.length >= gameState.maxSelectableCards) {
                addLogMessage(`You can only select up to ${gameState.maxSelectableCards} card(s)`, 'error');
                return;
            }
            gameState.selectedSlots.push(slotNumber);
            cardElement.classList.add('selected');
        }
    }

    /**
     * カード選択確定ハンドラ
     */
    function handleConfirmCards() {
        // 選択されたスロットでライン解決
        resolveSelectedLine({ selectedSlots: gameState.selectedSlots });

        // モーダルを閉じる
        elements.cardSelectionModal.style.display = 'none';
        gameState.awaitingCardSelection = false;
        gameState.selectedSlots = [];
    }

    /**
     * カード選択スキップハンドラ
     */
    function handleSkipCards() {
        // スロット選択なしでライン解決
        resolveSelectedLine({ selectedSlots: [] });

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
