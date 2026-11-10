//src/main.js
import { rollNumber } from "./game/roll.js";
import { evaluateNumber } from "./game/evaluation/evaluateNumber.js";
import { getRollCount } from "./state/gameState.js";
import { createDefaultGameState } from "./state/gameState.js";
import { loadGame, saveGame } from "./storage/saveManager.js";
import { purchaseUpgrade } from "./game/upgrades/upgradeManager.js";
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
        : lastDisplayedBatch;

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
async function revealBatch(batch) {
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

        render(true, [...revealed]);

        await delay(100);
    }
}

async function handleRoll() {
    if (game.gameWon || isRolling) return;

    isRolling = true;
    message = "Generating your batch...";
    render(true, []);

    try {
        const rollsToMake = getRollCount(game);

        // IMPORTANT: Generate the entire batch immediately.
        // No animation or waiting happens until every number exists.
        const batch = Array.from(
            { length: rollsToMake },
            () => {
                const number = rollNumber(game.maxNumber);

                return {
                    number,
                    ...evaluateNumber(number)
                };
            }
        );

        // Reveal all numbers together.
        message = `Revealing ${batch.length} number(s)...`;
        await revealBatch(batch);

        // Award everything after the complete batch is revealed.
        const batchEP = batch.reduce(
            (sum, result) => sum + result.ep,
            0
        );

        game.totalRolls += batch.length;
        game.ep += batchEP;
        game.lastNumber = batch[batch.length - 1].number;

        recentRolls = [
            ...recentRolls,
            ...batch
        ].slice(-20);

        lastDisplayedBatch = batch.map((result) =>
            result.number.toLocaleString()
        );

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

        await delay(1000);

    } catch (error) {
        console.error("The roll failed:", error);
        message = error.message ||
            "Something went wrong while rolling.";

    } finally {
        isRolling = false;
        render();
    }
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
