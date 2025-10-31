import React, { useEffect, useRef, useState } from "react"
import { formatCash } from "../helpers/cash.js"
import { sound } from "../helpers/soundController.js"

const playStopSounds = () => {
  sound("counting").stop()
  sound("finished_counting").play()
}

const tickInterval = 85
const fastInterval = 35
const jackpotInterval = 35

export default function UI({ isButtonDisabled, handleClick, spinning, registerFunction }) {
  const [money, setMoney] = useState(100)
  const [wonCredits, setWonCredits] = useState(0)
  const [buttonLocked, setButtonLocked] = useState(false)

  const tickIntervalRef = useRef(null)
  const finalCreditsRef = useRef(0) // store the current target credits

  const moneyIntervalRef = useRef(null)
  const finalMoneyRef = useRef(money) // store the current total credits

  const handleWinCountUp = (wonCredits, jackpot) => {
    // Store this for later if user skips it
    finalCreditsRef.current = wonCredits

    if (jackpot) sound("jackpot").play()
    else sound("counting").play()

    let countingCredits = 0

    const clearTickInterval = () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current)
        tickIntervalRef.current = null
      }
    }

    const tick = () => {
      // Stop when finished
      if (countingCredits >= wonCredits) {
        playStopSounds()
        clearTickInterval()
        if (jackpot) {
          // sound("jackpot").stop()
          sound("jackpotFinished").play()
        }
        return setWonCredits(wonCredits)
      }

      countingCredits += 1
      setWonCredits(countingCredits)

      // When passing 200, switch to slower interval
      if (countingCredits === 200 && !jackpot) {
        clearTickInterval()
        tickIntervalRef.current = setInterval(tick, fastInterval)
      }
    }

    // Start counting
    clearTickInterval()
    tickIntervalRef.current = setInterval(tick, jackpot ? jackpotInterval : tickInterval)
  }

  const handleMoneyCountUp = (wonCredits, prevMoney, jackpot) => {
    finalMoneyRef.current = wonCredits

    let countingCredits = prevMoney

    const clearMoneyInterval = () => {
      if (moneyIntervalRef.current) {
        clearInterval(moneyIntervalRef.current)
        moneyIntervalRef.current = null
      }
    }

    const tick = () => {
      // Stop when done
      if (countingCredits >= wonCredits) {
        clearMoneyInterval()
        return setMoney(wonCredits)
      }

      countingCredits += 1
      setMoney(countingCredits)

      // Check if we crossed 200 and haven’t yet slowed down
      if (countingCredits - prevMoney === 200 && !jackpot) {
        clearMoneyInterval()
        moneyIntervalRef.current = setInterval(tick, fastInterval)
      }
    }

    // Start the initial interval
    clearMoneyInterval()
    moneyIntervalRef.current = setInterval(tick, jackpot ? jackpotInterval : tickInterval)
  }

  const onClick = () => {
    setButtonLocked(true)
    if (buttonLocked || isButtonDisabled) return

    // Check if the interval for counting won credits or money counter is running
    if (tickIntervalRef.current || moneyIntervalRef.current) {
      // If it is, clear it and use the stored final credits and total money
      clearInterval(tickIntervalRef.current)
      tickIntervalRef.current = null

      clearInterval(moneyIntervalRef.current)
      moneyIntervalRef.current = null

      setWonCredits(finalCreditsRef.current)
      setMoney(finalMoneyRef.current)

      return playStopSounds()
    }

    setWonCredits(0)
    const newMoney = money - 9
    if (!spinning) setMoney(newMoney)

    handleClick().then(({ wonCredits, jackpot }) => {
      if (wonCredits) {
        startCountUp(wonCredits, jackpot)
      }
    })
  }

  const startCountUp = (wonCredits, jackpot) => {
    handleWinCountUp(wonCredits, jackpot)
    const adjustedMoney = spinning ? money : money - 9
    handleMoneyCountUp(adjustedMoney + wonCredits, adjustedMoney, jackpot)
  }
  registerFunction(startCountUp)

  useEffect(() => {
    if (buttonLocked) setTimeout(() => setButtonLocked(false), 300)
  }, [buttonLocked])

  return (
    <div className="info_wrapper animate__animated animate__zoomInDown animate__slower">
      <section className="info_box">
        <h1>LINES</h1>
        <div style={{ width: 40 }}>9</div>
      </section>

      <section className="info_box larger">
        <h1>CASH</h1>
        <div>${formatCash(money)}</div>
      </section>

      <section className="spin_button" onClick={onClick}>
        <h1>$1 DENOM</h1>
        <h2>SPIN</h2>
      </section>

      <section className="info_box larger">
        <h1>WIN</h1>
        <div>${!spinning ? formatCash(wonCredits) : "0.00"}</div>
      </section>

      <section className="info_box">
        <h1>BET</h1>
        <div style={{ width: 40 }}>9</div>
      </section>
    </div>
  )
}
// {/*<h1*/}
// {/*  style={{*/}
// {/*    fontFamily: "sans-serif",*/}
// {/*    marginTop: 5,*/}
// {/*    visibility: paylines.length !== 0 ? "visible" : "hidden",*/}
// {/*    height: 10,*/}
// {/*    fontSize: "0.6rem"*/}
// {/*  }}*/}
// {/*>*/}
// {/*  {paylines[0]?.text}*/}
// {/*</h1>*/}
