// getLineSymbols.js
import { paylines } from "./paylines.js";

export function getLineSymbols(window) {
    const reels = [window.reel1, window.reel2, window.reel3];
    const lines = [];

    for (let i = 0; i < paylines.length; i++) {
        const line = paylines[i].map(([reelIndex, rowIndex]) => {
            return reels[reelIndex][rowIndex];
        });
        lines.push(line);
    }

    return lines;
}
