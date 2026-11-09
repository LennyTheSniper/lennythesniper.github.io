import { RULES } from "./rules/index.js";

export function evaluateNumber(number) {
    const matchedRules = [];

    for (const rule of RULES) {
        const match = rule(number);

        if (match !== null) {
            matchedRules.push(match);
        }
    }

    const totalEP = matchedRules.reduce((sum, match) => sum + match.ep, 0);

    return {
        number,
        ep: totalEP,
        rules: matchedRules
    };
}
