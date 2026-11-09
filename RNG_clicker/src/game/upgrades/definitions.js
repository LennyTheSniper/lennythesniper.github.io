// These are starter values for testing the upgrade flow, not final game balance.
export const UPGRADE_DEFINITIONS = {
    multiRoll: {
        id: "multiRoll",
        name: "Multi-roll",
        description: "Roll one additional number each time you press the main button.",
        baseCost: 25,
        costMultiplier: 1.8,
        maxLevel: 10
    },
    rangeReduction: {
        id: "rangeReduction",
        name: "Number compression",
        description: "Reduce the maximum possible roll by 10% per purchase, up to 40 levels.",
        baseCost: 100,
        costMultiplier: 1.65,
        maxLevel: 40
    }
};
