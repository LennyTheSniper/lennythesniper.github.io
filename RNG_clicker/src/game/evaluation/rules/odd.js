export function oddRule(number) {
    if (number % 2 === 0) return null;

    return {
        id: "odd",
        name: "Odd number",
        ep: 1,
        explanation: "Not divisible by 2."
    };
}
