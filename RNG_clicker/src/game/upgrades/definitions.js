// These are starter values for testing the upgrade flow, not final game balance.
export const UPGRADE_DEFINITIONS = {
    multiRoll: {
        id: "multiRoll",
        name: "Multi-roll",
        description: "Roll one additional number each time you press the main button.",
        baseCost: 50_000,
        costMultiplier: 2.1,
        maxLevel: 19
    },
    luck: {
        id: "luck",
        name: "Luck",
        description: "Current luck: ×1.00. Each purchase adds 10% luck; roll multiple candidates and keep the highest-EP result.",
        baseCost: 100_000,
        costMultiplier: 1.55,
        maxLevel: 30
    },
    animationSpeed: {
        id: "animationSpeed",
        name: "Faster rerolls",
        description: "Reduce reroll timing of your next roll by 10% per level.",
        baseCost: 75_000,
        costMultiplier: 1.85,
        maxLevel: 25
    },
    epMultiplier: {
        id: "epMultiplier",
        name: "EP multiplier",
        description: "Multiply EP earned per roll by +10% per level.",
        baseCost: 150_000,
        costMultiplier: 1.8,
        maxLevel: 25
    }
};
