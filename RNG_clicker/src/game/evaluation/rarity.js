const RARITY_THRESHOLDS = [
    [2_087, "trash"],
    [5_802, "common"],
    [10_074, "uncommon"],
    [22_293, "rare"],
    [35_469, "epic"],
    [162_292, "anomaly"],
    [1_054_023, "mythic"]
];

export function getRarityTier(ep, thresholdMultiplier = 1) {
    for (const [threshold, tier] of RARITY_THRESHOLDS) {
        if (ep < threshold * thresholdMultiplier) return tier;
    }
    return "mythic";
}
