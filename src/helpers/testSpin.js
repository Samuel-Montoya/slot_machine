// testEvaluation.js
import spinReels from "./spin.js";
import evaluateAllLines from "./evaluateAllLines.js";


export default function () {
    const {window} = spinReels();
    const outcome = evaluateAllLines(window);

    console.log("\nLine Results:");
    outcome.results.forEach(r => {
        console.log(
            `Line ${r.line}: ${r.symbols.join(" | ")} → ${r.win ? `${r.credits} credits (${r.id})` : "No Win"}`
        );
    });

    if (outcome.bonusTriggered) {
        console.log("\n*** BONUS GAME TRIGGERED ***");
    } else {
        console.log(`\nTotal Credits Won: ${outcome.totalCredits}`);
    }

    return outcome;
}
