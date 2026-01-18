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

        // プレイヤーを敗北状態にする
        eliminate() {
            this.isEliminated = true;
        }

        // プレイヤーがアクティブかどうか（敗北していないか）
        isActive() {
            return !this.isEliminated;
        }

        // 手札が空かどうかをチェック
        hasEmptyHand() {
            return this.hand && this.hand.isEmpty();
        }

        // 手札の枚数を取得
        getHandSize() {
            return this.hand ? this.hand.size : 0;
        }

        // 手札のスコアを取得
        getScore() {
            return this.hand ? this.hand.calculateScore() : 0;
        }

        // デバッグ用：プレイヤーの状態を文字列化
        toString() {
            const status = this.isEliminated ? "ELIMINATED" : "ACTIVE";
            const handSize = this.getHandSize();
            const score = this.getScore();
            return `${this.name} [${status}] - Hand: ${handSize} cards, Score: ${score}`;
        }
    }

    const CardSlot = {
        Player,
    };

    globalThis.CardSlot = Object.assign(globalThis.CardSlot || {}, CardSlot);
})();
