import allMoney from "./money.js"

function weightedRandomUnique(items, count) {
  const results = []
  const pool = [...items]
  for (let c = 0; c < count && pool.length > 0; c++) {
    const totalWeight = pool.reduce((sum, i) => sum + i.weight, 0)
    let r = Math.random() * totalWeight
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight
      if (r <= 0) {
        results.push(pool[i])
        pool.splice(i, 1)
        break
      }
    }
  }
  return results
}

function calculateRoundValue(round) {
  let total = 0
  let multiplier = 1
  round.forEach((it) => {
    if (it.type === "cash") total += it.value
    if (it.type === "multiplier") multiplier *= it.value
  })
  return { total: total * multiplier, multiplier }
}

function getFairAdvice(total, roundIndex, totalRounds, prevTotal) {
  const roundNum = roundIndex + 1
  const thresholds = [80, 85, 90, 0]
  const minTake = thresholds[roundIndex]

  if (roundNum === totalRounds) return "TAKE OFFER"
  if (total >= 150) return "TAKE OFFER"
  if (total < 50) return "TRY AGAIN"
  if (prevTotal && total >= prevTotal * 1.1) return "TAKE OFFER"
  if (total >= minTake) return "TAKE OFFER"
  return "TRY AGAIN"
}

export function runBonus({ rounds = 4 } = {}) {
  const results = []
  let prevTotal = 0

  for (let i = 0; i < rounds; i++) {
    const numPicks = Math.floor(Math.random() * 2) + 3 // 3–4 picks per round
    const picks = weightedRandomUnique(allMoney, numPicks)

    // Separate multipliers from cash
    const multipliers = picks.filter((p) => p.type === "multiplier")
    const cashPicks = picks.filter((p) => p.type === "cash")

    // Sort cash picks from low to high
    cashPicks.sort((a, b) => a.value - b.value)

    // Place multiplier(s) at the end of the list
    const orderedPicks = [...cashPicks, ...multipliers]

    const { total, multiplier } = calculateRoundValue(orderedPicks)
    const advice = getFairAdvice(total, i, rounds, prevTotal)
    prevTotal = total

    results.push({
      round: i + 1,
      picks: orderedPicks,
      multiplier,
      total,
      advice
    })
  }

  return results
}
