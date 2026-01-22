# CPU AI 仕様書 (Easy レベル)

## 概要

このドキュメントは、Card SlotゲームにおけるCPU AIの行動仕様を定義します。
まずはEasyレベルのAIを実装し、将来的にMedium、Hardレベルを追加する予定です。

## 基本方針

**Easy AI のコンセプト**
- 初心者向けの対戦相手
- 明らかな悪手は避けるが、深い戦略は持たない
- シンプルで予測可能な行動パターン
- ゲームルールを正しく理解している

## ターンの流れ

CPU AIのターンは以下の順序で実行されます：

1. **カード選択**: 手札から1枚のカードを選ぶ
2. **スロット選択**: ボード上の配置先を決定
3. **配置実行**: カードを配置し、必要に応じてライン解決を行う

各ステップでの判断基準を以下に詳述します。

---

## 1. カード選択ルール

### 優先順位

1. **手札が1枚の場合**
   - その1枚を選択（選択肢なし）

2. **第1ターン（センタースロット配置）の場合**
   - Rainbow 7とSilver 3は選択不可（ルール制約）
   - それ以外のカードからランダムに選択

3. **通常時**
   - Rainbow 7とSilver 3は温存する（ライン完成の可能性を残すため）
   - それ以外のカードがあれば、そこからランダムに選択
   - Rainbow 7とSilver 3しかない場合は、仕方なくランダムに選択

### 実装メモ

```javascript
// 疑似コード
function selectCard(hand, isFirstTurn) {
    if (hand.length === 1) return hand[0];

    if (isFirstTurn) {
        // Rainbow 7とSilver 3を除外
        const validCards = hand.filter(card =>
            card.symbol !== RAINBOW_7 && card.symbol !== SILVER_3
        );
        return randomChoice(validCards);
    }

    // 通常時：Rainbow 7とSilver 3以外を優先
    const preferredCards = hand.filter(card =>
        card.symbol !== RAINBOW_7 && card.symbol !== SILVER_3
    );

    if (preferredCards.length > 0) {
        return randomChoice(preferredCards);
    }

    return randomChoice(hand);
}
```

---

## 2. スロット選択ルール

### 優先順位（上から順に評価）

#### 優先度1: ライン完成チェック（最優先）

- 選択したカードを配置することで、自分のラインが完成するスロットがあるか確認
- 該当スロットがあれば、そこに配置
- 複数ある場合は、ランダムに1つ選択

#### 優先度2: センタースロット（9番）の確保

- センタースロット（9番）が空いている場合、優先的に配置
- センタースロットは最も多くのライン（4本）に関与するため戦略的に重要

#### 優先度3: 相手のライン妨害

- 相手があと1枚でライン完成する状況を検知
- そのライン上の空きスロットに配置して妨害
- 複数の妨害可能スロットがある場合は、ランダムに選択

#### 優先度4: ランダム配置

- 上記のいずれにも該当しない場合
- 空いているスロットの中からランダムに選択

### ボード満杯時の処理

ボードに空きスロットがない場合：

1. **捨て札選択**
   - センタースロット（9番）は捨てられない（ルール制約）
   - スロット1〜8の中からランダムに選択
   - 選択したスロットのカードを捨て札に移動

2. **配置実行**
   - 空いたスロットに選択したカードを配置

### 実装メモ

```javascript
// 疑似コード
function selectSlot(board, selectedCard, opponentInfo) {
    const emptySlots = board.getEmptySlots();

    // ボード満杯チェック
    if (emptySlots.length === 0) {
        return handleFullBoard(board);
    }

    // 優先度1: ライン完成
    const completingSlots = findLineCompletingSlots(board, selectedCard);
    if (completingSlots.length > 0) {
        return randomChoice(completingSlots);
    }

    // 優先度2: センタースロット
    if (emptySlots.includes(CENTER_SLOT)) {
        return CENTER_SLOT;
    }

    // 優先度3: 相手のライン妨害
    const blockingSlots = findOpponentBlockingSlots(board, opponentInfo);
    if (blockingSlots.length > 0) {
        return randomChoice(blockingSlots);
    }

    // 優先度4: ランダム
    return randomChoice(emptySlots);
}
```

---

## 3. ライン完成時の選択

### 複数ライン完成時

- 複数のラインが同時に完成した場合、ランダムに1つを選択
- 特定のシンボルを優先する戦略は持たない

### Cherry（チェリー）効果の処理

- ボードから最大1枚のカードを手札に加えられる
- 選択可能なカード（センタースロット以外）からランダムに1枚選択
- 選択可能なカードがない場合は何もしない

### Silver 3（銀3）効果の処理

- デッキを全て捨て札にする効果
- 追加の選択は不要（自動実行）

### その他のシンボル

- Bell（ベル）、Watermelon（スイカ）、Replay（リプレイ）などは自動処理
- AI側での追加判断は不要

---

## 4. 実行タイミング

### 人間プレイヤーへの配慮

CPUの行動は即座に実行せず、適度な待機時間を設けます：

- **カード選択**: 0.5〜1秒待機
- **スロット選択**: 0.5〜1秒待機
- **ライン解決**: 1〜1.5秒待機

これにより、人間プレイヤーがCPUの行動を視覚的に追えるようになります。

### 実装メモ

```javascript
// 疑似コード
async function executeCPUTurn() {
    await sleep(500);  // 0.5秒待機

    const card = selectCard();
    console.log(`CPU selected: ${card.symbol}`);

    await sleep(800);  // 0.8秒待機

    const slot = selectSlot(card);
    console.log(`CPU places on slot: ${slot}`);

    await sleep(500);  // 0.5秒待機

    placeCard(card, slot);
}
```

---

## 5. エラーハンドリング

### 無効な手の処理

- AIが選択した手が無効な場合（バグなど）、次の優先度にフォールバック
- 最終的にすべて無効な場合は、ランダムな有効手を選択
- エラーログを出力して開発者に通知

### デバッグ情報

開発モードでは、以下の情報をコンソールに出力：

- 選択したカード
- 選択したスロット
- 判断理由（どの優先順位で選択したか）
- ライン完成の有無

---

## 6. 将来の拡張（Medium / Hard）

### Medium AIの想定

- ライン完成の優先順位付け（高得点シンボル優先）
- 手札管理（カードの保持判断）
- 簡単な2手先読み

### Hard AIの想定

- 複数手先の読み
- 相手の手札推測
- リスク評価と最適化
- デッキ残り枚数の考慮

---

## 7. テスト項目

Easy AIの実装後、以下の項目をテストします：

- [ ] 第1ターンでRainbow 7/Silver 3を選択しない
- [ ] ライン完成可能時に必ず完成させる
- [ ] センタースロットが空いていれば優先的に配置
- [ ] 相手のライン完成を妨害する
- [ ] ボード満杯時に適切に捨て札を選択
- [ ] 無効な手を選択しない
- [ ] ゲームが正常に終了する（フリーズしない）
- [ ] 適切な待機時間で行動する

---

## 変更履歴

- 2026-01-22: 初版作成（Easy AIの仕様を定義）
