//src/state/gameState.js
import {
    SAVE_VERSION
} from "../config.js";
import { UPGRADE_DEFINITIONS } from "../game/upgrades/definitions.js";

const boundedLevel = (value, maxLevel) => Number.isSafeInteger(Number(value))
    ? Math.min(maxLevel, Math.max(0, Number(value)))
    : 0;

export function createDefaultGameState() {
    return {
        version: SAVE_VERSION,
        ep: 0,
        lifetimeEP: 0,
        totalRolls: 0,
        upgrades: {
            multiRoll: 0,
            luck: 0,
            animationSpeed: 0,
            epMultiplier: 0
        },
        lastNumber: null,
        luckiestRoll: null,
        notableRolls: [],
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
    const savedLifetimeEP = Number(savedData.lifetimeEP);
    const totalRolls = Number(savedData.totalRolls);
    const lastNumber = savedData.lastNumber;
    const savedLuckiestRoll = savedData.luckiestRoll;
    const savedNotableRolls = Array.isArray(savedData.notableRolls)
        ? savedData.notableRolls
        : [];
    const savedLuck = upgrades.luck === undefined
        ? upgrades.rangeReduction
        : upgrades.luck;
    // Keep save limits in sync with the upgrade definitions shown to players.
    // Hard-coded lower limits here silently downgraded valid saved upgrades.
    const normalizedUpgrades = Object.fromEntries(
        Object.values(UPGRADE_DEFINITIONS).map((definition) => [
            definition.id,
            boundedLevel(
                definition.id === "luck" ? savedLuck : upgrades[definition.id],
                definition.maxLevel
            )
        ])
    );
    const upgradeSpending = Object.values(UPGRADE_DEFINITIONS).reduce((total, definition) => {
        const level = normalizedUpgrades[definition.id] ?? 0;
        for (let purchase = 0; purchase < level; purchase++) {
            total += Math.ceil(definition.baseCost * definition.costMultiplier ** purchase);
        }
        return total;
    }, 0);
    const currentEP = Number.isFinite(ep) ? Math.max(0, ep) : defaults.ep;
    const lifetimeEP = Number.isFinite(savedLifetimeEP)
        ? Math.max(currentEP, savedLifetimeEP)
        : currentEP + upgradeSpending;
    const validRarities = new Set(["trash", "common", "uncommon", "rare", "epic", "anomaly", "mythic", "unique"]);
    const luckiestRoll = savedLuckiestRoll && typeof savedLuckiestRoll === "object" &&
        Number.isSafeInteger(savedLuckiestRoll.number) && savedLuckiestRoll.number >= 0 &&
        Number.isSafeInteger(savedLuckiestRoll.ep) && savedLuckiestRoll.ep >= 0 &&
        validRarities.has(savedLuckiestRoll.rarity)
        ? {
            number: savedLuckiestRoll.number,
            ep: savedLuckiestRoll.ep,
            rarity: savedLuckiestRoll.rarity
        }
        : null;
    const notableRollsByNumber = new Map();
    for (const roll of savedNotableRolls) {
        if (!roll || typeof roll !== "object" || roll.number === 1 ||
            !Number.isSafeInteger(roll.number) || roll.number < 0 ||
            !Number.isSafeInteger(roll.ep) || roll.ep < 0 ||
            !validRarities.has(roll.rarity)) continue;
        const current = notableRollsByNumber.get(roll.number);
        if (!current || roll.ep > current.ep) {
            notableRollsByNumber.set(roll.number, {
                number: roll.number,
                ep: roll.ep,
                rarity: roll.rarity
            });
        }
    }
    const notableRolls = [...notableRollsByNumber.values()]
        .sort((a, b) => b.ep - a.ep)
        .slice(0, 3);

    return {
        version: SAVE_VERSION,
        ep: currentEP,
        lifetimeEP,
        totalRolls: Number.isSafeInteger(totalRolls)
            ? Math.max(0, totalRolls)
            : defaults.totalRolls,
        upgrades: normalizedUpgrades,
        lastNumber: Number.isSafeInteger(lastNumber) && lastNumber >= 0
            ? lastNumber
            : null,
        luckiestRoll,
        notableRolls,
        gameWon: savedData.gameWon === true
    };
}

export function getRollCount(game) {
    // One starting roll, plus one for every Multi-roll level.
    return 1 + game.upgrades.multiRoll;
}
