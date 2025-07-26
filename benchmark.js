/** @param {Function} primeFinderFn */
async function benchmark(primeFinderFn, name, runs = 5, runDuration = 1000) {
    let totalCount = 0
    let totalTime = 0

    for (let i = 0; i < runs; i++) {
        const { count, largest, time } = await primeFinderFn(runDuration)
        totalCount += count
        totalTime += time
        console.log(`${name} run ${i + 1}: found ${count.toLocaleString()} primes, time ${time.toFixed(3)} sec, largest prime ${largest.toLocaleString()}`)
    }

    const avgCount = Math.round(totalCount / runs)
    const avgTime = totalTime / runs
    console.log(`\n${name} avg: found ${avgCount.toLocaleString()} primes, avg time ${avgTime.toFixed(3)} sec\n`)
    return { avgCount, avgTime }
}

function simpleSieveBenchmark(runDuration = 1000) {
    return new Promise(resolve => {
        const max = 1e7
        const t0 = performance.now()

        while (performance.now() - t0 < runDuration) {
            const isPrime = new Uint8Array(max + 1).fill(1)
            isPrime[0] = isPrime[1] = 0
            for (let i = 2; i * i <= max; i++) if (isPrime[i]) for (let j = i * i; j <= max; j += i) isPrime[j] = 0
        }
        const isPrime = new Uint8Array(max + 1).fill(1)
        isPrime[0] = isPrime[1] = 0
        for (let i = 2; i * i <= max; i++) if (isPrime[i]) for (let j = i * i; j <= max; j += i) isPrime[j] = 0

        const primesCount = isPrime.reduce((a, v) => a + v, 0)
        const largest = (() => {
            for (let i = max; i >= 2; i--) if (isPrime[i]) return i
        })()
        const end = performance.now()
        resolve({
            count: primesCount,
            largest,
            time: (end - t0) / 1000
        })
    })
}

function trialDivisionBasic(runDuration = 1000) {
    return new Promise(resolve => {
        const t0 = performance.now()
        const primes = []

        const isPrime = n => {
            if (n < 2) return false
            if (n === 2) return true
            if (n % 2 === 0) return false
            for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false
            return true
        }

        let n = 2
        while (performance.now() - t0 < runDuration) {
            if (isPrime(n)) primes.push(n)
            n++
        }
        const end = performance.now()
        resolve({
            count: primes.length,
            largest: primes.at(-1) ?? 0,
            time: (end - t0) / 1000
        })
    })
}

function trialDivision6k1(runDuration = 1000) {
    return new Promise(resolve => {
        const t0 = performance.now()
        const primes = []

        const isPrime = n => {
            if (n <= 1) return false
            if (n <= 3) return true
            if (n % 2 === 0 || n % 3 === 0) return false
            for (let i = 5; i * i <= n; i += 6) {
                if (n % i === 0 || n % (i + 2) === 0) return false
            }
            return true
        }

        let n = 2
        while (performance.now() - t0 < runDuration) {
            if (isPrime(n)) primes.push(n)
            n++
        }
        const end = performance.now()
        resolve({
            count: primes.length,
            largest: primes.at(-1) ?? 0,
            time: (end - t0) / 1000
        })
    })
}


function wheelSieve235(runDuration = 1000) {
    return new Promise(resolve => {
        const wheel = [1, 7, 11, 13, 17, 19, 23, 29]
        const wheelSize = 30
        const t0 = performance.now()
        const primes = [2, 3, 5]

        const blockSize = 100_000

        let count = primes.length
        let largest = 5
        let startNum = 7

        function isPrimeBasic(n) {
            const limit = Math.sqrt(n)
            for (let p of primes) {
                if (p > limit) break
                if (n % p === 0) return false
            }
            return true
        }

        while (performance.now() - t0 < runDuration) {
            for (let block = 0; block < blockSize; block++) {
                const base = startNum + block * wheelSize
                for (let w of wheel) {
                    const num = base + w - 1
                    if (num < 2) continue
                    if (isPrimeBasic(num)) {
                        primes.push(num)
                        count++
                        largest = num
                    }
                    if (performance.now() - t0 >= runDuration) break
                }
                if (performance.now() - t0 >= runDuration) break
            }
            startNum += blockSize * wheelSize
        }
        const end = performance.now()
        resolve({ count, largest, time: (end - t0) / 1000 })
    })
}

function naivePrimeCheck(runDuration = 1000) {
    return new Promise(resolve => {
        const t0 = performance.now()
        const primes = []

        function isPrime(n) {
            if (n < 2) return false
            for (let i = 2; i <= n - 1; i++) {
                if (n % i === 0) return false
            }
            return true
        }

        let n = 2
        while (performance.now() - t0 < runDuration) {
            if (isPrime(n)) primes.push(n)
            n++
        }
        const end = performance.now()
        resolve({
            count: primes.length,
            largest: primes.at(-1) ?? 0,
            time: (end - t0) / 1000
        })
    })
}

function segmentedSieve(runDuration = 1000) {
    return new Promise(resolve => {
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

        resolve({
            count: found.length,
            largest: found.at(-1),
            time: (performance.now() - t0) / 1000
        })
    })
}

(async () => {
    console.log("=== Benchmark start ===\n")

    await benchmark(simpleSieveBenchmark, "Simple Sieve")
    await benchmark(trialDivisionBasic, "Trial Division Basic")
    await benchmark(trialDivision6k1, "Trial Division 6k±1 Optimization")
    await benchmark(wheelSieve235, "Wheel Sieve 2,3,5")
    await benchmark(naivePrimeCheck, "Naive Prime Check")
    await benchmark(segmentedSieve, "Segmented Sieve")

    console.log("\n=== Benchmark end ===")
})()
