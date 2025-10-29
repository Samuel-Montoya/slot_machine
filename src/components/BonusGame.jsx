import "../Bonus.css"
import { useEffect, useState } from "react"
import Cash from "../assets/cash.png"
import shuffleArray from "../helpers/array.js"
import { sound } from "../helpers/soundController.js"

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

  const initialLoad = async () => {
    await waitASec(500)
    sound("bonus_music").play()

    const step1 = ["left-20", "middle-30", "middle-50", "right-20"]
    const step2 = [...step1, "left-15", "middle-200", , "right-15"]
    const step3 = [...step2, "left-10", "right-10"]
    const steps = [step1, step2, step3, allMoney]

    for (let i = 0; i < steps.length; i++) {
      await waitASec(i === 0 ? 3000 : 800)
      setMoneyToHighlight(steps[i])
    }
  }

  useEffect(() => {
    void initialLoad()
  }, [])

  const startGame = () => {
    sound("bonus_music").volume(0.1)
    setInterval(() => {
      const shuffledMoney = shuffleArray(allMoney)
      setMoneyToHighlight(shuffledMoney.slice(0, 3))
    }, 400)
  }

  return (
    <div className="bonus_game_wrapper animate__animated animate__fadeInDown">
      <div className="bonus_game_container">
        <h1>MONEY MAKER</h1>

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

          <section className="bonus_game-buttons">
            <button onClick={startGame}>START</button>
            <button>TAKE OFFER</button>
            <button>TRY AGAIN</button>
          </section>
        </section>
      </div>
    </div>
  )
}

const Money = ({ amount, size = "small", moneyToHighlight, id }) => {
  const color = colors[amount]
  return (
    <div className={`bonus_game-money-item ${size}`}>
      <h1 style={{ color, filter: moneyToHighlight.includes(id) ? `drop-shadow(0 0 15px ${color})` : "inherit" }}>{amount}</h1>
      <img src={Cash} alt="alt" />
    </div>
  )
}
