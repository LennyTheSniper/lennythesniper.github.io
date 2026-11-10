// RNGdle-inspired digit and number traits. Keep these functions pure: they are
// evaluated independently and each match contributes its configured EP.
const makeRule = (id, name, ep, explanation, test) => (number) => {
    if (!test(number)) return null;
    return { id, name, ep, explanation };
};

const digitsOf = (n) => String(Math.abs(n)).split("").map(Number);
const textOf = (n) => String(Math.abs(n));
const countsOf = (ds) => ds.reduce((m, d) => m.set(d, (m.get(d) || 0) + 1), new Map());
const adjacent = (s, part) => s.includes(part);
const hasRun = (ds, size = 3) => ds.some((_, i) => i + size <= ds.length &&
    ds.slice(i, i + size).every((_, j, a) => j === 0 || Math.abs(a[j] - a[j - 1]) === 1));
const slopes = (ds) => ds.slice(1).map((d, i) => Math.sign(d - ds[i]));
const strictHill = (ds) => ds.length >= 4 && slopes(ds).every((v, i, a) => v !== 0 && (i === 0 || v !== a[i - 1]));
const strictPeak = (ds, invert = false) => {
    const s = slopes(invert ? ds.map(d => -d) : ds);
    const peak = s.indexOf(-1);
    return peak > 0 && s.slice(0, peak).every(v => v === 1) && s.slice(peak).every(v => v === -1);
};
const relaxedPeak = (ds, invert = false) => {
    const s = slopes(invert ? ds.map(d => -d) : ds);
    const peak = s.indexOf(-1);
    return peak > 0 && s.slice(0, peak).every(v => v >= 0) && s.slice(peak).every(v => v <= 0) &&
        s.slice(0, peak).some(v => v === 1) && s.slice(peak).some(v => v === -1);
};
const isEquation = s => {
    const evaluateSide = (digits, ops) => {
        let sum = 0, term = Number(digits[0]), sign = 1;
        for (let i=0;i<ops.length;i++) {
            const value=Number(digits[i+1]), op=ops[i];
            if(op==="*") term*=value;
            else if(op==="/") { if(value===0)return NaN; term/=value; }
            else { sum+=sign*term; term=value; sign=op==="+"?1:-1; }
        }
        return sum+sign*term;
    };
    const choices=["+","-","*","/"];
    for(let equalAt=0;equalAt<s.length-1;equalAt++) {
        const ops=Array(s.length-1).fill("=");
        const assign=(i)=>{
            if(i===ops.length) {
                const lhs=evaluateSide(s.slice(0,equalAt+1),ops.slice(0,equalAt));
                const rhs=evaluateSide(s.slice(equalAt+1),ops.slice(equalAt+1));
                return Number.isFinite(lhs)&&Number.isFinite(rhs)&&Math.abs(lhs-rhs)<1e-10;
            }
            if(i===equalAt)return assign(i+1);
            for(const op of choices){ops[i]=op;if(assign(i+1))return true;}
            return false;
        };
        if(assign(0))return true;
    }
    return false;
};
const hasConsecutivePair = (s, nearby) => {
    for(let firstStart=0;firstStart<s.length;firstStart++) {
        for(let firstEnd=firstStart+1;firstEnd<=s.length;firstEnd++) {
            const first=s.slice(firstStart,firstEnd);
            if(first.length>1&&first[0]==="0")continue;
            const secondStart=firstEnd+(nearby?1:0);
            for(let secondEnd=secondStart+1;secondEnd<=s.length;secondEnd++) {
                const second=s.slice(secondStart,secondEnd);
                if(second.length>1&&second[0]==="0")continue;
                if((first.length>1||second.length>1)&&Math.abs(Number(first)-Number(second))===1)return true;
            }
        }
    }
    return false;
};
const rule = (id, name, ep, explanation, test) => makeRule(id, name, ep, explanation, test);
const EP = {
    hills:733, "three-of-a-kind":724, "lucky-seven-divisible":700, heterogeneous:593, "mini-scramble":579, "gap-one":529,
    "two-pair":377, dunes:364, hopscotch:312, ghost:309, quartet:290, element:282, grounded:250, "contiguous-pair":249,
    "lucky-seven":213, liftoff:200, void:167, neighbors:161, pair:120, "six-digits":111,
    "four-of-a-kind":8436, equation:7720, "low-ball":6400, mountain:5885, "double-hop":5321, "high-roller":5120,
    valley:4199, "contiguous-two-pair":3957, "mini-echo":3704, alternator:2845, flush:2845, "contiguous-trips":2784,
    "deep-void":2784, feather:2667, blackjack:2521, "full-house":2397, "pocket-mirror":2124, "snake-eyes":2121,
    nice:2024, "meaning-of-life":2024, "six-seven":2024, "eighty-six":2024, balanced:1959, rhyme:1872,
    "sequence-three":1716, "consecutive-contains":1659, "consecutive-nearby":1575, mesa:1568, prime:1274, trinity:1265,
    dozen:1200, canyon:1184, "five-digits":1111, eleven:1100, harshad:1048, clean:1000, "semi-clean":1000,
    equilibrium:1000, sandwich:1000,
    "2nd-power":99900, "even-spacing-absolute":90992, firefly:82237,
    "two-consecutive-numbers":50505, palindrome:50025, "contiguous-quads":37023,
    "deep-void-3":37023, turtle:36049, "secret-agent":34614, heavy:33300,
    "contiguous-full-house":30111, jackpot:27027, devil:27027, "sequence-four":25907,
    "error-404":25132, orientation:25132, botanist:25006, emergency:25006,
    "pi-slice-3":25006, "e-slice-3":25006, calendar:25006, "divisible-by-three":24414,
    scramble:22722, duality:21654, steps:20202, metronome:17784, "framed-double":15242,
    slopes:12582, "paired-bookends":11122, "four-digits":11111, "three-pair":10288,
    bookends:10010, "mirror-bookends":10010, century:10000, "double-nine":10000,
    "quarter-century":10000, "semi-century":10000, "three-quarter-century":10000,
    "3rd-power":990100, "even-spacing":862070, "three-consecutive-numbers":555556,
    "contiguous-fives":552487, "deep-void-4":552487, strobogrammatic:502513,
    straight:454546, "jackpot-four":357143, "very-nice":334448,
    "deeper-meaning":334448, "6767":334448, leet:333334, hell:333334, "8008":333334,
    "big-brother":333334, "pi-slice-4":333334, "e-slice-4":333334, "tau-slice-4":333334,
    "three-consecutive-scrambled":277778, zipper:246914, ascension:219298,
    crescendo:208334, "five-of-a-kind":198020, "three-consecutive-contains":157978,
    "contiguous-three-pair":154321, "framed-pair":137174, "framed-triple":137174,
    "framed-quad":137174, decay:119474, "three-digits":111111, echo:100100,
    millennium:100000, pronic:100000, "triple-nine":100000, "semi-millennium":100000,
    colossal:100000
};
const evenRule = rule("even", "Even number", 200, "Divisible by 2.", n => n % 2 === 0);
const oddRule = rule("odd", "Odd number", 200, "Not divisible by 2.", n => n % 2 !== 0);
const primeRule = rule("prime", "Prime number", EP.prime, "Has exactly two positive divisors.", n => {
    if (n < 2) return false;
    for (let divisor = 2; divisor <= Math.sqrt(n); divisor++) {
        if (n % divisor === 0) return false;
    }
    return true;
});
const palindromeRule = rule("palindrome", "Palindrome", 50025, "Reads the same forwards and backwards.", n => {
    const digits = String(n);
    return digits === digits.split("").reverse().join("");
});
const perfectSquareRule = rule("perfect-square", "Perfect square", 4, "Is the square of an integer.", n => Number.isInteger(Math.sqrt(n)));
const hasCount = (n, d, amount) => (countsOf(digitsOf(n)).get(d) || 0) === amount;
const hasSubstring = (n, part) => adjacent(textOf(n), part);
const digitSum = (n) => digitsOf(n).reduce((a, b) => a + b, 0);
const exactlyKind = (n, size) => [...countsOf(digitsOf(n)).values()].includes(size);
const allSplits = (s, minParts, maxParts = s.length) => {
    const results = [];
    const visit = (start, parts) => {
        if (start === s.length) {
            if (parts.length >= minParts && parts.length <= maxParts) results.push(parts);
            return;
        }
        if (parts.length >= maxParts) return;
        for (let end = start + 1; end <= s.length; end++) visit(end, [...parts, Number(s.slice(start, end))]);
    };
    visit(0, []);
    return results;
};
const hasConsecutiveChunks = (s, count, ordered = true) => {
    for (let start = 0; start < s.length; start++) {
        for (let end = start + count; end <= s.length; end++) {
            const segment = s.slice(start, end);
            const visit = (at, chunks) => {
                if (at === segment.length) {
                    if (chunks.length !== count || chunks.some(x=>x.length>1&&x[0]==="0")) return false;
                    const parts=chunks.map(Number), sorted=[...parts].sort((a,b)=>a-b);
                    return sorted.every((v,i)=>i===0||v===sorted[i-1]+1) &&
                        (!ordered || parts.every((v,i)=>i===0||v===parts[i-1]+1));
                }
                if (chunks.length >= count) return false;
                for(let cut=at+1;cut<=segment.length;cut++) if(visit(cut,[...chunks,segment.slice(at,cut)])) return true;
                return false;
            };
            if (visit(0,[])) return true;
        }
    }
    return false;
};
const hasEqualAbsoluteSpacing = ds => ds.length >= 2 && ds.slice(1).every((d, i) => Math.abs(d - ds[i]) === Math.abs(ds[1] - ds[0]));
const isCube = n => { const r = Math.round(Math.cbrt(n)); return r ** 3 === n; };
const isPronic = n => { const r = Math.floor(Math.sqrt(n)); return r * (r + 1) === n || (r + 1) * (r + 2) === n; };
const hasRunOf = (s, pattern) => s.includes(pattern);

export const hillsRule = rule("hills", "Hills", EP["hills"], "Digits strictly alternate up and down (4+ digits).", n => strictHill(digitsOf(n)));
export const threeKindRule = rule("three-of-a-kind", "Three of a Kind", EP["three-of-a-kind"], "Exactly three of one digit.", n => hasCount(n, [...countsOf(digitsOf(n))].find(([, c]) => c === 3)?.[0], 3));
export const luckySevenDivisibleRule = rule("lucky-seven-divisible", "Lucky Seven (Divisible)", EP["lucky-seven-divisible"], "Divisible by 7.", n => n % 7 === 0);
export const heterogeneousRule = rule("heterogeneous", "Heterogeneous", EP["heterogeneous"], "No repeated digits.", n => countsOf(digitsOf(n)).size === digitsOf(n).length);
export const miniScrambleRule = rule("mini-scramble", "Mini Scramble", EP["mini-scramble"], "At least three digits form a consecutive run when sorted.", n => { const d=digitsOf(n).sort((a,b)=>a-b);return d.some((v,i)=>i+2<d.length&&d[i+1]===v+1&&d[i+2]===v+2); });
export const gapOneRule = rule("gap-one", "Gap One", EP["gap-one"], "First and last digits differ by exactly 1.", n => Math.abs(digitsOf(n)[0]-digitsOf(n).at(-1))===1);
export const twoPairRule = rule("two-pair", "Two Pair", EP["two-pair"], "Two digits each appear at least twice.", n => [...countsOf(digitsOf(n)).values()].filter(c=>c>=2).length>=2);
export const dunesRule = rule("dunes", "Dunes", EP["dunes"], "Ignoring flats, non-flat slopes alternate direction.", n => { const s=slopes(digitsOf(n)).filter(Boolean); return s.length>=1 && s.every((v,i)=>i===0||v!==s[i-1]); });
export const hopscotchRule = rule("hopscotch", "Hopscotch", EP["hopscotch"], "A digit appears at every other position, twice.", n => { const d=digitsOf(n); return d.length>=3 && d.some((v,i)=>i+2<d.length&&d[i+2]===v); });
export const ghostRule = rule("ghost", "Ghost", EP["ghost"], "Contains exactly one 0.", n => hasCount(n,0,1));
export const quartetRule = rule("quartet", "Quartet", EP["quartet"], "Exactly four different digits.", n => countsOf(digitsOf(n)).size===4);
export const singleDigitRules = [1,2,6,8,3,4,5,7,9].map(d => rule(`element-${d}`, ({1:"Hydrogen",2:"Helium",6:"Carbon",8:"Oxygen",3:"Lithium",4:"Beryllium",5:"Boron",7:"Nitrogen",9:"Fluorine"})[d]+` (${d})`, EP.element, `Contains exactly one ${d}.`, n=>hasCount(n,d,1)));
export const groundedRule = rule("grounded", "Grounded", EP["grounded"], "First digit smaller than the last.", n=>digitsOf(n)[0]<digitsOf(n).at(-1));
export const contiguousPairRule = rule("contiguous-pair", "Contiguous Pair", EP["contiguous-pair"], "Two identical neighbouring digits.", n=>/(\d)\1/.test(textOf(n)));
export const luckySevenRule = rule("lucky-seven", "Lucky Seven", EP["lucky-seven"], "Contains the digit 7.", n=>hasSubstring(n,"7"));
export const voidRule = rule("void", "Void", EP["void"], "Contains no 0 at all.", n=>!hasSubstring(n,"0"));
export const neighborsRule = rule("neighbors", "Neighbors", EP["neighbors"], "Two adjacent digits differ by exactly 1.", n=>digitsOf(n).some((d,i,a)=>i>0&&Math.abs(d-a[i-1])===1));
export const pairRule = rule("pair", "Pair", EP["pair"], "Any digit appears at least twice.", n=>[...countsOf(digitsOf(n)).values()].some(c=>c>=2));
export const sixDigitsRule = rule("six-digits", "Six Digits", EP["six-digits"], "A full six-digit roll.", n=>textOf(n).length===6);

export const fourKindRule = rule("four-of-a-kind", "Four of a Kind", EP["four-of-a-kind"], "Four identical digits anywhere.", n=>[...countsOf(digitsOf(n)).values()].some(c=>c>=4));
export const equationRule = rule("equation", "Equation", EP["equation"], "Inserting +, −, ×, ÷ and = between digits forms a true equation using operator precedence.", n => isEquation(textOf(n)));
export const lowBallRule = rule("low-ball", "Low Ball", EP["low-ball"], "Every digit is 0–4.", n=>digitsOf(n).every(d=>d<=4));
export const mountainRule = rule("mountain", "Mountain", EP["mountain"], "Digits climb to a peak, then descend.", n=>strictPeak(digitsOf(n)));
export const doubleHopRule = rule("double-hop", "Double Hop", EP["double-hop"], "Contains a pattern such as 1x1x1, where x is any digit.", n=>{const d=digitsOf(n);return d.some((v,i)=>i+4<d.length&&d[i+2]===v&&d[i+4]===v);});
export const highRollerRule = rule("high-roller", "High Roller", EP["high-roller"], "Every digit is 5–9.", n=>digitsOf(n).every(d=>d>=5));
export const valleyRule = rule("valley", "Valley", EP["valley"], "Digits fall to a floor, then climb.", n=>strictPeak(digitsOf(n),true));
export const contiguousTwoPairRule = rule("contiguous-two-pair", "Contiguous Two Pair", EP["contiguous-two-pair"], "Contains two adjacent contiguous pairs (aabb).", n=>/(\d)\1(\d)\2/.test(textOf(n)));
export const miniEchoRule = rule("mini-echo", "Mini Echo", EP["mini-echo"], "An adjacent two-digit repeat (abab).", n=>/(\d\d)\1/.test(textOf(n)));
export const alternatorRule = rule("alternator", "Alternator", EP["alternator"], "Digits strictly alternate even and odd.", n=>digitsOf(n).every((d,i,a)=>i===0||(d%2)!==(a[i-1]%2)));
export const flushRule = rule("flush", "Flush", EP["flush"], "All digits even, or all odd.", n=>digitsOf(n).every(d=>d%2===digitsOf(n)[0]%2));
export const contiguousTripsRule = rule("contiguous-trips", "Contiguous Trips", EP["contiguous-trips"], "Three identical digits in a row.", n=>/(\d)\1\1/.test(textOf(n)));
export const deepVoidRule = rule("deep-void", "Deep Void", EP["deep-void"], "Contains 00.", n=>hasSubstring(n,"00"));
export const featherRule = rule("feather", "Feather", EP["feather"], "Digit sum under 15.", n=>digitSum(n)<15);
export const blackjackRule = rule("blackjack", "Blackjack", EP["blackjack"], "Digits sum to exactly 21.", n=>digitSum(n)===21);
export const fullHouseRule = rule("full-house", "Full House", EP["full-house"], "A set of three and a set of two.", n=>{const c=[...countsOf(digitsOf(n)).values()];return c.includes(3)&&c.includes(2);});
export const pocketMirrorRule = rule("pocket-mirror", "Pocket Mirror", EP["pocket-mirror"], "Contains a palindrome of four or more digits.", n=>{const s=textOf(n);return [...s].some((_,i)=>Array.from({length: Math.max(0, s.length-i-3)}).some((__,k)=>{const p=s.slice(i,i+k+4);return p===p.split("").reverse().join("");}));});
export const snakeEyesRule = rule("snake-eyes", "Snake Eyes", EP["snake-eyes"], "Exactly one pair, and it is a pair of ones.", n=>{const c=countsOf(digitsOf(n));return c.get(1)===2&&[...c.values()].filter(v=>v>1).length===1;});
export const niceRule = rule("nice", "Nice", EP["nice"], "Contains 69.", n=>hasSubstring(n,"69"));
export const meaningOfLifeRule = rule("meaning-of-life", "Meaning of Life", EP["meaning-of-life"], "Contains 42.", n=>hasSubstring(n,"42"));
export const sixSevenRule = rule("six-seven", "Six-Seven", EP["six-seven"], "Contains 67.", n=>hasSubstring(n,"67"));
export const eightySixRule = rule("eighty-six", "Eighty-Six", EP["eighty-six"], "Contains 86.", n=>hasSubstring(n,"86"));
export const balancedRule = rule("balanced", "Balanced", EP["balanced"], "First half digits sum equals second half (even length).", n=>{const d=digitsOf(n);if(d.length%2)return false;const h=d.length/2;return d.slice(0,h).reduce((a,b)=>a+b,0)===d.slice(h).reduce((a,b)=>a+b,0);});
export const rhymeRule = rule("rhyme", "Rhyme", EP["rhyme"], "The same 2+ digit substring occurs twice without overlap.", n=>{const s=textOf(n);for(let l=2;l<=s.length/2;l++)for(let i=0;i+l<=s.length;i++)if(s.indexOf(s.slice(i,i+l),i+l)>=0)return true;return false;});
export const sequenceThreeRule = rule("sequence-three", "Sequence (3)", EP["sequence-three"], "Three consecutive digits in a row.", n=>hasRun(digitsOf(n)));
export const consecutiveContainsRule = rule("consecutive-contains", "2 Consecutive Numbers (Contains)", EP["consecutive-contains"], "Contains adjacent consecutive integers, with at least one chunk containing two or more digits.", n=>hasConsecutivePair(textOf(n),false));
export const consecutiveNearbyRule = rule("consecutive-nearby", "2 Consecutive Numbers (Nearby)", EP["consecutive-nearby"], "Contains consecutive integers separated by at least one digit, with at least one chunk containing two or more digits.", n=>hasConsecutivePair(textOf(n),true));
export const mesaRule = rule("mesa", "Mesa", EP["mesa"], "Rise to a peak then fall; flat stretches allowed.", n=>relaxedPeak(digitsOf(n)));
export const dozenRule = rule("dozen", "Dozen", EP["dozen"], "Divisible by 12.", n=>n%12===0);
export const canyonRule = rule("canyon", "Canyon", EP["canyon"], "Fall to a floor then rise; flat stretches allowed.", n=>relaxedPeak(digitsOf(n),true));
export const fiveDigitsRule = rule("five-digits", "Five Digits", EP["five-digits"], "A five-digit roll.", n=>textOf(n).length===5);
export const elevenRule = rule("eleven", "Eleven", EP["eleven"], "Divisible by 11.", n=>n%11===0);
export const harshadRule = rule("harshad", "Harshad Number", EP["harshad"], "Divisible by its own digit sum.", n=>digitSum(n)!==0&&n%digitSum(n)===0);
export const cleanRule = rule("clean", "Clean", EP["clean"], "Ends in 0.", n=>n%10===0);
export const semiCleanRule = rule("semi-clean", "Semi-Clean", EP["semi-clean"], "Ends in 5.", n=>n%10===5);
export const equilibriumRule = rule("equilibrium", "Equilibrium", EP["equilibrium"], "First and last digits match.", n=>digitsOf(n)[0]===digitsOf(n).at(-1));
export const sandwichRule = rule("sandwich", "Sandwich", EP["sandwich"], "Matching ends with something different inside.", n=>{const d=digitsOf(n);return d.length>=3&&d[0]===d.at(-1)&&d.slice(1,-1).some(x=>x!==d[0]);});

// Rare traits.
const rareRules = [
    rule("2nd-power", "2nd Power", EP["2nd-power"], "A perfect square.", n => Number.isInteger(Math.sqrt(n))),
    rule("even-spacing-absolute", "Even Spacing (Absolute)", EP["even-spacing-absolute"], "Digits have equal absolute spacing.", n => hasEqualAbsoluteSpacing(digitsOf(n))),
    rule("firefly", "Firefly", EP.firefly, "One unique digit among identical others (4+ digits).", n => { const d=digitsOf(n), c=[...countsOf(d).values()].sort((a,b)=>a-b);return d.length>=4&&c.length===2&&c[0]===1&&c[1]===d.length-1; }),
    rule("two-consecutive-numbers", "2 Consecutive Numbers", EP["two-consecutive-numbers"], "Splits into two consecutive integers.", n => allSplits(textOf(n),2,2).some(([a,b])=>Math.abs(a-b)===1)),
    rule("contiguous-quads", "Contiguous Quads", EP["contiguous-quads"], "Four identical digits in a row.", n => /(\d)\1\1\1/.test(textOf(n))),
    rule("deep-void-3", "Deep Void (3)", EP["deep-void-3"], "Contains 000.", n => hasSubstring(n,"000")),
    rule("turtle", "Turtle", EP.turtle, "Neighbouring digits differ by at most 1.", n => digitsOf(n).slice(1).every((d,i,a)=>Math.abs(d-digitsOf(n)[i])<=1)),
    rule("secret-agent", "Secret Agent", EP["secret-agent"], "Contains 007.", n => hasSubstring(n,"007")),
    rule("heavy", "Heavy", EP.heavy, "Digit sum above 45.", n => digitSum(n)>45),
    rule("contiguous-full-house", "Contiguous Full House", EP["contiguous-full-house"], "A run of three next to a run of two.", n => /((\d)\2\2)(\d)\3/.test(textOf(n)) || /(\d)\1((\d)\3\3)/.test(textOf(n))),
    rule("jackpot", "Jackpot", EP.jackpot, "Contains 777.", n => hasSubstring(n,"777")),
    rule("devil", "Devil", EP.devil, "Contains 666.", n => hasSubstring(n,"666")),
    rule("sequence-four", "Sequence (4)", EP["sequence-four"], "Four consecutive digits in a row.", n => {const d=digitsOf(n);return d.some((_,i)=>{const w=d.slice(i,i+4);return w.length===4&&w.every((v,j)=>j===0||Math.abs(v-w[j-1])===1)&&w.slice(1).every((v,j)=>Math.sign(v-w[j])===Math.sign(w[1]-w[0]));});}),
    rule("error-404", "Error 404", EP["error-404"], "Contains 404.", n => hasSubstring(n,"404")),
    rule("orientation", "Orientation", EP.orientation, "Contains 101.", n => hasSubstring(n,"101")),
    rule("botanist", "Botanist", EP.botanist, "Contains 420.", n => hasSubstring(n,"420")),
    rule("emergency", "Emergency", EP.emergency, "Contains 911.", n => hasSubstring(n,"911")),
    rule("pi-slice-3", "Pi Slice (3)", EP["pi-slice-3"], "Contains 314.", n => hasSubstring(n,"314")),
    rule("e-slice-3", "E Slice (3)", EP["e-slice-3"], "Contains 271.", n => hasSubstring(n,"271")),
    rule("calendar", "Calendar", EP.calendar, "Contains 365.", n => hasSubstring(n,"365")),
    rule("divisible-by-three", "Divisible by Three", EP["divisible-by-three"], "Every digit is 0, 3, 6 or 9.", n => digitsOf(n).every(d=>d%3===0)),
    rule("scramble", "Scramble", EP.scramble, "All digits form a consecutive run when sorted.", n => {const d=digitsOf(n).sort((a,b)=>a-b);return d.every((v,i)=>i===0||v===d[i-1]+1);}),
    rule("duality", "Duality", EP.duality, "Exactly two different digits.", n => countsOf(digitsOf(n)).size===2),
    rule("steps", "Steps", EP.steps, "Digits never decrease.", n => digitsOf(n).every((d,i,a)=>i===0||d>=a[i-1])),
    rule("metronome", "Metronome", EP.metronome, "Splits into 3+ parts with a constant difference (at least 2).", n => allSplits(textOf(n),3).some(p=>{const dif=p[1]-p[0];return Math.abs(dif)>=2&&p.slice(2).every((v,i)=>v-p[i+1]===dif);})),
    rule("framed-double", "Framed Double", EP["framed-double"], "Two middle pairs, bookended by different digits.", n => {const d=digitsOf(n);return d.length===6&&d[1]===d[2]&&d[3]===d[4]&&d[0]!==d[1]&&d[5]!==d[4]&&d[0]!==d[5];}),
    rule("slopes", "Slopes", EP.slopes, "Digits never increase.", n => digitsOf(n).every((d,i,a)=>i===0||d<=a[i-1])),
    rule("paired-bookends", "Paired Bookends", EP["paired-bookends"], "Starts with a pair and ends with a different pair.", n => {const s=textOf(n);return s.length>=4&&s[0]===s[1]&&s.at(-1)===s.at(-2)&&s[0]!==s.at(-1);}),
    rule("four-digits", "Four Digits", EP["four-digits"], "A four-digit roll.", n => textOf(n).length===4),
    rule("three-pair", "Three Pair", EP["three-pair"], "Three distinct pairs of digits.", n => {const c=[...countsOf(digitsOf(n)).values()];return c.filter(v=>v===2).length===3&&c.length===3;}),
    rule("bookends", "Bookends", EP.bookends, "First two digits equal the last two.", n => {const s=textOf(n);return s.length>=4&&s.slice(0,2)===s.slice(-2);}),
    rule("mirror-bookends", "Mirror Bookends", EP["mirror-bookends"], "First two digits reversed are the last two.", n => {const s=textOf(n);return s.length>=4&&s.slice(0,2)===s.slice(-2).split("").reverse().join("");}),
    rule("century", "Century", EP.century, "Ends in 00.", n => /00$/.test(textOf(n))),
    rule("double-nine", "Double Nine", EP["double-nine"], "Ends in 99.", n => /99$/.test(textOf(n))),
    rule("quarter-century", "Quarter-Century", EP["quarter-century"], "Ends in 25.", n => /25$/.test(textOf(n))),
    rule("semi-century", "Semi-Century", EP["semi-century"], "Ends in 50.", n => /50$/.test(textOf(n))),
    rule("three-quarter-century", "Three-Quarter Century", EP["three-quarter-century"], "Ends in 75.", n => /75$/.test(textOf(n)))
];

// Epic traits.
const epicRules = [
    rule("3rd-power", "3rd Power", EP["3rd-power"], "A perfect cube.", n => isCube(n)),
    rule("even-spacing", "Even Spacing", EP["even-spacing"], "Digits form an arithmetic sequence.", n => {const d=digitsOf(n);return d.length>=3&&d.slice(2).every((v,i)=>v-d[i+1]===d[1]-d[0]);}),
    rule("three-consecutive-numbers", "3 Consecutive Numbers", EP["three-consecutive-numbers"], "Splits into three consecutive integers, in order.", n => hasConsecutiveChunks(textOf(n),3,true)),
    rule("contiguous-fives", "Contiguous Fives", EP["contiguous-fives"], "Five identical digits in a row.", n => /(\d)\1\1\1\1/.test(textOf(n))),
    rule("deep-void-4", "Deep Void (4)", EP["deep-void-4"], "Contains 0000.", n => hasSubstring(n,"0000")),
    rule("strobogrammatic", "Strobogrammatic", EP.strobogrammatic, "Looks the same rotated 180 degrees.", n => {const map={0:"0",1:"1",6:"9",8:"8",9:"6"};return [...textOf(n)].every((d,i,a)=>map[d]===a[a.length-1-i]);}),
    rule("straight", "Straight", EP.straight, "Five consecutive digits, up or down.", n => {const d=digitsOf(n);return d.some((_,i)=>{const w=d.slice(i,i+5);return w.length===5&&w.every((v,j)=>j===0||Math.abs(v-w[j-1])===1)&&w.slice(1).every((v,j)=>Math.sign(v-w[j])===Math.sign(w[1]-w[0]));});}),
    rule("jackpot-four", "Jackpot Four", EP["jackpot-four"], "Four sevens in a row.", n => hasSubstring(n,"7777")),
    rule("very-nice", "Very Nice", EP["very-nice"], "Contains 6969.", n => hasSubstring(n,"6969")),
    rule("deeper-meaning", "Deeper Meaning", EP["deeper-meaning"], "Contains 4242.", n => hasSubstring(n,"4242")),
    rule("6767", "6767", EP["6767"], "Contains 6767.", n => hasSubstring(n,"6767")),
    rule("leet", "Leet", EP.leet, "Contains 1337.", n => hasSubstring(n,"1337")),
    rule("hell", "Hell", EP.hell, "Contains 7734 (HELL upside-down).", n => hasSubstring(n,"7734")),
    rule("8008", "8008", EP["8008"], "Contains 8008.", n => hasSubstring(n,"8008")),
    rule("big-brother", "Big Brother", EP["big-brother"], "Contains 1984.", n => hasSubstring(n,"1984")),
    rule("pi-slice-4", "Pi Slice (4)", EP["pi-slice-4"], "Contains 3141.", n => hasSubstring(n,"3141")),
    rule("e-slice-4", "E Slice (4)", EP["e-slice-4"], "Contains 2718.", n => hasSubstring(n,"2718")),
    rule("tau-slice-4", "Tau Slice (4)", EP["tau-slice-4"], "Contains 6283.", n => hasSubstring(n,"6283")),
    rule("three-consecutive-scrambled", "3 Consecutive Numbers (Scrambled)", EP["three-consecutive-scrambled"], "Splits into three consecutive integers, out of order.", n => allSplits(textOf(n),3,3).some(p=>new Set(p).size===3&&p.every(v=>p.includes(v+1)||p.includes(v-1))&&Math.max(...p)-Math.min(...p)===2)),
    rule("zipper", "Zipper", EP.zipper, "Two digits alternating perfectly.", n => {const d=digitsOf(n);return d.length>=4&&d[0]===d[2]&&d[1]===d[3]&&d[0]!==d[1]&&d.every((v,i)=>i<2||v===d[i%2]);}),
    rule("ascension", "Ascension", EP.ascension, "Every digit strictly larger than the previous.", n => digitsOf(n).every((d,i,a)=>i===0||d>a[i-1])),
    rule("crescendo", "Crescendo", EP.crescendo, "Splits into three or more parts with a constant ratio.", n => allSplits(textOf(n),3).some(p=>p[0]!==0&&p.slice(2).every((v,i)=>v*p[i]===p[i+1]*p[i+1]))),
    rule("five-of-a-kind", "Five of a Kind", EP["five-of-a-kind"], "Five identical digits anywhere.", n => [...countsOf(digitsOf(n)).values()].some(c=>c>=5)),
    rule("three-consecutive-contains", "3 Consecutive Numbers (Contains)", EP["three-consecutive-contains"], "Contains three adjacent consecutive integers.", n => hasConsecutiveChunks(textOf(n),3,false)),
    rule("contiguous-three-pair", "Contiguous Three Pair", EP["contiguous-three-pair"], "Three adjacent contiguous pairs (ddeeff).", n => /^(\d)\1(\d)\2(\d)\3$/.test(textOf(n))),
    rule("framed-pair", "Framed Pair", EP["framed-pair"], "Four digits: middle two match, both ends differ.", n => {const d=digitsOf(n);return d.length===4&&d[1]===d[2]&&d[0]!==d[1]&&d[3]!==d[1];}),
    rule("framed-triple", "Framed Triple", EP["framed-triple"], "Five digits: middle three match, ends differ.", n => {const d=digitsOf(n);return d.length===5&&d[1]===d[2]&&d[2]===d[3]&&d[0]!==d[1]&&d[4]!==d[1];}),
    rule("framed-quad", "Framed Quad", EP["framed-quad"], "Six digits: middle four match, ends differ.", n => {const d=digitsOf(n);return d.length===6&&d[1]===d[2]&&d[2]===d[3]&&d[3]===d[4]&&d[0]!==d[1]&&d[5]!==d[1];}),
    rule("decay", "Decay", EP.decay, "Every digit is strictly smaller than the previous.", n => digitsOf(n).every((d,i,a)=>i===0||d<a[i-1])),
    rule("three-digits", "Three Digits", EP["three-digits"], "A three-digit roll.", n => textOf(n).length===3),
    rule("echo", "Echo", EP.echo, "The first half repeats as the second half.", n => {const s=textOf(n);return s.length%2===0&&s.slice(0,s.length/2)===s.slice(s.length/2);}),
    rule("millennium", "Millennium", EP.millennium, "Ends in 000.", n => /000$/.test(textOf(n))),
    rule("pronic", "Pronic Number", EP.pronic, "The product of two consecutive integers.", n => isPronic(n)),
    rule("triple-nine", "Triple Nine", EP["triple-nine"], "Ends in 999.", n => /999$/.test(textOf(n))),
    rule("semi-millennium", "Semi-Millennium", EP["semi-millennium"], "Ends in 500.", n => /500$/.test(textOf(n))),
    rule("colossal", "Colossal", EP.colossal, "Above 999,000.", n => n>999000)
];

export const RULES = [
    hillsRule, threeKindRule, luckySevenDivisibleRule, heterogeneousRule, miniScrambleRule, gapOneRule, twoPairRule,
    dunesRule, hopscotchRule, ghostRule, quartetRule, ...singleDigitRules, groundedRule, contiguousPairRule,
    luckySevenRule, evenRule, oddRule,
    // These two are emitted as separate matches where their digit-pattern distinction is useful.
    rule("liftoff", "Liftoff", EP.liftoff, "First digit larger than the last.", n=>digitsOf(n)[0]>digitsOf(n).at(-1)),
    voidRule, neighborsRule, pairRule, sixDigitsRule,
    fourKindRule, equationRule, lowBallRule, mountainRule, doubleHopRule, highRollerRule, valleyRule, contiguousTwoPairRule,
    miniEchoRule, alternatorRule, flushRule, contiguousTripsRule, deepVoidRule, featherRule, blackjackRule, fullHouseRule,
    pocketMirrorRule, snakeEyesRule, niceRule, meaningOfLifeRule, sixSevenRule, eightySixRule, balancedRule, rhymeRule,
    sequenceThreeRule, consecutiveContainsRule, consecutiveNearbyRule, mesaRule, primeRule,
    rule("trinity", "Trinity", EP["trinity"], "Uses exactly three different digit values.", n=>countsOf(digitsOf(n)).size===3),
    dozenRule, canyonRule, fiveDigitsRule, elevenRule, harshadRule, cleanRule, semiCleanRule, equilibriumRule, sandwichRule,
    palindromeRule, perfectSquareRule,
    ...rareRules,
    ...epicRules
];
