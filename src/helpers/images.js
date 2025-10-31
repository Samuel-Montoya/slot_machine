import Bar from "../assets/barpng.png"
import Cherry from "../assets/cherry.png"
import DoubleBar from "../assets/doublebar.png"
import TripleBar from "../assets/triplebar.png"
import Seven from "../assets/seven.png"
import Wild from "../assets/wild.png"
import Bonus from "../assets/real_logo.png"

import Ten from "../assets/roll_10.png"
import Fifteen from "../assets/roll_15.png"
import Twenty from "../assets/roll_20.png"
import Thirty from "../assets/roll_30.png"
import Fifty from "../assets/roll_50.png"
import TwoHundred from "../assets/roll_200.png"
import OneThousand from "../assets/roll_1000.png"

export default function getImage(symbol) {
  if (symbol === "SingleBar") return Bar
  if (symbol === "DoubleBar") return DoubleBar
  if (symbol === "TripleBar") return TripleBar
  if (symbol === "Cherry") return Cherry
  if (symbol === "Seven") return Seven
  if (symbol === "Wild") return Wild
  if (symbol === "Bonus") return Bonus
  if (symbol === 10) return Ten
  if (symbol === 15) return Fifteen
  if (symbol === 20) return Twenty
  if (symbol === 30) return Thirty
  if (symbol === 50) return Fifty
  if (symbol === 200) return TwoHundred
  if (symbol === 1000) return OneThousand
}
