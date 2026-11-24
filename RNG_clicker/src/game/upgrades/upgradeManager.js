import { UPGRADE_DEFINITIONS } from "./definitions.js";

export function getUpgradeStatus(game, upgradeId) {
    const definition = UPGRADE_DEFINITIONS[upgradeId];

    if (!definition) {
        throw new Error(`Unknown upgrade: ${upgradeId}`);
    }

    const level = game.upgrades[upgradeId] ?? 0;
    const cost = Math.ceil(
        definition.baseCost * definition.costMultiplier ** level
    );

    const reachedLevelLimit = level >= definition.maxLevel;
    const disabled = reachedLevelLimit || game.gameWon;

    return {
        ...definition,
        description: upgradeId === "luck"
            ? `Current luck: ×${getLuckMultiplier(game).toFixed(2)}. Each purchase adds 10% luck; roll multiple candidates and keep the highest-EP result.`
            : upgradeId === "epMultiplier"
                ? `Current EP multiplier: ×${getEPMultiplier(game).toFixed(2)}. Each purchase increases EP rewards by 10%.`
                : upgradeId === "animationSpeed"
                    ? `Current reroll timing: ×${getAnimationSpeedMultiplier(game).toFixed(2)}. Each purchase reduces roll cooldown by 10%.`
                    : definition.description,
        level,
        cost,
        disabled,
        affordable: game.ep >= cost
    };
}

export function purchaseUpgrade(game, upgradeId) {
    const status = getUpgradeStatus(game, upgradeId);

    if (status.disabled) {
        return { success: false, message: "That upgrade is already maxed out." };
    }

    if (!status.affordable) {
        return { success: false, message: "You don't have enough EP for that upgrade." };
    }

    game.ep -= status.cost;
    game.upgrades[upgradeId] += 1;

    return { success: true, message: `${status.name} purchased!` };
}

export function getAnimationSpeedMultiplier(game) {
    const level = game.upgrades.animationSpeed ?? 0;
    return 0.9 ** level;
}

export function getRevealDelayMs(game) {
    return Math.max(10, Math.round(100 * getAnimationSpeedMultiplier(game)));
}

export function getPostRollDelayMs(game) {
    return Math.max(100, Math.round(1000 * getAnimationSpeedMultiplier(game)));
}

export function getEPMultiplier(game) {
    const level = game.upgrades.epMultiplier ?? 0;
    return 1.1 ** level;
}

export function getLuckMultiplier(game) {
    const level = game.upgrades.luck ?? 0;
    return 1.1 ** level;
}

export function getLuckCandidateCount(game) {
    return Math.ceil(getLuckMultiplier(game));
}
