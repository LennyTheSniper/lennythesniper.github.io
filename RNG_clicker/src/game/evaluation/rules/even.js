export function evenRule(number) {
    if (number % 2 !== 0) return null;

    return {
        id: "even",
        name: "Even number",
        ep: 1,
        explanation: "Divisible by 2."
    };
}
