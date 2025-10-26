import paytableData from "../paytable.json";

const paytable = paytableData.payouts;

export default function evaluateLine(line) {
    const counts = {};
    for (const sym of line) counts[sym] = (counts[sym] || 0) + 1;

    // ❌ If any Blank → auto lose
    if (line.includes("Blank")) {
        return { win: false, bonus: false, credits: 0, id: "blank_line" };
    }

    const allBars = line.every(s =>
        ["SingleBar", "DoubleBar", "TripleBar"].includes(s)
    );
    const uniqueBars = new Set(
        line.filter(s => ["SingleBar", "DoubleBar", "TripleBar"].includes(s))
    );

    // 🎁 Bonus Trigger (3 Bonus symbols only)
    if (line.every(s => s === "Bonus")) {
        return { win: true, bonus: true, credits: 0, id: "bonus_trigger" };
    }

    // 🚫 Any line containing Bonus (but not all 3) = no win
    if (line.includes("Bonus")) {
        return { win: false, bonus: false, credits: 0, id: "contains_bonus_no_win" };
    }

    const hasWild = line.includes("Wild");

    // 🔥 Wild Substitution — create a "virtual line" where Wilds take the value of the most common symbol
    let effectiveLine = [...line];

    if (hasWild) {
        const symbolCounts = {};
        for (const sym of line) {
            if (sym !== "Wild" && sym !== "Bonus" && sym !== "Blank") {
                symbolCounts[sym] = (symbolCounts[sym] || 0) + 1;
            }
        }
        const mostCommonSymbol = Object.entries(symbolCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

        // If no clear most common symbol, check if all non-wilds are bars
        const nonWilds = line.filter(s => s !== "Wild");
        const allNonWildBars = nonWilds.every(s => ["SingleBar", "DoubleBar", "TripleBar"].includes(s));

        if (mostCommonSymbol) {
            effectiveLine = line.map(s => (s === "Wild" ? mostCommonSymbol : s));
        } else if (allNonWildBars) {
            // treat Wild as a random bar for mixed-bar evaluation
            effectiveLine = line.map(s => (s === "Wild" ? "SingleBar" : s));
        }
    }

    for (const rule of paytable) {
        const cond = rule.condition || {};

        // 3-of-a-kind
        if (cond.symbols && effectiveLine.every(s => s === cond.symbols[0])) {
            return { win: true, bonus: !!rule.special, credits: rule.credits, id: rule.id };
        }

        // 🍒 Cherry pay
        if (cond.count && cond.count.symbol === "Cherry") {
            const c = counts["Cherry"] || 0;
            if (c === cond.count.equals && !line.includes("Bonus")) {
                return { win: true, bonus: false, credits: rule.credits, id: rule.id };
            }
        }

        // 🧱 Mixed bars: now allow Wild to act as bar
        const barsOrWild = ["SingleBar", "DoubleBar", "TripleBar", "Wild"];
        const allBarsOrWild = effectiveLine.every(s => barsOrWild.includes(s));
        const uniqueBarsOrWild = new Set(
            effectiveLine.filter(s => ["SingleBar", "DoubleBar", "TripleBar"].includes(s))
        );

        if (cond.requireAllBars && allBarsOrWild && uniqueBarsOrWild.size >= 2) {
            return { win: true, bonus: false, credits: rule.credits, id: rule.id };
        }
    }

// Default
    return { win: false, bonus: false, credits: 0, id: null };
}
