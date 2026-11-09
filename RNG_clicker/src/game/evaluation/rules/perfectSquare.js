export function perfectSquareRule(number) {
    const root = Math.sqrt(number);

    if (!Number.isInteger(root)) return null;

    return {
        id: "perfect-square",
        name: "Perfect square",
        ep: 4,
        explanation: "Is the square of an integer."
    };
}
