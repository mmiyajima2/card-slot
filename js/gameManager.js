// ゲーム進行管理
(() => {
    "use strict";

    // CardSlotが利用可能になるまで待機
    if (!globalThis.CardSlot) {
        console.error("CardSlot is not available. Make sure card.js is loaded first.");
        return;
    }

    class GameManager {
        constructor() {
            this.deck = null;
            this.discardPile = null;
            this.board = null;
            this.players = [];
            this.currentPlayerIndex = 0;
            this.gamePhase = "setup"; // "setup", "firstTurn", "normal", "ended"
        }
    }

    const CardSlot = {
        GameManager,
    };

    globalThis.CardSlot = Object.assign(globalThis.CardSlot || {}, CardSlot);
})();
