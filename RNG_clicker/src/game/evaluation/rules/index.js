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
    if(s.length<4)return false;
    for(let equalAt=0;equalAt<s.length-1;equalAt++)for(let operatorAt=0;operatorAt<s.length-1;operatorAt++){
        if(operatorAt===equalAt)continue;
        let left,right;
        if(operatorAt<equalAt){left=[s.slice(0,operatorAt+1),s.slice(operatorAt+1,equalAt+1)];right=[s.slice(equalAt+1)];}
        else{left=[s.slice(0,equalAt+1)];right=[s.slice(equalAt+1,operatorAt+1),s.slice(operatorAt+1)];}
        const a=Number(left.join("")),b=Number(right[0]),c=right.length===2?Number(right[1]):null;
        if(!Number.isFinite(a)||!Number.isFinite(b)||(c!==null&&!Number.isFinite(c)))continue;
        for(const operator of ["+","-","*","/"]){
            let lhs,rhs;
            if(left.length===2){const [x,y]=left.map(Number);if(operator==="+")lhs=x+y;else if(operator==="-")lhs=x-y;else if(operator==="*")lhs=x*y;else lhs=y===0?NaN:x/y;rhs=Number(right[0]);}
            else{lhs=Number(left[0]);if(operator==="+")rhs=b+c;else if(operator==="-")rhs=b-c;else if(operator==="*")rhs=b*c;else rhs=c===0?NaN:b/c;}
            if(Number.isFinite(lhs)&&Number.isFinite(rhs)&&Math.abs(lhs-rhs)<1e-10)return true;
        }
    }
    return false;
};
const hasConsecutivePair = (s, nearby, containsOnly = false) => {
    for(let firstStart=0;firstStart<s.length;firstStart++) {
        for(let firstEnd=firstStart+1;firstEnd<=s.length;firstEnd++) {
            const first=s.slice(firstStart,firstEnd);
            if(first.length>1&&first[0]==="0")continue;
            const secondStart=firstEnd+(nearby?1:0);
            for(let secondEnd=secondStart+1;secondEnd<=s.length;secondEnd++) {
                if(containsOnly&&firstStart===0&&secondEnd===s.length)continue;
                const second=s.slice(secondStart,secondEnd);
                if(second.length>1&&second[0]==="0")continue;
                if((first.length>1||second.length>1)&&Math.abs(Number(first)-Number(second))===1)return true;
            }
        }
    }
    return false;
};
const validIntegerChunk = chunk => !(chunk.length>1&&chunk[0]==="0") && Number.isSafeInteger(Number(chunk));
const consecutiveValues = (chunks, scrambled = false) => {
    if(chunks.length<2||!chunks.some(chunk=>chunk.length>=2)||!chunks.every(validIntegerChunk))return false;
    const values=chunks.map(Number);
    if(scrambled){const sorted=[...values].sort((a,b)=>a-b);return sorted.every((v,i)=>i===0||v===sorted[i-1]+1);}
    const ascending=values.every((v,i)=>i===0||v===values[i-1]+1);
    const descending=values.every((v,i)=>i===0||v===values[i-1]-1);
    return ascending||descending;
};
const getPartitions = (s, count) => {
    const result=[];
    const visit=(at,chunks)=>{
        if(chunks.length===count){if(at===s.length)result.push(chunks);return;}
        for(let end=at+1;end<=s.length-(count-chunks.length-1);end++)visit(end,[...chunks,s.slice(at,end)]);
    };
    visit(0,[]);
    return result;
};
const chunksFormRun = chunks => {
    if(chunks.some(chunk=>!validIntegerChunk(chunk)))return false;
    const values=chunks.map(Number).sort((a,b)=>a-b);
    return values.every((value,index)=>index===0||value===values[index-1]+1);
};
const hasScrambleWithin = (s,minChunks,maxChunks,allowGaps) => {
    if(!allowGaps){
        for(let count=minChunks;count<=Math.min(maxChunks,s.length);count++)
            if(getPartitions(s,count).some(chunks=>chunksFormRun(chunks)))return true;
        return false;
    }
    const search=(at,chunks)=>{
        if(chunks.length>=minChunks&&chunksFormRun(chunks))return true;
        if(chunks.length===maxChunks)return false;
        for(let start=at;start<s.length;start++)for(let end=start+1;end<=s.length;end++){
            const chunk=s.slice(start,end);
            if(validIntegerChunk(chunk)&&search(end,[...chunks,chunk]))return true;
        }
        return false;
    };
    return search(0,[]);
};
const hasMiniScramble = s => {
    for(let start=0;start<s.length;start++)for(let length=3;length<=5&&start+length<=s.length;length++){
        const region=s.slice(start,start+length);
        for(let count=3;count<=Math.min(5,region.length);count++)
            if(getPartitions(region,count).some(chunks=>chunksFormRun(chunks)))return true;
    }
    return false;
};
const hasConsecutiveSequence = (s,count,mode) => {
    if(mode==="exact")return getPartitions(s,count).some(chunks=>consecutiveValues(chunks));
    for(let start=0;start<s.length;start++)for(let end=start+count;end<=s.length;end++){
        if(mode==="contains"&&end-start===s.length)continue;
        const segment=s.slice(start,end);
        if(getPartitions(segment,count).some(chunks=>consecutiveValues(chunks,mode==="scrambled")))return true;
    }
    return false;
};
const hasGeometricChunkSequence = s => {
    // RNGdle's Crescendo is the whole roll split into 3+ terms, each 1-3
    // digits long. It is not a substring search (e.g. 119000 is not one).
    for(let count=3;count<=s.length;count++)for(const chunks of getPartitions(s,count)){
        if(chunks.some(chunk=>chunk.length>3||!validIntegerChunk(chunk)))continue;
        const values=chunks.map(Number);
        if(values.some(value=>value<=0)||values[0]===values[1])continue;
        if(values.slice(2).every((value,index)=>value*values[index]===values[index+1]*values[index+1]))return true;
    }
    return false;
};
const hasNearbyConsecutivePair = s => {
    for(let aStart=0;aStart<s.length;aStart++)for(let aEnd=aStart+1;aEnd<s.length;aEnd++){
        const a=s.slice(aStart,aEnd);if(!validIntegerChunk(a))continue;
        for(let bStart=aEnd+1;bStart<s.length;bStart++)for(let bEnd=bStart+1;bEnd<=s.length;bEnd++){
            const b=s.slice(bStart,bEnd);
            if(validIntegerChunk(b)&&(a.length>=2||b.length>=2)&&Math.abs(Number(a)-Number(b))===1)return true;
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
    "exact-number":100000100, "exact-boob":50000050, "funny-number":50000050, always:50000050,
    "golden-ratio":33333367, tau:33333367, "13th-power":33333367, "17th-power":33333367, "19th-power":33333367,
    pi:25000025, "eulers-number":25000025, "10th-power":25000025, "11th-power":25000025,
    "9th-power":20000020, "8th-power":16666683, ouroboros:14285729, "7th-power":12500013,
    "power-of-seven":12500013, "power-of-five":11111122, factorial:11111122, hello:11111122,
    "sequence-six":11111122, "contiguous-sixes":10000010, "deep-void-5":10000010,
    eon:10000010, "semi-eon":10000010, "quint-nine":10000010, "single-digit":10000010,
    "6th-power":9090918, "power-of-three":7692315, "5th-power":6250006, "power-of-two":5000005,
    "jackpot-five":5263163, "e-slice-5":5000005, "pi-slice-5":5000005, "tau-slice-5":5000005,
    "royal-flush":5000005, "58008":5000005, cascade:3333337, fibonacci:3333337,
    "4th-power":3125003, waterfall:2857146, homogeneous:2222224, "funny-numbers":1666668,
    "binary-soul":1538463, "straight-flush":1449277, "two-digits":1111112, "spy-number":1030929,
    epoch:1000001, "semi-epoch":1000001, "quad-nine":1000001,
    "four-consecutive-exact":25000025, "four-consecutive-contains":2631582, "four-consecutive-scrambled":2272730,
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
export const miniScrambleRule = rule("mini-scramble", "Mini Scramble", EP["mini-scramble"], "Contains a contiguous 3–5 digit region that can be split into consecutive integers when sorted.", n => hasMiniScramble(textOf(n)));
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
export const equationRule = rule("equation", "Equation", EP["equation"], "One +, −, ×, or ÷ and one = between digits form a true equation.", n => isEquation(textOf(n)));
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
export const consecutiveContainsRule = rule("consecutive-contains", "2 Consecutive Numbers (Contains)", EP["consecutive-contains"], "Contains adjacent consecutive integers within a larger number, with at least one chunk containing two or more digits.", n=>hasConsecutivePair(textOf(n),false,true));
export const consecutiveNearbyRule = rule("consecutive-nearby", "2 Consecutive Numbers (Nearby)", EP["consecutive-nearby"], "Contains consecutive integers separated by at least one digit, with at least one chunk containing two or more digits.", n=>hasNearbyConsecutivePair(textOf(n)));
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
    rule("two-consecutive-numbers", "2 Consecutive Numbers", EP["two-consecutive-numbers"], "The entire number splits into exactly two consecutive integers, with at least one chunk having two or more digits.", n => hasConsecutiveSequence(textOf(n),2,"exact")),
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
    rule("scramble", "Scramble", EP.scramble, "The entire number splits into at least three consecutive integer chunks, with no leftover digits.", n => hasScrambleWithin(textOf(n),3,textOf(n).length,false)),
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
    rule("three-consecutive-numbers", "3 Consecutive Numbers", EP["three-consecutive-numbers"], "The entire number splits into exactly three consecutive integers, in order.", n => hasConsecutiveSequence(textOf(n),3,"exact")),
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
    rule("three-consecutive-scrambled", "3 Consecutive Numbers (Scrambled)", EP["three-consecutive-scrambled"], "Contains three consecutive integers as adjacent chunks, in any order.", n => hasConsecutiveSequence(textOf(n),3,"scrambled")),
    rule("zipper", "Zipper", EP.zipper, "Two digits alternating perfectly.", n => {const d=digitsOf(n);return d.length>=4&&d[0]===d[2]&&d[1]===d[3]&&d[0]!==d[1]&&d.every((v,i)=>i<2||v===d[i%2]);}),
    rule("ascension", "Ascension", EP.ascension, "Every digit strictly larger than the previous.", n => digitsOf(n).every((d,i,a)=>i===0||d>a[i-1])),
    rule("crescendo", "Crescendo", EP.crescendo, "The full roll splits into at least three positive 1–3 digit chunks with a constant ratio.", n => hasGeometricChunkSequence(textOf(n))),
    rule("five-of-a-kind", "Five of a Kind", EP["five-of-a-kind"], "Five identical digits anywhere.", n => [...countsOf(digitsOf(n)).values()].some(c=>c>=5)),
    rule("three-consecutive-contains", "3 Consecutive Numbers (Contains)", EP["three-consecutive-contains"], "Contains three consecutive integers as adjacent chunks, in ascending or descending order.", n => hasConsecutiveSequence(textOf(n),3,"contains")),
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

const anomalyRules = [
    rule("four-consecutive-scrambled", "4 Consecutive Numbers (Scrambled)", EP["four-consecutive-scrambled"], "Contains four consecutive integers as adjacent chunks, in any order.", n => hasConsecutiveSequence(textOf(n),4,"scrambled")),
    rule("four-consecutive-contains", "4 Consecutive Numbers (Contains)", EP["four-consecutive-contains"], "Contains four consecutive integers as adjacent chunks, in ascending or descending order, within a larger number.", n => hasConsecutiveSequence(textOf(n),4,"contains")),
    rule("four-consecutive-numbers", "4 Consecutive Numbers", EP["four-consecutive-exact"], "The entire number splits into exactly four consecutive integers.", n => hasConsecutiveSequence(textOf(n),4,"exact"))
];

const valuesRule = (id,name,ep,explanation,values) => rule(id,name,ep,explanation,n=>values.has(n));
const powerValues = (exponent) => {
    const values=new Set();
    for(let base=0;base**exponent<=1_000_000;base++)values.add(base**exponent);
    return values;
};
const basePowers = (base) => {
    const values=new Set();
    for(let value=1;value<=1_000_000;value*=base)values.add(value);
    return values;
};
const factorialValues = (()=>{const values=new Set([1]);let value=1;for(let n=1;n<=9;n++){value*=n;if(value<=1_000_000)values.add(value);}return values;})();
const fibonacciValues = (()=>{const values=new Set([0,1]);let a=0,b=1;while(a+b<=1_000_000){[a,b]=[b,a+b];values.add(b);}return values;})();
const ouroborosValues = new Set(Array.from({length:7},(_,i)=>i+1).map(n=>n**n));
const exactNamedValues = [
    ["zero","Zero",0],["one","One",1],["two","Two",2],["three","Three",3],["four","Four",4],
    ["five","Five",5],["six","Six",6],["seven","Seven",7],["eight","Eight",8],["nine","Nine",9],
    ["meaning","Exact Meaning",42],["six-seven","Exact Six-Seven",67],["nice","Exact Nice",69],["eighty-six","Exact Eighty-Six",86],
    ["orientation","Exact Orientation",101],["calendar","Exact Calendar",365],["not-found","Not Found",404],["botanist","Exact Botanist",420],
    ["devil","Exact Devil",666],["jackpot","Exact Jackpot",777],["emergency","Exact Emergency",911],["mayday","Mayday",911911],["leet","Exact Leet",1337],
    ["orwellian","Orwellian",1984],["hell","Exact Hell",7734],["17776","17776",17776],["80085","Exact 80085",80085],
    ["full-day","Full Day",86400],["groundhog-day","Groundhog Day",365365],["hotbox","Hotbox",420420],
    ["universal-answer","Universal Answer",424242],["infernal","Infernal",666666],["brainrot","Brainrot",676767],
    ["very-very-nice","Very Very Nice",696969],["jackpot-six","Jackpot Six",777777],["million","The Fabled One Million",1000000]
];
const mythicRules = [
    ...exactNamedValues.map(([id,name,value])=>valuesRule(`exact-${id}`,name,EP["exact-number"],`Exactly ${value}.`,new Set([value]))),
    rule("exact-boob","Exact Boob",EP["exact-boob"],"Exactly 8008 or 58008.",n=>n===8008||n===58008),
    rule("funny-number","Funny Number",EP["funny-number"],"Exactly 42069 or 69420.",n=>n===42069||n===69420),
    rule("always","Always",EP.always,"Exactly 247365 or 365247.",n=>n===247365||n===365247),
    valuesRule("golden-ratio","Golden Ratio",EP["golden-ratio"],"Exactly one of the first four or more digits of the golden ratio: 1618, 16180, or 161803.",new Set([1618,16180,161803])),
    valuesRule("tau","Tau",EP.tau,"Exactly one of the first four or more digits of tau: 6283, 62831, or 628318.",new Set([6283,62831,628318])),
    valuesRule("pi","Pi",EP.pi,"Exactly one of the first three or more digits of pi: 314, 3141, 31415, or 314159.",new Set([314,3141,31415,314159])),
    valuesRule("eulers-number","Euler's Number",EP["eulers-number"],"Exactly one of the first three or more digits of e: 271, 2718, 27182, or 271828.",new Set([271,2718,27182,271828])),
    ...[13,17,19,10,11,9,8,7].map(exp=>valuesRule(`${exp}th-power`,`${exp}th Power`,EP[`${exp}th-power`],`A perfect ${exp}th power.`,powerValues(exp))),
    valuesRule("power-of-seven","Power of Seven",EP["power-of-seven"],"An exact power of seven.",basePowers(7)),
    valuesRule("power-of-five","Power of Five",EP["power-of-five"],"An exact power of five.",basePowers(5)),
    valuesRule("factorial","Factorial",EP.factorial,"A factorial number, n!.",factorialValues),
    rule("hello","Hello",EP.hello,"Contains the sequence 07734.",n=>textOf(n).includes("07734")),
    rule("sequence-six","Sequence (6)",EP["sequence-six"],"The entire number is six consecutive digits, ascending or descending.",n=>{const s=textOf(n);return s.length===6&&([...s].slice(1).every((d,i)=>Number(d)===Number(s[i])+1)||[...s].slice(1).every((d,i)=>Number(d)===Number(s[i])-1));}),
    rule("contiguous-sixes","Contiguous Sixes",EP["contiguous-sixes"],"Contains six identical digits; six zeroes do not count.",n=>/(?!0)(\d)\1{5}/.test(textOf(n))),
    rule("deep-void-5","Deep Void (5)",EP["deep-void-5"],"Contains 00000.",n=>hasSubstring(n,"00000")),
    rule("eon","Eon",EP.eon,"Ends in 00000.",n=>/00000$/.test(textOf(n))),
    rule("semi-eon","Semi-Eon",EP["semi-eon"],"Ends in 50000.",n=>/50000$/.test(textOf(n))),
    rule("quint-nine","Quint Nine",EP["quint-nine"],"Ends in 99999.",n=>/99999$/.test(textOf(n))),
    rule("single-digit","Single Digit",EP["single-digit"],"The roll contains exactly one digit.",n=>textOf(n).length===1),
    valuesRule("ouroboros","Ouroboros",EP.ouroboros,"A number of the form n^n, for n from 1 through 7.",ouroborosValues)
];
const anomalyExtraRules = [
    valuesRule("6th-power","6th Power",EP["6th-power"],"A perfect sixth power.",powerValues(6)),
    valuesRule("power-of-three","Power of Three",EP["power-of-three"],"An exact power of three.",basePowers(3)),
    valuesRule("power-of-two","Power of Two",EP["power-of-two"],"An exact power of two.",basePowers(2)),
    valuesRule("5th-power","5th Power",EP["5th-power"],"A perfect fifth power.",powerValues(5)),
    valuesRule("4th-power","4th Power",EP["4th-power"],"A perfect fourth power.",powerValues(4)),
    rule("jackpot-five","Jackpot Five",EP["jackpot-five"],"Contains 77777.",n=>hasSubstring(n,"77777")),
    rule("e-slice-5","E Slice (5)",EP["e-slice-5"],"Contains 27182.",n=>hasSubstring(n,"27182")),
    rule("pi-slice-5","Pi Slice (5)",EP["pi-slice-5"],"Contains 31415.",n=>hasSubstring(n,"31415")),
    rule("tau-slice-5","Tau Slice (5)",EP["tau-slice-5"],"Contains 62831.",n=>hasSubstring(n,"62831")),
    rule("royal-flush","Royal Flush",EP["royal-flush"],"Contains 56789.",n=>hasSubstring(n,"56789")),
    rule("58008","58008",EP["58008"],"Contains 58008.",n=>hasSubstring(n,"58008")),
    valuesRule("fibonacci","Fibonacci Number",EP.fibonacci,"A Fibonacci number from the sequence beginning 0, 1, 1, 2, 3, 5...",fibonacciValues),
    rule("cascade","Cascade",EP.cascade,"Every digit increases by one from the previous digit.",n=>{const s=textOf(n);return s.length>=2&&[...s].slice(1).every((d,i)=>Number(d)===Number(s[i])+1);}),
    rule("waterfall","Waterfall",EP.waterfall,"Every digit decreases by one from the previous digit.",n=>{const s=textOf(n);return s.length>=2&&[...s].slice(1).every((d,i)=>Number(d)===Number(s[i])-1);}),
    rule("homogeneous","Homogeneous",EP.homogeneous,"All digits are identical and the roll has at least two digits; zero-only strings do not count.",n=>n!==0&&textOf(n).length>=2&&/^([1-9])\1*$/.test(textOf(n))),
    rule("funny-numbers","Funny Numbers",EP["funny-numbers"],"Contains both 69 and 420.",n=>hasSubstring(n,"69")&&hasSubstring(n,"420")),
    rule("binary-soul","Binary Soul",EP["binary-soul"],"Contains only zeroes and ones.",n=>/^[01]+$/.test(textOf(n))),
    valuesRule("two-digits","Two Digits",EP["two-digits"],"The roll contains exactly two digits.",new Set(Array.from({length:90},(_,i)=>i+10))),
    rule("spy-number","Spy Number",EP["spy-number"],"The sum of the digits equals their product.",n=>{const d=digitsOf(n),sum=d.reduce((a,b)=>a+b,0),product=d.reduce((a,b)=>a*b,1);return sum===product;}),
    rule("epoch","Epoch",EP.epoch,"Ends in 0000.",n=>/0000$/.test(textOf(n))),
    rule("semi-epoch","Semi-Epoch",EP["semi-epoch"],"Ends in 5000.",n=>/5000$/.test(textOf(n))),
    rule("quad-nine","Quad Nine",EP["quad-nine"],"Ends in 9999.",n=>/9999$/.test(textOf(n))),
    rule("straight-flush","Straight Flush",EP["straight-flush"],"Contains an ascending or descending run of five consecutive digits of the same parity.",n=>["02468","13579","86420","97531"].some(v=>textOf(n).includes(v)))
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
    ...epicRules,
    ...anomalyRules,
    ...mythicRules,
    ...anomalyExtraRules
];
