import { RULES } from "./rules/index.js";
import { BADGE_FAMILY_BY_ID, EXCLUSIVE_BADGE_GROUP_BY_ID, EXCLUSIVE_BADGE_PRIORITY_BY_ID } from "./badgeFamilies.js";
import { getRarityTier } from "./rarity.js";

export function evaluateNumber(number) {
    const matchedRules = [];

    for (const rule of RULES) {
        const match = rule(number);

        if (match !== null) {
            matchedRules.push({ ...match, family: BADGE_FAMILY_BY_ID.get(match.id) || null });
        }
    }

    const familyWinners = new Map();
    for (const match of matchedRules) {
        const group = EXCLUSIVE_BADGE_GROUP_BY_ID.get(match.id);
        if (!group) continue;
        const current = familyWinners.get(group);
        if (!current || EXCLUSIVE_BADGE_PRIORITY_BY_ID.get(match.id) < EXCLUSIVE_BADGE_PRIORITY_BY_ID.get(current.id)) familyWinners.set(group, match);
    }

    const awardedRules = matchedRules.filter(match => {
        const group = EXCLUSIVE_BADGE_GROUP_BY_ID.get(match.id);
        return !group || familyWinners.get(group) === match;
    });

    // The source calculator explicitly grants Jackpot on 17776 as a bonus.
    if (number === 17776 && !awardedRules.some(match => match.id === "jackpot")) {
        const jackpot = matchedRules.find(match => match.id === "jackpot") ||
            { id: "jackpot", name: "Jackpot", ep: 27027, explanation: "Special bonus for the exact roll 17776.", family: "jackpot" };
        awardedRules.push(jackpot);
    }
    const totalEP = awardedRules.reduce((sum, match) => sum + match.ep, 0);
    const rarity = awardedRules.some(match => match.ep >= 100_000_000)
        ? "unique"
        : getRarityTier(totalEP);

    return {
        number,
        ep: totalEP,
        rarity,
        rules: awardedRules
    };
}
