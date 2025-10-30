import "../Bonus.css"
import { useEffect, useState } from "react"
import Cash from "../assets/cash.png"
import shuffleArray from "../helpers/array.js"
import { fadeOutSound, sound } from "../helpers/soundController.js"
import Logo from "../assets/logo.png"
import { runBonus } from "../helpers/bonus/offers.js"

const colors = {
  10: "hotpink",
  15: "cornflowerblue",
  20: "mediumseagreen",
  100: "goldenrod",
  200: "red",
  30: "purple",
  50: "orange",
  1000: "green"
}

const waitASec = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms))

const allMoney = ["left-10", "left-15", "left-20", "middle-1000", "middle-200", "middle-30", "middle-50", "right-10", "right-15", "right-20"]

export default function BonusGame() {
  const [moneyToHighlight, setMoneyToHighlight] = useState([])
  const [round, setRound] = useState(null)
  const [total, setTotal] = useState(0)
  const offers = runBonus()
  // console.log(offers)

  useEffect(() => {
    if (round === null || !offers?.[round]) return

    let isCancelled = false
    let total = 0

    const revealPicks = async () => {
      const picks = offers[round].picks.map((p) => p.id)
      for (let i = 0; i < picks.length; i++) {
        if (isCancelled) break
        total += offers[round].picks[i].value
        setTotal(total)
        setMoneyToHighlight(picks.slice(0, i + 1))
        await new Promise((res) => setTimeout(res, 1000))
      }
    }

    // Run once when `round` changes
    revealPicks()

    return () => {
      isCancelled = true
    }
    // only rerun when round changes (NOT when offers re-renders)
  }, [round])

  const initialLoad = async () => {
    await waitASec(500)
    sound("bonus_music").play()

    const step1 = ["left-20", "middle-30", "middle-50", "right-20"]
    const step2 = [...step1, "left-15", "middle-200", "right-15"]
    const step3 = [...step2, "left-10", "right-10"]
    const steps = [step1, step2, step3, allMoney]

    for (let i = 0; i < steps.length; i++) {
      await waitASec(i === 0 ? 4000 : 1000)
      setMoneyToHighlight(steps[i])
    }
    await waitASec(3000)
    void startGame()
  }

  useEffect(() => {
    void initialLoad()
  }, [])

  const startGame = async () => {
    // fadeOutSound("bonus_music", 1000)
    // clearMoneyHighlight()
    // await waitASec(2000)
    // await randomOffers()
    clearMoneyHighlight()
    // await waitASec(2000)
    setRound(0)
  }

  const tryAgain = async () => {
    clearMoneyHighlight()
    setTotal(0)
    await waitASec(2000)
    setRound(round + 1)
  }

  const randomOffers = () => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const shuffledMoney = shuffleArray(allMoney)
        setMoneyToHighlight(shuffledMoney.slice(0, 3))
      }, 300)
      setTimeout(() => {
        clearInterval(interval)
        resolve()
      }, 3000)
    })
  }

  const clearMoneyHighlight = () => setMoneyToHighlight([])

  return (
    <div className="bonus_game_wrapper animate__animated animate__fadeInDown">
      <div className="bonus_game_container">
        <img src={Logo} alt="logo" className="bonus_game_logo" />

        <section className="bonus_game_content">
          <div className="bonus_game-multipliers">
            <h1>x2</h1>
            <h1>x2</h1>
          </div>

          <div className="bonus_game-money">
            <section className="bonus_game-left column">
              <Money amount={10} moneyToHighlight={moneyToHighlight} id="left-10" />
              <Money amount={15} moneyToHighlight={moneyToHighlight} id="left-15" />
              <Money amount={20} moneyToHighlight={moneyToHighlight} id="left-20" />
            </section>

            <section className="bonus_game-middle column">
              <Money amount={1000} moneyToHighlight={moneyToHighlight} size="larger" id="middle-1000" />
              <Money amount={200} moneyToHighlight={moneyToHighlight} size="medium" id="middle-200" />
              <div className="bonus_game-middle-bottom">
                <Money amount={30} moneyToHighlight={moneyToHighlight} id="middle-30" />
                <Money amount={50} moneyToHighlight={moneyToHighlight} id="middle-50" />
              </div>
            </section>

            <section className="bonus_game-right column">
              <Money amount={10} moneyToHighlight={moneyToHighlight} id="right-10" />
              <Money amount={15} moneyToHighlight={moneyToHighlight} id="right-15" />
              <Money amount={20} moneyToHighlight={moneyToHighlight} id="right-20" />
            </section>
          </div>
        </section>

        <section className="bonus_game-offer-container">
          <div className="bonus_game-offer-amount">
            <h2>CURRENT OFFER</h2>
            <h1>{total ? `$${total}` : ""}</h1>
          </div>
          <div className="bonus_game-offer-buttons">
            <section>
              <button style={{ backgroundColor: "mediumseagreen" }}>TAKE OFFER</button>
            </section>

            <div>
              <div>
                <h1>{round + 1}</h1>
                <h2> OF </h2>
                <h1>4</h1>
              </div>
              <h1 className="gold-red-text">OFFER</h1>
            </div>

            <section onClick={tryAgain}>
              <button style={{ backgroundColor: "indianred" }}>TRY AGAIN</button>
            </section>
          </div>
        </section>
      </div>
    </div>
  )
}

const Money = ({ amount, size = "small", moneyToHighlight, id }) => {
  const selected = moneyToHighlight.includes(id)
  const color = colors[amount]
  return (
    <div className={`bonus_game-money-item ${size} ${selected ? "selected" : ""}`} style={{ filter: selected ? `drop-shadow(0 0 15px ${color})` : "inherit" }}>
      <h1 style={{ color }}>{amount}</h1>
      <img src={Cash} alt="alt" />
    </div>
  )
}
