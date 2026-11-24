//src/main.js
import { rollNumber } from "./game/roll.js";
import { evaluateNumber } from "./game/evaluation/evaluateNumber.js";
import { getRarityTier } from "./game/evaluation/rarity.js";
import { getRollCount } from "./state/gameState.js";
import { createDefaultGameState } from "./state/gameState.js";
import { loadGame, saveGame } from "./storage/saveManager.js";
import {
    getEPMultiplier,
    getAnimationSpeedMultiplier,
    getLuckCandidateCount,
    getLuckMultiplier,
    getPostRollDelayMs,
    getRevealDelayMs,
    purchaseUpgrade
} from "./game/upgrades/upgradeManager.js";
import { renderGame } from "./ui/render.js";

const { game, warning } = loadGame();

let recentRolls = [];
let lastDisplayedBatch = [];
let isRolling = false;
let message = warning ?? "Your progress is saved in this browser.";

const delay = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

function persistGame() {
    const saved = saveGame(game);

    if (!saved) {
        message =
            "The game could not save. Your browser storage may be unavailable or full.";
    }
}

function render(isCurrentlyRolling = false, displayedNumbers = null) {
    const numbersToDisplay = displayedNumbers !== null
        ? displayedNumbers
        : lastDisplayedBatch.length > 0
            ? lastDisplayedBatch
            : game.lastNumber === null
                ? []
                : [{
                    number: game.lastNumber,
                    rarity: evaluateNumber(game.lastNumber).rarity
                }];

    renderGame(
        game,
        recentRolls,
        message,
        handleBuyUpgrade,
        isCurrentlyRolling,
        numbersToDisplay
    );
}

// Reveal every number in the batch together.
async function revealBatch(batch, revealDelayMs) {
    const formattedNumbers = batch.map((result) =>
        result.number.toLocaleString()
    );

    const revealed = formattedNumbers.map(() => "");

    const longestNumber = Math.max(
        ...formattedNumbers.map((number) => number.length)
    );

    for (let characterIndex = 0;
        characterIndex < longestNumber;
        characterIndex++) {

        for (let numberIndex = 0;
            numberIndex < formattedNumbers.length;
            numberIndex++) {

            const number = formattedNumbers[numberIndex];

            if (characterIndex < number.length) {
                revealed[numberIndex] += number[characterIndex];
            }
        }

        render(true, batch.map((result, index) => ({
            number: result.number,
            text: revealed[index],
            rarity: result.rarity
        })));

        await delay(revealDelayMs);
    }
}

async function handleRoll() {
    if (game.gameWon) {
        await handleShareResults();
        return;
    }
    if (isRolling) return;

    isRolling = true;
    message = "Generating your batch...";
    render(true, []);

    try {
        const rollsToMake = getRollCount(game);

        // IMPORTANT: Generate the entire batch immediately.
        // No animation or waiting happens until every number exists.
        const luckCandidates = getLuckCandidateCount(game);
        const batch = Array.from({ length: rollsToMake }, () => {
            let bestResult = null;
            for (let candidate = 0; candidate < luckCandidates; candidate++) {
                const number = rollNumber();
                const result = evaluateNumber(number);
                if (bestResult === null || result.ep > bestResult.ep) bestResult = result;
            }

            const epMultiplier = getEPMultiplier(game);
            const awardedEP = Math.round(bestResult.ep * epMultiplier);
            return {
                ...bestResult,
                ep: awardedEP,
                rarity: bestResult.rarity === "unique"
                    ? "unique"
                    : getRarityTier(awardedEP, epMultiplier)
            };
        });
        const orderedBatch = [...batch].sort((a, b) => b.ep - a.ep);

        // Reveal all numbers together.
        message = `Revealing ${batch.length} number(s)...`;
        await revealBatch(orderedBatch, getRevealDelayMs(game));

        // Award everything after the complete batch is revealed.
        const batchEP = batch.reduce(
            (sum, result) => sum + result.ep,
            0
        );

        game.totalRolls += batch.length;
        game.ep += batchEP;
        game.lifetimeEP += batchEP;
        game.lastNumber = batch[batch.length - 1].number;
        for (const result of batch) {
            if (game.luckiestRoll === null || result.ep > game.luckiestRoll.ep) {
                game.luckiestRoll = {
                    number: result.number,
                    ep: result.ep,
                    rarity: result.rarity
                };
            }
            if (result.number !== 1) {
                const bestForNumber = game.notableRolls.find(roll => roll.number === result.number);
                if (!bestForNumber || result.ep > bestForNumber.ep) {
                    game.notableRolls = [
                        ...game.notableRolls.filter(roll => roll.number !== result.number),
                        { number: result.number, ep: result.ep, rarity: result.rarity }
                    ].sort((a, b) => b.ep - a.ep).slice(0, 3);
                }
            }
        }

        recentRolls = [
            ...recentRolls,
            ...batch
        ].slice(-20);

        lastDisplayedBatch = orderedBatch.map((result) => ({
            number: result.number,
            rarity: result.rarity
        }));

        const foundOne = batch.some(
            (result) => result.number === 1
        );

        if (foundOne) {
            game.gameWon = true;
            message =
                `You found 1! Your batch earned ${batchEP.toLocaleString()} EP. ` +
                `Game complete after ${game.totalRolls.toLocaleString()} rolls!`;
        } else {
            message =
                `You rolled ${batch.length} numbers and earned ` +
                `${batchEP.toLocaleString()} EP.`;
        }

        persistGame();

        // Show the complete batch and its reward.
        render(true, lastDisplayedBatch);

        await delay(getPostRollDelayMs(game));

    } catch (error) {
        console.error("The roll failed:", error);
        message = error.message ||
            "Something went wrong while rolling.";

    } finally {
        isRolling = false;
        render();
    }
}

async function handleShareResults() {
    const notableRollLines = game.notableRolls.length > 0
        ? game.notableRolls.map(roll => `• ${roll.number.toLocaleString()} - ${roll.ep.toLocaleString()} EP`)
        : ["No other standout rolls recorded yet."];
    const shareText = [
        "🎲 RNG Clicker - Victory!",
        `🏁 Found 1 after ${game.totalRolls.toLocaleString()} rolls`,
        `✨ Lifetime EP: ${game.lifetimeEP.toLocaleString()}`,
        "🌟 Best rolls:",
        ...notableRollLines,
        `⚡ Upgrades: ${getRollCount(game)} / click · Luck x${getLuckMultiplier(game).toFixed(2)} · EP x${getEPMultiplier(game).toFixed(2)} · Roll speed x${getAnimationSpeedMultiplier(game).toFixed(2)}`,
        "Play: https://lennythesniper.github.io/RNG_clicker/"
    ].join("\n");

    try {
        let copied = false;
        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(shareText);
                copied = true;
            } catch {
                // Fall back to the selection-based copy path below.
            }
        }
        if (!copied) {
            const textArea = document.createElement("textarea");
            textArea.value = shareText;
            textArea.setAttribute("readonly", "");
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            try {
                copied = document.execCommand("copy");
            } finally {
                textArea.remove();
            }
            if (!copied) throw new Error("Clipboard copy was rejected.");
        }
        message = "Victory summary copied to your clipboard!";
    } catch (error) {
        console.error("Could not copy the victory summary:", error);
        message = "Could not copy the share text. Check clipboard permissions and try again.";
    }
    render();
}

function handleBuyUpgrade(upgradeId) {
    if (game.gameWon || isRolling) return;

    const result = purchaseUpgrade(game, upgradeId);
    message = result.message;

    if (result.success) {
        persistGame();
    }

    render();
}

function handleReset() {
    if (isRolling) return;

    const confirmed = window.confirm(
        "Are you sure you want to reset Number Hunter?\n\n" +
        "This will permanently erase all your EP, upgrades, " +
        "roll history, and progress."
    );

    if (!confirmed) return;

    // Restore every game property to its starting value.
    Object.assign(game, createDefaultGameState());

    // Clear the session's recent roll history and displayed batch.
    recentRolls = [];
    lastDisplayedBatch = [];

    message = "Game successfully reset. Good luck finding 1!";

    persistGame();
    render();
}

// Connect buttons.
document
    .getElementById("roll-button")
    .addEventListener("click", handleRoll);

document
    .getElementById("reset-button")
    .addEventListener("click", handleReset);

// Save progress when the page is hidden or closed.
window.addEventListener("pagehide", () => {
    saveGame(game);
});

// Initial display.
render();
