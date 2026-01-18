// プレイヤー
(() => {
    "use strict";

    // CardSlotが利用可能になるまで待機
    if (!globalThis.CardSlot) {
        console.error("CardSlot is not available. Make sure card.js is loaded first.");
        return;
    }

    class Player {
        constructor(name) {
            this.name = name;
            this.hand = null; // Handインスタンスを保持
            this.isEliminated = false;
        }
    }

    const CardSlot = {
        Player,
    };

    globalThis.CardSlot = Object.assign(globalThis.CardSlot || {}, CardSlot);
})();
