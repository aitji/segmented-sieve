
/**
 * @param {Object} [options={}] - configuration options.
 * 
 * @param {number} [options.max=1e6]        - upper limit (inclusive) for the initial sieve.
 * @param {number} [options.segSize=1e6]    - size of each segment for the segmented sieve.
 * @param {number} [options.duration=1000]  - maximum duration (in milliseconds) to continue finding primes in segments.
 * 
 * @returns {Object} - result object.
 * @returns {number} - result.count     - total number of primes found.
 * @returns {number} - result.largest   - largest prime found.
 * @returns {number} - result.time      - time taken (in seconds) to perform the computation.
 */
function segmentedSieve({
    max = 1e6,
    segSize = 1e6,
    duration = 1_000
} = {}) {
    const t0 = performance.now()

    const primes = [2]
    const isPrime = new Uint8Array(max + 1).fill(1)
    isPrime[0] = isPrime[1] = 0

    for (let i = 2; i * i <= max; i++) {
        if (isPrime[i]) {
            for (let j = i * i; j <= max; j += i) isPrime[j] = 0
        }
    }
    for (let i = 3; i <= max; i += 2) if (isPrime[i]) primes.push(i)

    let low = max + 1
    let currentSegSize = segSize
    const found = [...primes]

    const nSegment = () => {
        const high = low + currentSegSize - 1
        const mark = new Uint8Array(currentSegSize).fill(1)

        for (let p of primes) {
            const start = Math.max(p * p, Math.ceil(low / p) * p)
            for (let j = start; j <= high; j += p) mark[j - low] = 0
        }

        for (let i = 0; i < mark.length; i++) if (mark[i]) found.push(low + i)
        low += currentSegSize
        currentSegSize = Math.floor(currentSegSize * 1.1)
    }

    while (performance.now() - t0 < duration) nSegment();

    return {
        count: found.length,
        largest: found.at(-1),
        time: (performance.now() - t0) / 1000
    }
}

/**
 * ==============================================
 * Segmented Sieve EXPORTs
 * if you didn't use this file as a module,
 * 
 * you can "remove" this part.
 * ==============================================
 */
if (typeof module !== 'undefined' && module.exports) module.exports = { segmentedSieve }    // node.js
if (typeof window !== 'undefined') {                                                        // browser/global usage
    if (!window.performance) window.performance = {}                       // (fallback)  -  for performance
    if (!window.performance.now) window.performance.now = () => Date.now() // (fallback)  -  for performance.now()

    if (document.readyState === 'complete') window.segmentedSieve = segmentedSieve
    else window.addEventListener('load', () => window.segmentedSieve = segmentedSieve)
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { segmentedSieve }
    module.exports.default = segmentedSieve
}
