import React, { useRef, useState } from "react";
import "./App.css";

import shuffleArray from "./helpers/array.js";
import getImage from "./helpers/images.js";
import evaluateAllLines from "./helpers/evaluateAllLines.js";
import spinReels from "./helpers/spin.js";
import { reel1 as reelStrip1, reel2 as reelStrip2, reel3 as reelStrip3 } from "./helpers/reels.js";
import { sound } from "./helpers/soundController.js";
import { animateWin } from "./helpers/animateWin.js";

const SYMBOL_HEIGHT = 100;
const VISIBLE_COUNT = 3;
const pitches = [0.98, 0.99, 1, 1.01, 1.02];
const BASE_SPIN_SPEED = 7000; // pixels per second — consistent spin speed


export default function App() {
    const [money, setMoney] = useState(100);
    const [winAmount, setWinAmount] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [reels, setReels] = useState([reelStrip1, reelStrip2, reelStrip3]);

    const reelRefs = [useRef(null), useRef(null), useRef(null)];
    const currentOutcomeRef = useRef(null);
    const winAnimationRef = useRef(null);
    const lastWinRef = useRef({ oldMoney: 0, winnings: 0 });

    const rafRefs = useRef([null, null, null]);
    const stopTimeouts = useRef([]);

    function clearScheduledStops() {
        stopTimeouts.current.forEach((t) => t && clearTimeout(t));
        stopTimeouts.current = [];
    }

    function cancelAllRafs() {
        rafRefs.current.forEach((id, i) => {
            if (id) {
                cancelAnimationFrame(id);
                rafRefs.current[i] = null;
            }
        });
    }

    function resetReelsPosition() {
        for (let i = 0; i < 3; i++) {
            const el = reelRefs[i].current;
            if (el) {
                el.style.transition = "none";
                el.style.transform = "translateY(0)";
            }
        }
    }

    function spinReel(el, reelLength, durationMs, index, extraLoops = 0) {
        if (!el) return;

        // Each symbol height
        const symbolHeight = SYMBOL_HEIGHT;

        // Total visible reel distance for one full reel
        const reelDistance = reelLength * symbolHeight;

        // Determine how far this reel should spin.
        // Each loop = one full reel length of symbols.
        const totalDistance = reelDistance * (3 + extraLoops); // 3 loops baseline + extra if suspense

        // Compute duration based on constant speed so all reels look same speed
        const duration = (totalDistance / BASE_SPIN_SPEED) * 1000;

        el.style.transition = "none";
        el.style.transform = "translateY(0)";

        // trigger reflow before animating
        el.offsetHeight;

        el.style.transition = `transform ${duration}ms linear`;
        el.style.transform = `translateY(-${totalDistance}px)`;
    }

    function forceStopToResult(index, reelArray) {
        const el = reelRefs[index].current;
        if (!el || !reelArray) return;
        if (rafRefs.current[index]) cancelAnimationFrame(rafRefs.current[index]);
        const stopOffset = Math.max(0, reelArray.length - VISIBLE_COUNT) * SYMBOL_HEIGHT;
        el.style.transition = "none";
        el.style.transform = `translateY(-${stopOffset}px)`;
    }

    const stopReel = (index, reelArray) => {
        const el = reelRefs[index].current;
        if (!el) return;
        el.classList.remove("spinning");
        forceStopToResult(index, reelArray);
    };

    /** Shared payout handler */
    function handlePayout(final, oldMoney) {
        const winnings = final.totalCredits;
        if (winnings <= 0) return;

        const winTrack = sound("counting");

        const newMoney = oldMoney + winnings;
        lastWinRef.current = { oldMoney, winnings };

        // Keep both controllers in one object so they can be canceled together
        const payoutController = { cancelled: false };

        const animWinnings = animateWin({
            from: 0,
            to: winnings,
            onUpdate: (val) => {
                if (!payoutController.cancelled) setWinAmount(val);
            },
            onComplete: () => {
                if (!payoutController.cancelled) setWinAmount(winnings);
            },
        });

        const animMoney = animateWin({
            from: oldMoney,
            to: newMoney,
            onUpdate: (val) => {
                if (!payoutController.cancelled) setMoney(val);
            },
            onComplete: () => {
                if (payoutController.cancelled) return;
                setMoney(newMoney);
                setWinAmount(winnings);
                winTrack.stop();
                sound("finished_counting")
                winAnimationRef.current = null;
            },
        });

        payoutController.cancel = () => {
            payoutController.cancelled = true;
            animWinnings.cancel?.();
            animMoney.cancel?.();
            setMoney(newMoney);
            setWinAmount(winnings);
            winTrack.stop();
            sound("finished_counting")
            winAnimationRef.current = null;
        };

        winAnimationRef.current = payoutController;
    }

    async function handleClick() {

        // --- SKIP WIN ANIMATION MODE ---
        if (winAnimationRef.current) {
            winAnimationRef.current.cancel?.();
            return;
        }

        // --- FAST SKIP SPIN MODE ---
        if (spinning) {
            clearScheduledStops();
            cancelAllRafs();

            const outcomeData = currentOutcomeRef.current;
            if (!outcomeData) {
                setSpinning(false);
                return;
            }

            const instantReels = [
                [...reelStrip1, ...outcomeData.window.reel1],
                [...reelStrip2, ...outcomeData.window.reel2],
                [...reelStrip3, ...outcomeData.window.reel3],
            ];
            setReels(instantReels);
            for (let i = 0; i < 3; i++) forceStopToResult(i, instantReels[i]);

            sound("spin").stop();
            sound("hit")

            const final = evaluateAllLines(outcomeData.window);
            if (!winAnimationRef.current) handlePayout(final, money - 9);

            setSpinning(false);
            return;
        }

        // --- NORMAL SPIN MODE ---
        setWinAmount(0);
        sound("spin")
        setSpinning(true);
        setMoney((m) => m - 9);
        resetReelsPosition();

        const outcomeData = spinReels();
        currentOutcomeRef.current = outcomeData;

        const final = evaluateAllLines(outcomeData.window, true);
        if (final.results.some((r) => r.bonus)) sound("bonus")

        const newReels = [
            [...reelStrip1, ...outcomeData.window.reel1],
            [...reelStrip2, ...outcomeData.window.reel2],
            [...reelStrip3, ...outcomeData.window.reel3],
        ];
        setReels(newReels);

        const sortedPitches = shuffleArray(pitches);

        // Check for suspense spin
        const suspenseSpin =
            outcomeData.window.reel1.includes("Bonus") &&
            outcomeData.window.reel2.includes("Bonus");

// Baseline: all reels same speed, but reel3 travels farther for suspense
        spinReel(reelRefs[0].current, newReels[0].length, 1000, 0);
        spinReel(reelRefs[1].current, newReels[1].length, 1500, 1);
        spinReel(reelRefs[2].current, newReels[2].length, 2000, 2, suspenseSpin ? 2 : 0);

        requestAnimationFrame(() => {
            for (const ref of reelRefs) {
                if (ref.current) ref.current.classList.add("spinning");
            }
        });

// Timed stops
        const t0 = setTimeout(() => {
            stopReel(0, newReels[0]);
            if (outcomeData.window.reel1.includes("Bonus")) sound("bonus1")
            else sound("hit", { rate: sortedPitches[0] });
        }, 1000);

        const t1 = setTimeout(() => {
            stopReel(1, newReels[1]);
            if (outcomeData.window.reel2.includes("Bonus")) sound("bonus2")
            else sound("hit", { rate: sortedPitches[1] });
        }, 1500);

        // 🧠 Suspense logic: reel 3 spins longer if first 2 reels have Bonus
        const reel3StopTime = suspenseSpin ? 3000 : 2000;

        const t2 = setTimeout(() => {
            stopReel(2, newReels[2]);
            if (outcomeData.window.reel3.includes("Bonus")) {
                sound("bonus3", { rate: 1.1 });
            } else {
                sound("hit", { rate: sortedPitches[1] });
            }

            // 👇 Small delay before showing win animation
            const postSpinDelay = 400; // milliseconds — adjust as you like
            setTimeout(() => {
                handlePayout(final, money - 9);
                setSpinning(false);
                currentOutcomeRef.current = null;
            }, postSpinDelay);
        }, reel3StopTime);


        stopTimeouts.current = [t0, t1, t2];
    }

    // --- UI ---
    return (
        <div style={{ padding: 20 }}>
            <button disabled={false} onClick={handleClick}>
                {spinning ? "SPIN / TAP TO SKIP" : "SPIN"}
            </button>

            <div className="reels_wrapper" style={{ marginTop: 20 }}>
                {reels.map((reel, i) => (
                    <Reel key={i} ref={reelRefs[i]} reel={reel} />
                ))}
            </div>

            <div className="money-display">
                <div className="stat">
                    <span className="label">CREDITS</span>
                    <span className="value">${money}</span>
                </div>
                <div className="stat">
                    <span className="label">WIN</span>
                    <span className="value win">${winAmount}</span>
                </div>
            </div>
        </div>
    );
}

const Reel = React.forwardRef(({ reel, spinning }, ref) => {
    // Duplicate symbols twice for seamless loop
    const doubledReel = [...reel, ...reel, ...reel, ...reel, ...reel];

    return (
        <div className="reel_container">
            <div className="reel_inner">
                <div
                    ref={ref}
                    className={`reel_strip ${spinning ? "spinning" : ""}`}
                >
                    {doubledReel.map((symbol, i) =>
                        symbol === "Blank" ? (
                            <div key={i} className="symbol blank" />
                        ) : (
                            <img key={i} src={getImage(symbol)} className="symbol" alt={symbol} />
                        )
                    )}
                </div>
            </div>
        </div>
    );
});