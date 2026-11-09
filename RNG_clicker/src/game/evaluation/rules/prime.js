export function primeRule(number) {
    // 0 and 1 are not prime numbers.
    if (number < 2) return null;

    for (let divisor = 2; divisor <= Math.sqrt(number); divisor++) {
        if (number % divisor === 0) return null;
    }

    return {
        id: "prime",
        name: "Prime number",
        ep: 5,
        explanation: "Has exactly two positive divisors."
    };
}
