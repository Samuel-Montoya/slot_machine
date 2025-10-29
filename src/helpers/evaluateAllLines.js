import evaluateLine from "./evaluateLine.js"
import { getLineSymbols } from "./getLineSymbols.js"
import { paylines } from "./paylines.js"
import paytableData from "../paytable.json"

const paytable = paytableData.payouts

export default function evaluateAllLines(window, shouldLog = false) {
  const lines = getLineSymbols(window)
  const results = []
  let totalCredits = 0
  let bonusTriggered = false
  let isJackpot = false

  // Evaluate all paylines normally
  for (let i = 0; i < lines.length; i++) {
    const res = evaluateLine(lines[i])
    results.push({
      line: i + 1,
      symbols: lines[i],
      positions: paylines[i], // position indexes for highlight
      ...res
    })

    if (res.bonus) bonusTriggered = true
    if (res.id === "three_wilds") isJackpot = true
    totalCredits += res.credits
  }

  // If bonus triggered → ignore line wins
  if (bonusTriggered) totalCredits = 0

  // 🍒 GLOBAL CHERRY HANDLING
  const allSymbols = Object.values(window).flat()
  const cherryCount = allSymbols.filter((s) => s === "Cherry").length

  let cherryCredits = 0
  const cherryRules = paytable.filter((p) => p.condition?.count?.symbol === "Cherry")

  for (const rule of cherryRules) {
    if (cherryCount === rule.condition.count.equals) {
      cherryCredits = rule.credits
    }
  }

  // ✅ If we have cherries, find their positions and make them part of the results
  if (cherryCount > 0 && !bonusTriggered && cherryCredits > 0) {
    totalCredits += cherryCredits

    // find exact positions of cherries for visual highlight
    const cherryPositions = []
    Object.keys(window).forEach((reelKey, reelIndex) => {
      window[reelKey].forEach((symbol, rowIndex) => {
        if (symbol === "Cherry") {
          cherryPositions.push([reelIndex, rowIndex])
        }
      })
    })

    results.push({
      line: 0, // 0 = global cherry “line”
      symbols: Array(cherryCount).fill("Cherry"),
      positions: cherryPositions,
      win: true,
      bonus: false,
      credits: cherryCredits,
      id: `global_cherries_${cherryCount}`
    })
  }

  const winningLines = results.filter((r) => {
    if (isJackpot) {
      return r.id === "three_wilds"
    }
    if (bonusTriggered) return false
    return r.win && r.credits > 0
  })

  if (isJackpot) totalCredits = paytable.find((p) => p.id === "three_wilds").credits

  if (shouldLog) {
    console.log("Line Results:")
    winningLines.forEach((r) => {
      console.log(`Line ${r.line}: ${r.symbols.join(" | ")} → ${r.credits} credits (${r.id})`)
    })
    console.log(`Total Credits Won: ${totalCredits}`)
  }

  return {
    totalCredits,
    bonusTriggered,
    results,
    winningLines,
    hasWins: winningLines.length > 0,
    winningPositions: winningLines.flatMap((line) =>
      line.positions.map((pos) => ({
        reel: pos.reel,
        row: pos.row,
        payline: line.line,
        credits: line.credits,
        id: line.id
      }))
    )
  }
}
