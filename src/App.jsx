import React, { useRef, useState, useEffect, useCallback } from "react"
import "./App.css"
import "animate.css"
import BonusGame from "./components/BonusGame.jsx"

import Paylines from "./components/Paylines.jsx"
import Reels from "./components/Reels.jsx"
import UI from "./components/UI.jsx"

import evaluateAllLines from "./helpers/evaluateAllLines.js"
import spinReels from "./helpers/spin.js"
import { reel1 as reelStrip1, reel2 as reelStrip2, reel3 as reelStrip3 } from "./helpers/reels.js"
import { randomizeSpinSound, sound } from "./helpers/soundController.js"

const BLANK_HEIGHT = 150
const SYMBOL_HEIGHT = 250
const VISIBLE_COUNT = 3
const BASE_SPIN_SPEED = 7000 // px/sec

export default function App() {
  const [spinning, setSpinning] = useState(false)
  const [reels, setReels] = useState([reelStrip1, reelStrip2, reelStrip3])
  const [paylines, setPaylines] = useState([])
  const [showGreen, setShowGreen] = useState(false)
  const [bonus, setBonus] = useState(false)

  const reelRefs = [useRef(null), useRef(null), useRef(null)]
  const currentOutcomeRef = useRef(null)
  const rafRefs = useRef([null, null, null])
  const stopTimeouts = useRef([])
  const functionRef = useRef(null)

  /** --- Cleanup --- */
  useEffect(() => {
    return () => {
      // On unmount, stop sounds & clear timers
      stopTimeouts.current.forEach(clearTimeout)
      rafRefs.current.forEach((id) => id && cancelAnimationFrame(id))
      sound("spin").stop()
      sound("tone").stop()
      sound("counting").stop()
      sound("anticipation").stop()
    }
  }, [])

  /** --- Helpers --- */
  const clearScheduledStops = useCallback(() => {
    stopTimeouts.current.forEach((t) => t && clearTimeout(t))
    stopTimeouts.current = []
  }, [])

  const cancelAllRefs = useCallback(() => {
    rafRefs.current.forEach((id, i) => {
      if (id) {
        cancelAnimationFrame(id)
        rafRefs.current[i] = null
      }
    })
  }, [])

  const resetReelsPosition = useCallback(() => {
    for (let i = 0; i < 3; i++) {
      const el = reelRefs[i].current
      if (el) {
        el.style.transition = "none"
        el.style.transform = "translateY(0)"
      }
    }
  }, [])

  const spinReel = useCallback((el, reelLength, _, __, extraLoops = 0) => {
    if (!el) return
    // Each reel has 24 blanks (150px) + 25 symbols (250px)
    const reelDistance = reelLength * ((25 * BLANK_HEIGHT) + (25 * 250));
    const totalDistance = reelDistance * (3 + extraLoops);
    const duration = (totalDistance / BASE_SPIN_SPEED) * 1000;

    el.style.transition = "none"
    el.style.transform = "translateY(0)"
    void el.offsetHeight // reflow
    el.style.transition = `transform ${duration}ms linear`
    el.style.transform = `translateY(-${totalDistance}px)`
  }, [])

  const forceStopToResult = useCallback((index, reelArray) => {
    const el = reelRefs[index].current;
    if (!el || !reelArray) return;
    if (rafRefs.current[index]) cancelAnimationFrame(rafRefs.current[index]);

    // Count how many symbols are visible from the bottom
    const visibleCount = VISIBLE_COUNT;

    // Calculate the pixel offset for the stop position dynamically
    let totalHeight = 0;
    for (let i = 0; i < reelArray.length - visibleCount; i++) {
      const symbol = reelArray[i];
      const isBlank = symbol === "Blank";
      totalHeight += isBlank ? BLANK_HEIGHT : SYMBOL_HEIGHT;
    }

    el.style.transition = "none";
    el.style.transform = `translateY(-${totalHeight}px)`;
  }, []);

  const stopReel = useCallback(
    (index, reelArray) => {
      const el = reelRefs[index].current
      if (!el) return
      el.classList.remove("spinning")
      forceStopToResult(index, reelArray)
    },
    [forceStopToResult]
  )

  /** --- Reset spin --- */
  const resetSpin = useCallback(() => {
    setPaylines([])
    setShowGreen(false)
    sound("click").play()
    randomizeSpinSound()
    sound("spin").play()
    sound("tone").play()
    setSpinning(true)
    resetReelsPosition()
  }, [resetReelsPosition])

  /** --- Handle click / spin --- */
  const handleClick = useCallback(async () => {
    return new Promise((resolve) => {
      const outcomeData = spinning ? currentOutcomeRef.current : spinReels()
      const final = evaluateAllLines(outcomeData.window, true)

      const newReels = [
        [...reelStrip1, ...outcomeData.window.reel1],
        [...reelStrip2, ...outcomeData.window.reel2],
        [...reelStrip3, ...outcomeData.window.reel3]
      ]

      /** FAST SKIP SPIN */
      if (spinning) {
        sound("spin").stop()
        sound("tone").stop()
        clearScheduledStops()
        cancelAllRefs()

        if (!outcomeData) {
          setSpinning(false)
          return
        }

        const soundToPlay = outcomeData.window.reel3.includes("Bonus") ? "bonus3" : "hit3"
        sound(soundToPlay).play()
        if (final.bonusTriggered) {
          setShowGreen(true)
          sound("bell").play()
          setTimeout(() => setBonus(true), 2000)
        }

        setReels(reels)
        for (let i = 0; i < 3; i++) forceStopToResult(i, reels[i])
        setSpinning(false)
        return resolve(final.totalCredits)
      }

      /** NORMAL SPIN */
      resetSpin()
      currentOutcomeRef.current = outcomeData
      setPaylines(final.winningLines)
      setReels(newReels)

      const suspenseSpin = outcomeData.window.reel1.includes("Bonus") && outcomeData.window.reel2.includes("Bonus")
      spinReel(reelRefs[0].current, newReels[0].length, 1000, 0)
      spinReel(reelRefs[1].current, newReels[1].length, 1500, 1)
      spinReel(reelRefs[2].current, newReels[2].length, 2000, 2, suspenseSpin ? 2 : 0)

      const reel3StopTime = suspenseSpin ? 3000 : 1800
      const anticipation = sound("anticipation")

      const t0 = setTimeout(() => {
        stopReel(0, newReels[0])
        const s = outcomeData.window.reel1.includes("Bonus") ? "bonus1" : "hit1"
        sound(s).play()
      }, 800)

      const t1 = setTimeout(() => {
        stopReel(1, newReels[1])
        const s = outcomeData.window.reel2.includes("Bonus") ? "bonus2" : "hit2"
        sound(s).play()

        if (suspenseSpin) {
          anticipation.play()
          setShowGreen(true)
        }
      }, 1300)

      const t2 = setTimeout(() => {
        stopReel(2, newReels[2])
        const s = outcomeData.window.reel3.includes("Bonus") ? "bonus3" : "hit3"
        sound(s).play()

        if (outcomeData.window.reel3.includes("Bonus")) {
          if (final.bonusTriggered) sound("bell").play()
          else setShowGreen(false)
        } else setShowGreen(false)

        if (suspenseSpin) anticipation.stop()

        setTimeout(
          () => {
            if (final.bonusTriggered) setBonus(true)
            setSpinning(false)
            currentOutcomeRef.current = null
            resolve(final.totalCredits)
          },
          final.bonusTriggered ? 2000 : 200
        )
      }, reel3StopTime)

      stopTimeouts.current = [t0, t1, t2]
    })
  }, [spinning, cancelAllRefs, clearScheduledStops, forceStopToResult, resetSpin, spinReel, stopReel])

  /** --- UI --- */
  return (
    <div className="slot_wrapper">
      <div className="reels_wrapper animate__animated animate__zoomInDown animate__slow" style={{ marginTop: 20 }}>
        <Paylines paylines={paylines} spinning={spinning} />
        <Reels reels={reels} reelRefs={reelRefs} showGreen={showGreen} spinning={spinning}  />
      </div>
      <UI handleClick={handleClick} spinning={spinning} paylines={paylines} registerFunction={(fn) => (functionRef.current = fn)} />
      {bonus && <BonusGame onFinish={(wonCredits) => {
        setBonus(false)
        functionRef.current?.(wonCredits)
      }} />}
    </div>
  )
}
