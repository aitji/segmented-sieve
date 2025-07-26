function segmentedSieve() {
    const t0 = performance.now()
    const tMax = 1_000

    const primes = [2]
    const max = 1e6
    const isPrime = new Uint8Array(max + 1).fill(1)
    isPrime[0] = isPrime[1] = 0

    for (let i = 2; i * i <= max; i++) if (isPrime[i]) for (let j = i * i; j <= max; j += i) isPrime[j] = 0
    for (let i = 3; i <= max; i += 2) if (isPrime[i]) primes.push(i)

    let low = max + 1
    let segSize = 1e6
    const found = [...primes]

    const nSegment = () => {
        const high = low + segSize - 1
        const mark = new Uint8Array(segSize).fill(1)

        for (let p of primes) {
            const start = Math.max(p * p, Math.ceil(low / p) * p)
            for (let j = start; j <= high; j += p) mark[j - low] = 0
        }

        for (let i = 0; i < mark.length; i++) if (mark[i]) found.push(low + i)
        low += segSize
        segSize = Math.floor(segSize * 1.1)
    }

    while (performance.now() - t0 < tMax) nSegment()

    return {
        count: found.length,
        largest: found.at(-1),
        time: (performance.now() - t0) / 1000
    }
}