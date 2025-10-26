import spinReels from "./spin.js";

export default async function startSpin(onStopCallback) {
    const { window, indexes } = spinReels();

    // Start all reels spinning visually
    startReelSpin(1);
    startReelSpin(2);
    startReelSpin(3);

    // Stop each reel at different times
    setTimeout(() => stopReel(1, indexes[0], onStopCallback), 1000); // 1s
    setTimeout(() => stopReel(2, indexes[1], onStopCallback), 1500); // 1.5s
    setTimeout(() => stopReel(3, indexes[2], onStopCallback), 2000); // 2s

    return window; // return final window for evaluation when all stopped
}

function startReelSpin(id) {
    console.log(`🎡 Reel ${id} started spinning`);
    // in your React UI: setReelState("spinning")
}

function stopReel(id, stopIndex, onStopCallback) {
    console.log(`🛑 Reel ${id} stopped at index ${stopIndex}`);
    // in your React UI: setReelState("stopped") and display the correct window slice
    if (onStopCallback) onStopCallback(id);
}
