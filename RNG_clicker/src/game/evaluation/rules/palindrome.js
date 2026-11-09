export function palindromeRule(number) {
    const digits = String(number);
    const reversed = digits.split("").reverse().join("");

    if (digits !== reversed) return null;

    return {
        id: "palindrome",
        name: "Palindrome",
        ep: 3,
        explanation: "Reads the same forwards and backwards."
    };
}
