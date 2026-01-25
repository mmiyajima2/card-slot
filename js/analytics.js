/**
 * analytics.js
 * Google Analytics 4 イベントトラッキング
 */

(function() {
    'use strict';

    /**
     * 本番環境かどうかを判定
     * @returns {boolean} 本番環境ならtrue
     */
    function isProductionEnvironment() {
        const hostname = window.location.hostname;
        // GitHub Pagesのホスト名のみ本番環境とする
        return hostname === 'mmiyajima2.github.io';
    }

    /**
     * GA4にイベントを送信
     * @param {string} eventName - イベント名
     * @param {object} eventParams - イベントパラメータ（オプション）
     */
    function sendGAEvent(eventName, eventParams = {}) {
        // 本番環境でない場合は送信しない
        if (!isProductionEnvironment()) {
            console.log('[Analytics] Event not sent (non-production environment):', eventName, eventParams);
            return;
        }

        // gtagが利用可能かチェック
        if (typeof gtag === 'function') {
            gtag('event', eventName, eventParams);
            console.log('[Analytics] Event sent:', eventName, eventParams);
        } else {
            console.warn('[Analytics] gtag is not available');
        }
    }

    /**
     * New Gameイベントを送信
     */
    function trackNewGame() {
        sendGAEvent('new_game_started', {
            event_category: 'game',
            event_label: 'new_game_button_clicked'
        });
    }

    /**
     * Game Completedイベントを送信
     * @param {string} winner - 勝者名（またはdraw）
     * @param {string} reason - 勝利理由
     * @param {string} gameMode - ゲームモード（solo/cpu）
     */
    function trackGameCompleted(winner, reason, gameMode) {
        sendGAEvent('game_completed', {
            event_category: 'game',
            event_label: 'game_finished',
            winner: winner,
            win_reason: reason,
            game_mode: gameMode
        });
    }

    /**
     * Play Againイベントを送信
     * @param {string} gameMode - ゲームモード（solo/cpu）
     */
    function trackPlayAgain(gameMode) {
        sendGAEvent('play_again', {
            event_category: 'game',
            event_label: 'play_again_button_clicked',
            game_mode: gameMode
        });
    }

    // グローバルに公開
    if (!globalThis.CardSlot) {
        globalThis.CardSlot = {};
    }
    globalThis.CardSlot.Analytics = {
        trackNewGame: trackNewGame,
        trackGameCompleted: trackGameCompleted,
        trackPlayAgain: trackPlayAgain,
        sendEvent: sendGAEvent,
        isProduction: isProductionEnvironment
    };

})();
