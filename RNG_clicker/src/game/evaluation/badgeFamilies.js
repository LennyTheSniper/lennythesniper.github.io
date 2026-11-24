// RNGdle badge families organize related badges. Family membership alone does
// not make rewards exclusive; the scoring branches below encode exclusions.
const families = {
    "single-digit": ["exact-zero", "exact-one", "exact-two", "exact-three", "exact-four", "exact-five", "exact-six", "exact-seven", "exact-eight", "exact-nine", "single-digit"],
    "botanist": ["exact-botanist", "exact-hotbox", "exact-meaning", "botanist", "meaning-of-life"],
    "sixty-seven": ["exact-six-seven", "exact-brainrot", "6767", "six-seven"],
    "eighty-six": ["exact-eighty-six", "eighty-six"],
    "nice": ["exact-nice", "exact-very-very-nice", "very-nice", "nice"],
    "orientation": ["exact-orientation", "orientation"],
    "calendar": ["exact-calendar", "exact-groundhog-day", "always", "calendar"],
    "error": ["exact-not-found", "error-404"],
    "devil": ["exact-devil", "exact-infernal", "devil"],
    "jackpot": ["exact-jackpot", "exact-jackpot-six", "jackpot-five", "jackpot-four", "jackpot"],
    "emergency": ["exact-emergency", "exact-mayday", "emergency"],
    "leet": ["exact-leet", "leet"],
    "big-brother": ["exact-orwellian", "big-brother"],
    "hell": ["exact-hell", "hell"],
    "boob": ["exact-80085", "exact-boob", "58008", "80085", "8008"],
    "meaning": ["exact-universal-answer", "deeper-meaning"],
    "consecutive": ["four-consecutive-numbers", "four-consecutive-contains", "four-consecutive-scrambled", "three-consecutive-numbers", "three-consecutive-scrambled", "three-consecutive-contains", "two-consecutive-numbers", "consecutive-contains", "consecutive-nearby"],
    "progression": ["sequence-six", "cascade", "waterfall", "even-spacing", "crescendo", "even-spacing-absolute", "turtle", "sequence-four", "scramble", "metronome", "sequence-three", "mini-scramble"],
    "peak": ["mountain", "valley", "mesa", "canyon"],
    "monotonic": ["ascension", "decay", "steps", "slopes"],
    "bookends": ["paired-bookends", "bookends", "mirror-bookends"],
    "pairs": ["contiguous-three-pair", "framed-pair", "framed-double", "three-pair", "contiguous-two-pair", "two-pair", "contiguous-pair", "pair"],
    "of-a-kind": ["five-of-a-kind", "framed-quad", "framed-triple", "four-of-a-kind", "three-of-a-kind"],
    "contiguous-run": ["contiguous-sixes", "contiguous-fives", "contiguous-quads", "contiguous-trips"],
    "boat": ["contiguous-full-house", "full-house"],
    "duality": ["firefly", "duality"],
    "repeat": ["mini-echo", "rhyme"],
    "hills": ["hills", "dunes"],
    "hopscotch": ["double-hop", "hopscotch"],
    "palindrome": ["palindrome", "pocket-mirror"],
    "straight": ["royal-flush", "straight-flush", "straight"],
    "void-depth": ["eon", "semi-eon", "deep-void-5", "epoch", "semi-epoch", "deep-void-4", "millennium", "semi-millennium", "deep-void-3", "century", "semi-century", "deep-void", "clean"],
    "power": ["13th-power", "17th-power", "19th-power", "10th-power", "11th-power", "9th-power", "8th-power", "ouroboros", "7th-power", "6th-power", "5th-power", "4th-power", "3rd-power", "2nd-power", "perfect-square", "power-of-seven", "power-of-five", "power-of-three", "power-of-two", "6th-power"],
    "pi": ["pi", "pi-slice-5", "pi-slice-4", "pi-slice-3"],
    "e": ["eulers-number", "e-slice-5", "e-slice-4", "e-slice-3"],
    "tau": ["tau", "tau-slice-5", "tau-slice-4"],
    "ultimeme": ["funny-number", "funny-numbers"]
};

export const BADGE_FAMILY_BY_ID = new Map(
    Object.entries(families).flatMap(([family, ids]) => ids.map(id => [id, family]))
);

// The calculator groups badges into families for display, but only applies
// mutual exclusion in its explicit if/else scoring branches. Keep those
// scoring groups separate from the full family taxonomy above.
const exclusiveFamilies = {
    "single-digit": families["single-digit"], botanist: families.botanist,
    "sixty-seven": families["sixty-seven"], "eighty-six": families["eighty-six"],
    nice: families.nice, orientation: families.orientation, calendar: families.calendar,
    error: families.error, devil: families.devil, jackpot: families.jackpot,
    emergency: families.emergency, leet: families.leet, "big-brother": families["big-brother"],
    hell: families.hell, boob: families.boob, meaning: families.meaning,
    consecutive: families.consecutive, progression: families.progression, peak: families.peak,
    monotonic: families.monotonic, bookends: families.bookends, pairs: families.pairs,
    "of-a-kind": families["of-a-kind"], "contiguous-run": families["contiguous-run"],
    boat: families.boat, duality: families.duality, repeat: families.repeat,
    hills: families.hills, hopscotch: families.hopscotch, palindrome: families.palindrome,
    straight: families.straight,
    "void-depth": ["semi-eon", "eon", "deep-void-5", "semi-epoch", "epoch", "deep-void-4", "semi-millennium", "millennium", "deep-void-3", "semi-century", "century", "deep-void", "clean"],
    "nine-suffix": ["quint-nine", "quad-nine", "triple-nine", "double-nine"],
    // These powers share one else-if chain. The four base-power badges and
    // Factorial are checked separately by the original calculator and stack.
    "integer-power": ["13th-power", "17th-power", "19th-power", "10th-power", "11th-power", "9th-power", "8th-power", "ouroboros", "7th-power", "6th-power", "5th-power", "4th-power", "3rd-power", "2nd-power", "perfect-square"],
    pi: families.pi, e: families.e, tau: families.tau, ultimeme: families.ultimeme
};

export const EXCLUSIVE_BADGE_GROUP_BY_ID = new Map(
    Object.entries(exclusiveFamilies).flatMap(([group, ids]) => ids.map(id => [id, group]))
);
export const EXCLUSIVE_BADGE_PRIORITY_BY_ID = new Map(
    Object.values(exclusiveFamilies).flatMap(ids => ids.map((id, priority) => [id, priority]))
);
