// ライン効果解決
(() => {
    "use strict";

    // CardSlotが利用可能になるまで待機
    if (!globalThis.CardSlot) {
        console.error("CardSlot is not available. Make sure card.js is loaded first.");
        return;
    }

    class LineEffectResolver {
        constructor() {
            // ライン効果の解決ロジックを管理
        }
    }

    const CardSlot = {
        LineEffectResolver,
    };

    globalThis.CardSlot = Object.assign(globalThis.CardSlot || {}, CardSlot);
})();
