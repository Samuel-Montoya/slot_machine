import React, {useEffect, useRef, useState} from "react";
import "./App.css";
import 'animate.css'

import getImage from "./helpers/images.js";
import evaluateAllLines from "./helpers/evaluateAllLines.js";
import spinReels from "./helpers/spin.js";
import {reel1 as reelStrip1, reel2 as reelStrip2, reel3 as reelStrip3} from "./helpers/reels.js";
import {randomizeSpinSound, sound} from "./helpers/soundController.js";
import {animateWin} from "./helpers/animateWin.js";
import shuffleArray from "./helpers/array.js";

const SYMBOL_HEIGHT = 100;
const VISIBLE_COUNT = 3;
const BASE_SPIN_SPEED = 7000; // pixels per second — consistent spin speed

export const formatCash = (cash) => cash.toFixed(2);

export const colors = {
    1: "#ff00004a",
    2: "#6495ed85",
    3: "#0080006b",
    4: "#ff69b478",
    5: "#0000ff73",
    6: "#daa5206e",
    7: "#80008052",
    8: "#ffa5004d",
    9: "#3cb37175"
};


export default function App() {
    const [money, setMoney] = useState(100);
    const [winAmount, setWinAmount] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [reels, setReels] = useState([reelStrip1, reelStrip2, reelStrip3]);
    const [paylines, setPaylines] = useState([])
    const [payPositions, setPayPositions] = useState([])

    const reelRefs = [useRef(null), useRef(null), useRef(null)];
    const currentOutcomeRef = useRef(null);
    const winAnimationRef = useRef(null);
    const lastWinRef = useRef({oldMoney: 0, winnings: 0});

    const rafRefs = useRef([null, null, null]);
    const stopTimeouts = useRef([]);

    const [showGreen, setShowGreen] = useState(false)

    function clearScheduledStops() {
        stopTimeouts.current.forEach((t) => t && clearTimeout(t));
        stopTimeouts.current = [];
    }

    function cancelAllRefs() {
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

    function handlePayout(final, oldMoney) {
        const winnings = final.totalCredits;
        if (winnings <= 0) return;

        const winTrack = sound("counting");
        winTrack.play()

        const newMoney = oldMoney + winnings;
        lastWinRef.current = {oldMoney, winnings};

        // Keep both controllers in one object so they can be canceled together
        const payoutController = {cancelled: false};

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
                sound("finished_counting").play()
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
            sound("finished_counting").play()
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
            sound("spin").stop()
            sound("tone").stop()
            clearScheduledStops();
            cancelAllRefs();

            const outcomeData = currentOutcomeRef.current;
            if (!outcomeData) {
                setSpinning(false);
                return;
            }
            if (outcomeData.window.reel3.includes("Bonus")) {
                sound("bonus3").play()
            } else {
                sound("hit3").play()
            }

            const instantReels = [
                [...reelStrip1, ...outcomeData.window.reel1],
                [...reelStrip2, ...outcomeData.window.reel2],
                [...reelStrip3, ...outcomeData.window.reel3],
            ];
            setReels(instantReels);
            for (let i = 0; i < 3; i++) forceStopToResult(i, instantReels[i]);

            const final = evaluateAllLines(outcomeData.window);
            if (!winAnimationRef.current) handlePayout(final, money - 9);

            setSpinning(false);
            return;
        }

        // --- NORMAL SPIN MODE ---
        setPayPositions([])
        setPaylines([])
        setShowGreen(false)
        setWinAmount(0);
        sound("click").play()
        randomizeSpinSound();
        sound("spin").play()
        sound("tone").play()
        setSpinning(true);
        setMoney((m) => m - 9);
        resetReelsPosition();

        const outcomeData = spinReels();
        currentOutcomeRef.current = outcomeData;

        const final = evaluateAllLines(outcomeData.window, true);
        setPaylines(final.winningLines)
        setPayPositions(final.winningPositions)
        const newReels = [
            [...reelStrip1, ...outcomeData.window.reel1],
            [...reelStrip2, ...outcomeData.window.reel2],
            [...reelStrip3, ...outcomeData.window.reel3],
        ];
        setReels(newReels);

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

        // 🧠 Suspense logic: reel 3 spins longer if first 2 reels have Bonus
        const reel3StopTime = suspenseSpin ? 3500 : 2000;

        const anticipation = sound("anticipation")

// Timed stops
        const t0 = setTimeout(() => {
            stopReel(0, newReels[0]);
            if (outcomeData.window.reel1.includes("Bonus")) sound("bonus1").play()
            else sound("hit1").play();
        }, 1000);

        const t1 = setTimeout(() => {
            stopReel(1, newReels[1]);
            if (outcomeData.window.reel2.includes("Bonus")) {
                sound("bonus2").play()
            } else sound("hit2").play();

            if (suspenseSpin) {
                anticipation.play()
                setShowGreen(true)
            }
        }, 1500);


        const t2 = setTimeout(() => {
            stopReel(2, newReels[2]);
            if (outcomeData.window.reel3.includes("Bonus")) {
                sound("bonus3").play()
                if (!final.bonusTriggered) setShowGreen(false)
                else sound("bell").play()
            } else {
                sound("hit3").play()
                setShowGreen(false)
            }

            if (suspenseSpin) anticipation.stop()

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

    useEffect(() => {
        if (!payPositions.length || spinning) return;

        let current = 0;
        let highlightInterval;

        const highlightLine = (positions) => {
            // 🧹 clear previous highlights
            document.querySelectorAll(".symbol").forEach(el => {
                if (el) {
                    el.classList.remove("animate__animated", "animate__pulse", "animate__infinite")
                    el.style.backgroundColor = "transparent"
                }
            });
            // 🎯 highlight symbols for this line
            positions.forEach(pos => {
                const el = document.getElementById(`reel_${pos.reel}_pos_${pos.row[1] + 49}`);
                if (el) {
                    el.classList.add("animate__animated", "animate__pulse", "animate__infinite")
                    el.style.backgroundColor = colors[pos.payline]

                }
                setPaylines([{line: pos.payline, text: `Line ${pos.payline} - ${pos.id.split('_').join(' ')} pays ${pos.credits} credits`}])
            });
        };

        // start cycling
        highlightLine(payPositions[current]);

        highlightInterval = setInterval(() => {
            current = (current + 1) % payPositions.length; // 🔁 loop forever
            highlightLine(payPositions[current]);
        }, 1000); // 1 second per line

        // 🧼 cleanup when spinning again
        return () => {
            clearInterval(highlightInterval);
            document.querySelectorAll(".symbol").forEach(el => {
                if (el) {
                    el.classList.remove("animate__animated", "animate__pulse", "animate__infinite")
                    el.style.backgroundColor = "transparent"
                }
            });
        };
    }, [payPositions, spinning]);

    // --- UI ---
    return (
        <div className="slot_wrapper">
            <div className="reels_wrapper" style={{marginTop: 20}}>
                <section className="pay_lines">
                    <div className="pay_line">
                        <section className={!spinning && paylines.find(p => p.line === 4) ? 'animate__animated animate__flash animate__infinite' : ''}>
                            <h1 style={{backgroundColor: 'hotpink'}}>4</h1>
                            <div style={{borderRight: "10px solid hotpink"}}/>
                        </section>
                        <section className={!spinning && paylines.find(p => p.line === 2) ? 'animate__animated animate__flash animate__infinite' : ''}>
                            <h1 style={{backgroundColor: 'cornflowerblue'}}>2</h1>
                            <div style={{borderRight: "10px solid cornflowerblue"}}/>
                        </section>
                        <section className={!spinning && paylines.find(p => p.line === 9) ? 'animate__animated animate__flash animate__infinite' : ''}>
                            <h1 style={{backgroundColor: 'mediumseagreen'}}>9</h1>
                            <div style={{borderRight: "10px solid mediumseagreen"}}/>
                        </section>
                    </div>
                    <div className="pay_line">
                        <section className={!spinning && paylines.find(p => p.line === 6) ? 'animate__animated animate__flash animate__infinite' : ''}>
                            <h1 style={{backgroundColor: 'goldenrod'}}>6</h1>
                            <div style={{borderRight: "10px solid goldenrod"}}/>
                        </section>
                        <section className={!spinning && paylines.find(p => p.line === 1) ? 'animate__animated animate__flash animate__infinite' : ''}>
                            <h1 style={{backgroundColor: 'red'}}>1</h1>
                            <div style={{borderRight: "10px solid red"}}/>
                        </section>
                        <section className={!spinning && paylines.find(p => p.line === 7) ? 'animate__animated animate__flash animate__infinite' : ''}>
                            <h1 style={{backgroundColor: 'purple'}}>7</h1>
                            <div style={{borderRight: "10px solid purple"}}/>
                        </section>
                    </div>
                    <div className="pay_line">
                        <section className={!spinning && paylines.find(p => p.line === 8) ? 'animate__animated animate__flash animate__infinite' : ''}>
                            <h1 style={{backgroundColor: 'orange'}}>8</h1>
                            <div style={{borderRight: "10px solid orange"}}/>
                        </section>
                        <section className={!spinning && paylines.find(p => p.line === 3) ? 'animate__animated animate__flash animate__infinite' : ''}>
                            <h1 style={{backgroundColor: 'green'}}>3</h1>
                            <div style={{borderRight: "10px solid green"}}/>
                        </section>
                        <section className={!spinning && paylines.find(p => p.line === 5) ? 'animate__animated animate__flash animate__infinite' : ''}>
                            <h1 style={{backgroundColor: 'blue'}}>5</h1>
                            <div style={{borderRight: "10px solid blue"}}/>
                        </section>
                    </div>
                </section>
                {reels.map((reel, i) => (
                    <React.Fragment key={i}>
                        <Reel key={i} ref={reelRefs[i]} reel={reel} showGreen={showGreen} reelIndex={i}/>
                        {i < 2 && (
                            <section className="reel_lines">
                                <hr/>
                                <hr/>
                                <hr/>
                            </section>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="info_wrapper">
                <section className="info_box">
                    <h1>LINES</h1>
                    <div>9</div>
                </section>

                <section className="info_box larger">
                <h1>CASH</h1>
                    <div>${formatCash(money)}</div>
                </section>

                <section className="spin_button" onClick={handleClick}>
                    <h1>$1</h1>
                    <h2>SPIN</h2>
                </section>

                <section className="info_box larger">
                    <h1>WIN</h1>
                    <div>
                        $
                        {!spinning
                            ? formatCash(winAmount)
                            : "0.00"}
                    </div>
                </section>

                <section className="info_box">
                    <h1>BET</h1>
                    <div>9</div>
                </section>
            </div>
             <h1 style={{fontFamily: 'sans-serif', marginTop: 5, visibility: paylines.length !== 0 ? 'visible' : 'hidden', height: 10, fontSize: '0.6rem', color: colors[paylines[0]?.line]}}>{paylines[0]?.text}</h1>

        </div>
    );
}

const Reel = React.forwardRef(({reel, spinning, showGreen, reelIndex}, ref) => {
    // Duplicate symbols twice for seamless loop
    const doubledReel = [...reel, ...reel, ...reel, ...reel, ...reel];

    return (
        <div className={`reel_container ${showGreen ? 'green_background' : ''}`}>
            <div className="reel_inner">
                <div
                    ref={ref}
                    className={`reel_strip ${spinning ? "spinning" : ""}`}
                >
                    {doubledReel.map((symbol, i) =>
                        symbol === "Blank" ? (
                            <div key={i} className="symbol blank"/>
                        ) : (
                            <img key={i} src={getImage(symbol)} className="symbol" alt={symbol} id={`reel_${reelIndex}_pos_${i}`}/>
                        )
                    )}
                </div>
            </div>
        </div>
    );
});