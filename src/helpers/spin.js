import { reel1, reel2, reel3 } from "./reels.js";
import generateWeightedIndex from "./difficulty.js";

const rtpSetting = 1.0; // 1.0 = standard, 0.85 = tight, 1.15 = loose

// Helper: get the 3 visible symbols (top, middle, bottom)
function getWindow(reel, stopIndex) {
    const symbols = reel;
    const len = symbols.length;
    return [
        symbols[(stopIndex - 1 + len) % len], // top
        symbols[stopIndex],                   // middle
        symbols[(stopIndex + 1) % len]        // bottom
    ];
}

export default function spinReels() {
    // Pick weighted stops
    const index1 = generateWeightedIndex(reel1, rtpSetting);
    const index2 = generateWeightedIndex(reel2, rtpSetting);
    const index3 = generateWeightedIndex(reel3, rtpSetting);

    // Build the 3×3 visible grid
    const window = {
        reel1: getWindow(reel1, index1),
        reel2: getWindow(reel2, index2),
        reel3: getWindow(reel3, index3)
    };

    // Build visual grid (rows top → bottom)
    const topRow = [window.reel1[0], window.reel2[0], window.reel3[0]];
    const midRow = [window.reel1[1], window.reel2[1], window.reel3[1]];
    const botRow = [window.reel1[2], window.reel2[2], window.reel3[2]];

    console.log("🎰  SLOT WINDOW  🎰");
    console.log("────────────────────────────");
    console.log(`  ${topRow.join(" | ")}   ← Top`);
    console.log(`  ${midRow.join(" | ")}   ← Middle`);
    console.log(`  ${botRow.join(" | ")}   ← Bottom`);
    console.log("────────────────────────────");


    return {
        window,
        indexes: [index1, index2, index3]  // so we know where to stop each reel
    };
}
