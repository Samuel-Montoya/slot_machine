import React from "react"
import getImage from "../helpers/images.js"

export default function Reels({ reels, reelRefs, showGreen, showRed, spinning, blankHeight }) {
  return reels.map((reel, i) => (
    <React.Fragment key={i}>
      <Reel key={i} ref={reelRefs[i]} reel={reel} showGreen={showGreen} showRed={showRed} reelIndex={i} spinning={spinning} blankHeight={blankHeight} />
      {i < 2 && (
        <section className="reel_lines">
          <hr />
          <hr />
          <hr />
        </section>
      )}
    </React.Fragment>
  ))
}

const Reel = React.forwardRef(({ reel, spinning, showGreen, showRed, reelIndex, blankHeight }, ref) => {
  // Duplicate symbols twice for seamless loop
  const doubledReel = reelIndex === 0 || reelIndex === 1 ? [...reel, ...reel] : [...reel, ...reel, ...reel, ...reel, ...reel]

  return (
    <div className={`reel_container ${showGreen ? "green_background" : showRed ? "red_background" : spinning ? "active" : ""}`}>
      <div className="reel_inner">
        <div ref={ref} className={`reel_strip ${spinning ? "spinning" : ""}`}>
          {doubledReel.map((symbol, i) =>
            symbol === "Blank" ? (
              <div id={`reel_${reelIndex}_pos_${i}`} style={{ height: blankHeight, width: "100%", backgroundColor: "transparent" }} key={i} />
            ) : (
              <img key={i} src={getImage(symbol)} className="symbol" alt={symbol} id={`reel_${reelIndex}_pos_${i}`} />
            )
          )}
        </div>
      </div>
    </div>
  )
})
