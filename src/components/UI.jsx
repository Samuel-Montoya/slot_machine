import React, { useEffect, useRef, useState } from "react"
import { formatCash } from "../helpers/cash.js"
import { sound } from "../helpers/soundController.js"

const playStopSounds = () => {
  sound("counting").stop()
  sound("finished_counting").play()
}

const tickInterval = 90

export default function UI({ handleClick, spinning, paylines }) {
  const [money, setMoney] = useState(100)
  const [wonCredits, setWonCredits] = useState(0)
  const [buttonLocked, setButtonLocked] = useState(false)

  const tickIntervalRef = useRef(null)
  const finalCreditsRef = useRef(0) // store the current target credits

  const moneyIntervalRef = useRef(null)
  const finalMoneyRef = useRef(money) // store the current total credits

  const handleWinCountUp = (wonCredits) => {
    // Store this for later if user skips it
    finalCreditsRef.current = wonCredits

    sound("counting").play()
    let countingCredits = 0

    const tick = () => {
      // Check if we are at the end of the count
      if (countingCredits >= wonCredits) {
        playStopSounds()
        clearInterval(tickIntervalRef.current)
        tickIntervalRef.current = null
        return setWonCredits(wonCredits) // make sure it ends on the final value
      }

      countingCredits += 1
      setWonCredits(countingCredits)
    }

    tickIntervalRef.current = setInterval(tick, tickInterval)
  }

  const handleMoneyCountUp = (wonCredits, prevMoney) => {
    // Store this for later if user skips it
    finalMoneyRef.current = wonCredits

    let countingCredits = prevMoney

    const tick = () => {
      // Check if we are at the end of the count
      if (countingCredits >= wonCredits) {
        clearInterval(moneyIntervalRef.current)
        moneyIntervalRef.current = null
        return setMoney(wonCredits) // make sure it ends on the final value
      }

      countingCredits += 1
      setMoney(countingCredits)
    }

    moneyIntervalRef.current = setInterval(tick, tickInterval)
  }

  const onClick = () => {
    setButtonLocked(true)
    if (buttonLocked) return

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

    handleClick().then((wonCredits) => {
      if (wonCredits) {
        handleWinCountUp(wonCredits)
        const adjustedMoney = spinning ? money : newMoney
        handleMoneyCountUp(adjustedMoney + wonCredits, money)
      }
    })
  }

  useEffect(() => {
    if (buttonLocked) setTimeout(() => setButtonLocked(false), 300)
  }, [buttonLocked])

  return (
    <div className="info_wrapper animate__animated animate__zoomInDown animate__slower">
      <section className="info_box">
        <h1>LINES</h1>
        <div>9</div>
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
        <div>9</div>
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
