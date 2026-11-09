//src/state/gameState.js
import {
    SAVE_VERSION,
    STARTING_MAX_NUMBER,
    MINIMUM_MAX_NUMBER
} from "../config.js";

export function createDefaultGameState() {
    return {
        version: SAVE_VERSION,
        ep: 0,
        totalRolls: 0,
        maxNumber: STARTING_MAX_NUMBER,
        upgrades: {
            multiRoll: 0,
            rangeReduction: 0
        },
        lastNumber: null,
        gameWon: false
    };
}

// Keep loaded save data within sensible limits and fill in fields added later.
export function normalizeGameState(savedData) {
    const defaults = createDefaultGameState();

    if (!savedData || typeof savedData !== "object") {
        return defaults;
    }

    const upgrades = savedData.upgrades ?? {};
    const ep = Number(savedData.ep);
    const totalRolls = Number(savedData.totalRolls);
    const maxNumber = Number(savedData.maxNumber);
    const lastNumber = savedData.lastNumber;

    return {
        version: SAVE_VERSION,
        ep: Number.isFinite(ep) ? Math.max(0, ep) : defaults.ep,
        totalRolls: Number.isSafeInteger(totalRolls)
            ? Math.max(0, totalRolls)
            : defaults.totalRolls,
        maxNumber: Number.isSafeInteger(maxNumber)
            ? Math.min(STARTING_MAX_NUMBER, Math.max(MINIMUM_MAX_NUMBER, maxNumber))
            : defaults.maxNumber,
        upgrades: {
            multiRoll: Number.isSafeInteger(Number(upgrades.multiRoll))
                ? Math.min(10, Math.max(0, Number(upgrades.multiRoll)))
                : 0,
            rangeReduction: Number.isSafeInteger(Number(upgrades.rangeReduction))
                ? Math.min(40, Math.max(0, Number(upgrades.rangeReduction)))
                : 0
        },
        lastNumber: Number.isSafeInteger(lastNumber) && lastNumber >= 0
            ? lastNumber
            : null,
        gameWon: savedData.gameWon === true
    };
}

export function getRollCount(game) {
    // One starting roll, plus one for every Multi-roll level.
    return 1 + game.upgrades.multiRoll;
}
