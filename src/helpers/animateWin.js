// helpers/animateWin.js
// Simple count-up: increments by 1 every 200ms (adjusts speed for large wins)

export function animateWin({ from = 0, to = 0, onUpdate, onComplete }) {
    const diff = Math.floor(to - from);
    if (diff <= 0) {
        onUpdate?.(to);
        onComplete?.();
        return { cancel: () => {}, finish: () => {} };
    }

    // adjust interval speed based on total diff
    let interval = 90;
    // if (diff > 20) interval = 100;
    // if (diff > 100) interval = 50;
    // if (diff > 500) interval = 25;

    let current = from;
    let intervalId = null;
    let cancelled = false;

    const tick = () => {
        if (cancelled) return;
        current += 1;
        if (current >= to) {
            current = to;
            onUpdate?.(current);
            clearInterval(intervalId);
            onComplete?.();
            return;
        }
        onUpdate?.(current);
    };

    intervalId = setInterval(tick, interval);

    return {
        cancel() {
            cancelled = true;
            clearInterval(intervalId);
        },
        finish() {
            cancelled = true;
            clearInterval(intervalId);
            onUpdate?.(to);
            onComplete?.();
        },
    };
}
