// 3x3 ボード

class Board {
    constructor() {
        this._slots = {};
        for (let i = 1; i <= 9; i += 1) {
            this._slots[i] = null;
        }
    }

    _assertValidPosition(position) {
        if (!Number.isInteger(position) || position < 1 || position > 9) {
            throw new Error("position must be an integer from 1 to 9");
        }
    }

    isEmpty(position) {
        this._assertValidPosition(position);
        return this._slots[position] === null;
    }

    getCard(position) {
        this._assertValidPosition(position);
        return this._slots[position];
    }

    placeCard(position, card) {
        this._assertValidPosition(position);
        if (card == null) {
            throw new Error("card must be provided");
        }
        if (!this.isEmpty(position)) {
            throw new Error("position is already occupied");
        }
        this._slots[position] = card;
    }

    removeCard(position) {
        this._assertValidPosition(position);
        const card = this._slots[position];
        this._slots[position] = null;
        return card;
    }

    getBoard() {
        return { ...this._slots };
    }
}

globalThis.Board = Board;
