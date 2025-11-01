import "../Bonus.css"
import { useEffect, useRef, useState } from "react"
import Cash from "../assets/cash.png"
import Logo from "../assets/real_logo.png"
import shuffleArray from "../helpers/array.js"
import { runBonus } from "../helpers/bonus/offers.js"
import getImage from "../helpers/images.js"
import { fadeInSound, fadeOutSound, sound } from "../helpers/soundController.js"

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

export default function BonusGame({ onFinish }) {
  const [moneyToHighlight, setMoneyToHighlight] = useState([])
  const [round, setRound] = useState(null)
  const [total, setTotal] = useState(0)
  const [disabled, setDisabled] = useState(true)
  const [offers, _] = useState(runBonus())

  const bestPlayRef = useRef(null)

  useEffect(() => {
    if (round === null || !offers?.[round] || round === 4) return

    let isCancelled = false
    let total = 0
    console.log(offers)
    if(round === 1) sound("secondOffer").play()
    else if(round === 2) sound("thirdOffer").play()
    if(round === 3) sound("finalOffer").play()

    const revealPicks = async () => {
      clearMoneyHighlight()
      await waitASec(3000)
      const picks = offers[round].picks.map((p) => p.id)
      for (let i = 0; i < picks.length; i++) {
        if (isCancelled) break
        if (offers[round].picks[i].type === "cash") total += offers[round].picks[i].value
        else total *= offers[round].picks[i].value
        setTotal(total)
        setMoneyToHighlight(picks.slice(0, i + 1))
        if(offers[round].picks[i].type === 'multiplier') {
          // sound('multiplyHit').play()
          sound('multiply').play()
          document.getElementById('multiplier_' + offers[round].picks[i].id).style.filter = 'brightness(100%)'
        }
        sound(`bonusHit${i + 1}`).play()

        if (i === picks.length - 2) {
          bestPlayRef.current = setTimeout(() => {
            if (offers[round].advice === "TAKE OFFER") document.getElementById("take_offer_best_play").style.animation = "goUp 0.3s ease forwards"
            else document.getElementById("try_again_best_play").style.animation = "goUp 0.3s ease forwards"
          }, 6000)
        }

        await new Promise((res) => setTimeout(res, 1000))
      }
    }


    // Run once when `round` changes
    revealPicks().then(() => {
      fadeInSound("bonus_music", 0.05, 2000).then(() => setDisabled(false))
    })

    return () => {
      console.log('RAN')
      bestPlayRef.current && clearTimeout(bestPlayRef.current)
      isCancelled = true
    }
  }, [round])

  const initialLoad = async () => {
    await waitASec(500)
    sound("bonus_music", { volume: 0.05 }).play()
    sound("voice1").play()

    const step1 = ["left-20", "middle-30", "middle-50", "right-20"]
    const step2 = [...step1, "left-15", "middle-200", "right-15"]
    const step3 = [...step2, "left-10", "right-10"]
    const steps = [step1, step2, step3, allMoney]

    for (let i = 0; i < steps.length; i++) {
      await waitASec(i === 0 ? 2000 : 800)
      setMoneyToHighlight(steps[i])
    }
    await waitASec(2000)
    document.getElementById("bonus_game_container").classList.add("glow")
    void startGame()
  }

  useEffect(() => {
    void initialLoad()
  }, [])

  const startGame = async () => {
    clearMoneyHighlight()
    await waitASec(1000)
    void randomOffers()
    fadeOutSound("bonus_music", 1000)
    sound("drumRoll").play()
    sound("firstOffer").play()
    setRound(0)
  }

  const tryAgain = async () => {
    setDisabled(true)
    document.getElementById("take_offer_best_play").style.animation = "goDown 0.3s ease forwards"
    document.getElementById("try_again_best_play").style.animation = "goDown 0.3s ease forwards"
    fadeOutSound("bonus_music", 1000)
    void randomOffers()
    setTotal(0)
    sound("drumRoll").play()
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
      }, 2800)
    })
  }

  const clearMoneyHighlight = () => {
    document.getElementById('multiplier_1').style.filter = 'brightness(30%)'
    document.getElementById('multiplier_2').style.filter = 'brightness(30%)'
    setMoneyToHighlight([])
  }

  const takeMoney = () => {
    sound("click").play()
    sound("winner").play()
    fadeOutSound("bonus_music").then(() => sound("bonus_music").stop())
    setDisabled(true)
    setTimeout(() => {
      const wrapper = document.getElementById("bonus_game_wrapper")
      const container = document.getElementById("bonus_game_container")
      wrapper.classList.remove("animate__fadeInDown")
      container.classList.remove("glow", "animate__fadeInUp", "animate__delay-1s")
      wrapper.classList.add("animate__fadeOut", "animate__slower")
      container.classList.add("animate__fadeOutDown")
    }, 2000)

    setTimeout(() => {
      onFinish(total)
    }, 4000)
  }

  return (
    <div className="bonus_game_wrapper animate__animated animate__fadeIn" id="bonus_game_wrapper">
      <div className="bonus_game_container animate__animated animate__fadeInUp animate__delay-1s" id="bonus_game_container">
        <img src={Logo} alt="logo" className="bonus_game_logo animate__animated animate__pulse animate__infinite animate__slower" />

        <section className="bonus_game_content">
          <div className="bonus_game-multipliers">
            <h1 id="multiplier_1">x2</h1>
            <h1 id="multiplier_2">x2</h1>
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

        <section className="bonus_game-offer-container animate__animated animate__fadeInUp animate__delay-5s">
          <div className="bonus_game-offer-amount">
            <h2>CURRENT OFFER</h2>
            <h1>{total ? `$${total}` : ""}</h1>
          </div>
          <div className="bonus_game-offer-buttons">
            <section>
              <div className="best_play" id="take_offer_best_play">
                <h1>BEST PLAY</h1>
              </div>
              <button style={{ backgroundColor: "mediumseagreen", filter: disabled ? "brightness(30%)" : "brightness(100%)" }} onClick={takeMoney} disabled={disabled}>
                TAKE OFFER
              </button>
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
              <div className="best_play red" id="try_again_best_play">
                <h1>BEST PLAY</h1>
              </div>
              <button style={{ backgroundColor: "indianred", filter: disabled || round === 3 ? "brightness(30%)" : "brightness(100%)" }} disabled={disabled || round === 3}>
                TRY AGAIN
              </button>
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
    <div className={`bonus_game-money-item ${size} ${selected ? "selected" : ""}`} style={{ margin: amount === 15 ? "30px 0" : amount === 200 ? "20px" : 0 }}>
      {/*<h1 style={{ color }}>{amount}</h1>*/}
      <img src={getImage(amount)} alt="alt" />
    </div>
  )
}
