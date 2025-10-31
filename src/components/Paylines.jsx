import React, { useEffect } from "react"
import { colors } from "../helpers/colors.js"

const staticPaylines = [
  [
    { line: 4, text: "4", color: "hotpink" },
    { line: 2, text: "2", color: "cornflowerblue" },
    { line: 9, text: "9", color: "mediumseagreen" }
  ],
  [
    { line: 6, text: "6", color: "goldenrod" },
    { line: 1, text: "1", color: "red" },
    { line: 7, text: "7", color: "purple" }
  ],
  [
    { line: 8, text: "8", color: "orange" },
    { line: 3, text: "3", color: "green" },
    { line: 5, text: "5", color: "blue" }
  ]
]

export default function Paylines({ spinning, paylines }) {
  const removeSymbolClassNames = () => {
    document.querySelectorAll(".symbol").forEach((el) => {
      if (el) {
        el.classList.remove("animate__animated", "animate__pulse", "animate__infinite")
        el.style.background = "transparent"
      }
    })
  }
  const removePaylineClassNames = () => {
    document.querySelectorAll(".pay_line_section").forEach((el) => {
      if (el) el.classList.remove("animate__animated", "animate__flash", "animate__infinite")
    })
  }

  useEffect(() => {
    if (!paylines.length || spinning) return

    let current = 0
    let highlightInterval

    const highlightLine = ({ positions, line }) => {
      removeSymbolClassNames()
      removePaylineClassNames()

      positions.forEach(([reel, spot]) => {
        const [symbol, lineTick] = [document.getElementById(`reel_${reel}_pos_${spot + 51}`), document.getElementById(`line_${line}`)]
        if (symbol) {
          symbol.classList.add("animate__animated", "animate__pulse", "animate__infinite")
          symbol.style.background = `radial-gradient(circle, ${colors[line]} 40%,transparent 60%)`
        }
        if (lineTick) lineTick.classList.add("animate__animated", "animate__flash", "animate__infinite")
      })
    }

    highlightLine(paylines[current])

    highlightInterval = setInterval(() => {
      current = (current + 1) % paylines.length // loops back to 0
      highlightLine(paylines[current])
    }, 1000)

    return () => {
      clearInterval(highlightInterval)
      removeSymbolClassNames()
      removePaylineClassNames()
    }
  }, [paylines, spinning])

  return (
    <section className="pay_lines">
      {staticPaylines.map((lines, i) => (
        <div key={i} className="pay_line">
          {lines.map(({ line, text, color }) => (
            <section key={line} id={`line_${line}`} className="pay_line_section" style={line === 2 || line === 1 || line === 3 ? { marginTop: 20, marginBottom: 20 } : {}}>
              <h1 style={{ backgroundColor: color }}>{text}</h1>
              <div style={{ borderRight: `10px solid ${color}` }} />
            </section>
          ))}
        </div>
      ))}
    </section>
  )
}
