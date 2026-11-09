//src/state/gameState.js
import { SAVE_KEY } from "../config.js";
import {
    createDefaultGameState,
    normalizeGameState
} from "../state/gameState.js";

export function loadGame() {
    try {
        const rawSave = localStorage.getItem(SAVE_KEY);

        if (rawSave === null) {
            return {
                game: createDefaultGameState(),
                warning: null
            };
        }

        const parsedSave = JSON.parse(rawSave);

        return {
            game: normalizeGameState(parsedSave),
            warning: null
        };
    } catch (error) {
        console.error("Could not load the save:", error);

        return {
            game: createDefaultGameState(),
            warning: "The existing save could not be read. A fresh game was opened."
        };
    }
}

export function saveGame(game) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(game));
        return true;
    } catch (error) {
        console.error("Could not save the game:", error);
        return false;
    }
}
