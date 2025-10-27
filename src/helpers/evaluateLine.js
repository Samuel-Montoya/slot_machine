import paytableData from "../paytable.json"
const paytable = paytableData.payouts

export default function evaluateLine(line) {
  const counts = {}
  for (const sym of line) counts[sym] = (counts[sym] || 0) + 1

  // ❌ Blank = no win
  if (line.includes("Blank")) {
    return { win: false, bonus: false, credits: 0, id: "blank_line" }
  }

  // 🎁 3 Bonus = bonus game
  if (line.every((s) => s === "Bonus")) {
    return { win: true, bonus: true, credits: 0, id: "bonus_trigger" }
  }

  // 🚫 Partial bonus = no win
  if (line.includes("Bonus")) {
    return { win: false, bonus: false, credits: 0, id: "contains_bonus_no_win" }
  }

  // 🃏 Wild substitution
  let effectiveLine = [...line]
  if (line.includes("Wild")) {
    const symbolCounts = {}
    for (const sym of line) {
      if (!["Wild", "Bonus", "Blank"].includes(sym)) {
        symbolCounts[sym] = (symbolCounts[sym] || 0) + 1
      }
    }
    const mostCommonSymbol = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    if (mostCommonSymbol) {
      effectiveLine = line.map((s) => (s === "Wild" ? mostCommonSymbol : s))
    }
  }

  // ✅ Check 3-of-a-kind wins
  for (const rule of paytable) {
    const cond = rule.condition || {}
    if (cond.symbols && effectiveLine.every((s) => s === cond.symbols[0])) {
      return { win: true, bonus: !!rule.special, credits: rule.credits, id: rule.id }
    }
  }

  return { win: false, bonus: false, credits: 0, id: null }
}
