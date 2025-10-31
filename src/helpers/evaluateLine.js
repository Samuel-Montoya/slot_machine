import paytableData from "../paytable.json"

const paytable = paytableData.payouts

export default function evaluateLine(line) {
  const counts = {}
  for (const sym of line) counts[sym] = (counts[sym] || 0) + 1

  // ❌ Blank = auto lose
  if (line.includes("Blank")) {
    return { win: false, bonus: false, credits: 0, id: "blank_line" }
  }

  // 🎁 3 Bonus = trigger bonus game
  if (line.every((s) => s === "Bonus")) {
    return { win: true, bonus: true, credits: 0, id: "bonus_trigger" }
  }

  // 🎁 3 Wilds = JACKPOT
  if (line.every((s) => s === "Wild")) {
    return { win: true, bonus: false, credits: 1000, id: "three_wilds" }
  }

  // 🚫 Partial bonus = no win
  if (line.includes("Bonus")) {
    return { win: false, bonus: false, credits: 0, id: "contains_bonus_no_win" }
  }

  // 🃏 Wild substitution
  const hasWild = line.includes("Wild")
  let effectiveLine = [...line]
  if (hasWild) {
    const symbolCounts = {}
    for (const sym of line) {
      if (!["Wild", "Bonus", "Blank"].includes(sym)) {
        symbolCounts[sym] = (symbolCounts[sym] || 0) + 1
      }
    }

    const mostCommon = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    const nonWilds = line.filter((s) => s !== "Wild")
    const allNonWildBars = nonWilds.every((s) => ["SingleBar", "DoubleBar", "TripleBar"].includes(s))

    if (mostCommon) {
      effectiveLine = line.map((s) => (s === "Wild" ? mostCommon : s))
    } else if (allNonWildBars) {
      effectiveLine = line.map((s) => (s === "Wild" ? "SingleBar" : s))
    }
  }

  let result = { win: false, bonus: false, credits: 0, id: null }

  // 🏆 STEP 1: High priority - exact 3-of-a-kind
  for (const rule of paytable) {
    const cond = rule.condition || {}
    if (cond.symbols && effectiveLine.every((s) => s === cond.symbols[0])) {
      result = { win: true, bonus: !!rule.special, credits: rule.credits, id: rule.id }
      break
    }
  }

  // 🧱 STEP 3: Mixed bars (only if no higher-tier bar win)
  if (!result.win) {
    const allBars = effectiveLine.every((s) => ["SingleBar", "DoubleBar", "TripleBar"].includes(s))
    const uniqueBars = new Set(effectiveLine.filter((s) => ["SingleBar", "DoubleBar", "TripleBar"].includes(s)))

    if (allBars && uniqueBars.size >= 2) {
      const mixedBarRule = paytable.find((r) => r.id === "three_mixed_bars")
      if (mixedBarRule) {
        result = { win: true, bonus: false, credits: mixedBarRule.credits, id: mixedBarRule.id }
      }
    }
  }

  // 💥 STEP 4: Wild Multiplier (×3)
  if (result.win && hasWild && result.credits > 0) {
    result.credits *= 3
    result.id += "_wildx3"
  }

  return result
}
