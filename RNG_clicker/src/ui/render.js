//src/ui/render.js
import { RECENT_ROLLS_TO_SHOW } from "../config.js";
import { getRollCount } from "../state/gameState.js";
import { getUpgradeStatus } from "../game/upgrades/upgradeManager.js";
import { UPGRADE_DEFINITIONS } from "../game/upgrades/definitions.js";

const formatNumber = (value) => new Intl.NumberFormat().format(value);

export function renderGame(
    game,
    recentRolls,
    message,
    onBuyUpgrade,
    isRolling = false,
    displayedNumbers = undefined
) {
    document.getElementById("ep-value").textContent =
        `${formatNumber(game.ep)} EP`;

    document.getElementById("rolls-value").textContent =
        formatNumber(game.totalRolls);

    document.getElementById("max-value").textContent =
        formatNumber(game.maxNumber);

    document.getElementById("batch-value").textContent =
        formatNumber(getRollCount(game));

    const rollButton = document.getElementById("roll-button");

    rollButton.disabled = game.gameWon || isRolling;
    rollButton.textContent = game.gameWon
        ? "FOUND 1 — GAME COMPLETE"
        : getRollCount(game) === 1
            ? "ROLL"
            : `ROLL ${formatNumber(getRollCount(game))} NUMBERS`;

    // Display one or multiple numbers.
    const numberDisplay = document.getElementById("last-number");
    numberDisplay.replaceChildren();

    const numbersToShow = Array.isArray(displayedNumbers)
        ? displayedNumbers
        : game.lastNumber === null
            ? []
            : [formatNumber(game.lastNumber)];

    if (numbersToShow.length === 0) {
        numberDisplay.textContent = "?";
    } else {
        for (const number of numbersToShow) {
            const chip = document.createElement("span");
            chip.className = "number-chip";
            chip.textContent = number === "" ? " " : number;
            numberDisplay.appendChild(chip);
        }
    }

    document.getElementById("game-message").textContent = message;

    // Recent rolls.
    const recentList = document.getElementById("recent-rolls");
    recentList.replaceChildren();

    const visibleRolls = recentRolls
        .slice(-RECENT_ROLLS_TO_SHOW)
        .reverse();

    if (visibleRolls.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty-state";
        empty.textContent = "Your rolls will appear here.";
        recentList.appendChild(empty);
    } else {
        for (const result of visibleRolls) {
            const item = document.createElement("li");
            item.className = "recent-roll-item";

            const number = document.createElement("span");
            number.className = "recent-roll-number";
            number.textContent = formatNumber(result.number);

            const detail = document.createElement("span");
            detail.className = "recent-roll-detail";

            const topRules = [...result.rules]
                .sort((a, b) => b.ep - a.ep)
                .slice(0, 5);
            const remainingRules = result.rules.length - topRules.length;
            const ruleNames = topRules.map((rule) => rule.name).join(", ") +
                (remainingRules > 0 ? ` (and ${remainingRules} more...)` : "");

            detail.textContent =
                `+${formatNumber(result.ep)} EP` +
                (ruleNames
                    ? ` · ${ruleNames}`
                    : " · No rules matched");

            item.append(number, detail);
            recentList.appendChild(item);
        }
    }

    // Upgrades.
    const upgradesList = document.getElementById("upgrades-list");
    upgradesList.replaceChildren();

    for (const upgradeId of Object.keys(UPGRADE_DEFINITIONS)) {
        const upgrade = getUpgradeStatus(game, upgradeId);

        const card = document.createElement("article");
        card.className = "upgrade-card";

        const title = document.createElement("h3");
        title.textContent = upgrade.name;

        const description = document.createElement("p");
        description.textContent = upgrade.description;

        const level = document.createElement("span");
        level.className = "upgrade-meta";
        level.textContent =
            `Level ${upgrade.level} / ${upgrade.maxLevel}`;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "upgrade-button";

        button.disabled =
            isRolling || upgrade.disabled || !upgrade.affordable;

        button.textContent = upgrade.disabled
            ? "MAXED OUT"
            : `Purchase · ${formatNumber(upgrade.cost)} EP`;

        button.addEventListener("click", () => {
            onBuyUpgrade(upgradeId);
        });

        card.append(title, description, level, button);
        upgradesList.appendChild(card);
    }

    // Reset button cannot be used halfway through a batch.
    const resetButton = document.getElementById("reset-button");

    if (resetButton) {
        resetButton.disabled = isRolling;
    }
}
