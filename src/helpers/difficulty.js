export default function generateWeightedIndex(reelStrip, rtpSetting = 1.0) {
  const weights = reelStrip.map((symbol) => {
    switch (symbol) {
      case "Blank":
        return 5
      case "SingleBar":
        return 2
      case "DoubleBar":
        return 1.5
      case "TripleBar":
        return 1
      case "Cherry":
        return 0.5
      case "Seven":
        return 0.5
      case "Bonus":
        return 0.9
      case "Wild":
        return 1000
      default:
        return 1
    }
  })

  const totalWeight = weights.reduce((a, b) => a + b, 0)
  const roll = Math.random() * totalWeight
  let cumulative = 0

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i]
    if (roll <= cumulative) return i
  }
}
