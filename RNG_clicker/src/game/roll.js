// Return a uniformly distributed integer from 0 through maxNumber, inclusive.
// GitHub Pages uses HTTPS, so the Web Crypto API is available in normal browsers.
export function rollNumber(maxNumber) {
    if (!Number.isSafeInteger(maxNumber) || maxNumber < 1) {
        throw new RangeError("maxNumber must be a positive safe integer.");
    }

    if (!globalThis.crypto?.getRandomValues) {
        throw new Error("This browser does not support secure random number generation.");
    }

    const rangeSize = maxNumber + 1;
    const uint32Range = 2 ** 32;

    // Rejection sampling avoids the small modulo bias caused by `% rangeSize` alone.
    const acceptedLimit = Math.floor(uint32Range / rangeSize) * rangeSize;
    const buffer = new Uint32Array(1);
    let randomValue;

    do {
        crypto.getRandomValues(buffer);
        randomValue = buffer[0];
    } while (randomValue >= acceptedLimit);

    return randomValue % rangeSize;
}
