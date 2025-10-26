// evaluateAllLines.js
import evaluateLine from "./evaluateLine.js";
import { getLineSymbols } from "./getLineSymbols.js";

const log = (results, bonusTriggered, totalCredits) => {
    console.log("\nLine Results:");
    results.forEach(r => {
        console.log(
            `Line ${r.line}: ${r.symbols.join(" | ")} → ${r.win ? `${r.credits} credits (${r.id})` : "No Win"}`
        );
    });

    if (bonusTriggered) {
        console.log("\n*** BONUS GAME TRIGGERED ***");
    } else {
        console.log(`\nTotal Credits Won: ${totalCredits}`);
    }
}

export default function evaluateAllLines(window, shouldLog) {
    const lines = getLineSymbols(window);
    const results = [];
    let totalCredits = 0;
    let bonusTriggered = false;

    for (let i = 0; i < lines.length; i++) {
        const res = evaluateLine(lines[i]);
        results.push({ line: i + 1, symbols: lines[i], ...res });

        if (res.bonus) bonusTriggered = true;
        totalCredits += res.credits;
    }

    // If a bonus line triggers, all line wins are ignored (per rule)
    if (bonusTriggered) {
        totalCredits = 0;
    }

    if(shouldLog) log(results, bonusTriggered, totalCredits)

    return { totalCredits, bonusTriggered, results };
}
