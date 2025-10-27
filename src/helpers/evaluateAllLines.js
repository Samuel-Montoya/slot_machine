// evaluateAllLines.js
import evaluateLine from "./evaluateLine.js";
import { getLineSymbols } from "./getLineSymbols.js";
import { paylines } from "./paylines.js";

const log = (results, bonusTriggered, totalCredits) => {
    console.log("\nLine Results:");
    results.forEach(r => {
        console.log(
            `Line ${r.line}: ${r.symbols.join(" | ")} → ${
                r.win ? `${r.credits} credits (${r.id})` : "No Win"
            }`
        );
    });

    if (bonusTriggered) {
        console.log("\n*** BONUS GAME TRIGGERED ***");
    } else {
        console.log(`\nTotal Credits Won: ${totalCredits}`);
    }
};

export default function evaluateAllLines(window, shouldLog = false) {
    const lines = getLineSymbols(window);
    const results = [];
    let totalCredits = 0;
    let bonusTriggered = false;

    // ✅ Evaluate all paylines
    for (let i = 0; i < lines.length; i++) {
        const res = evaluateLine(lines[i]);
        results.push({
            line: i + 1,
            symbols: lines[i],
            positions: paylines[i], // [row per reel]
            ...res
        });

        if (res.bonus) bonusTriggered = true;
        totalCredits += res.credits;
    }

    // ✅ If bonus triggered, ignore all normal line wins
    if (bonusTriggered) totalCredits = 0;

    // ✅ Global Cherry payout (based on the full visible window)
    const allSymbols = Object.values(window).flat();
    const cherryCount = allSymbols.filter(s => s === "Cherry").length;

    if (cherryCount > 0) {
        let cherryCredits = 0;
        if (cherryCount === 1) cherryCredits = 2;
        else if (cherryCount === 2) cherryCredits = 5;
        else if (cherryCount >= 3) cherryCredits = 10;

        if (!bonusTriggered) {
            totalCredits += cherryCredits;
            results.push({
                line: null,
                symbols: [],
                positions: [],
                win: true,
                bonus: false,
                credits: cherryCredits,
                id: `global_cherries_${cherryCount}`
            });
        }
    }

    const winningLines = results.filter(r => r.win && r.credits > 0);

    if (shouldLog)
        console.log("Total Credits:", totalCredits, "Bonus:", bonusTriggered, "Results:", results);

    // ✅ Return results (preserving your original structure)
    return {
        totalCredits,
        bonusTriggered,
        results,
        winningLines,
        hasWins: winningLines.length > 0,
        winningPositions: winningLines
            .filter(line => line.positions && line.positions.length)
            .map(line =>
                line.positions.map((rowIndex, reelIndex) => ({
                    reel: reelIndex,
                    row: rowIndex,
                    payline: line.line,      // line number
                    credits: line.credits,   // payout
                    id: line.id              // payout type
                }))
            )
    };
}
