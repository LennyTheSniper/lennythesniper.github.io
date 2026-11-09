import { MINIMUM_MAX_NUMBER } from "../../config.js";
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
    const rangeAlreadyAtMinimum =
        upgradeId === "rangeReduction" && game.maxNumber <= MINIMUM_MAX_NUMBER;
    const disabled = reachedLevelLimit || rangeAlreadyAtMinimum || game.gameWon;

    return {
        ...definition,
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

    if (upgradeId === "rangeReduction") {
        game.maxNumber = Math.max(
            MINIMUM_MAX_NUMBER,
            Math.floor(game.maxNumber * 0.9)
        );
    }

    return { success: true, message: `${status.name} purchased!` };
}
