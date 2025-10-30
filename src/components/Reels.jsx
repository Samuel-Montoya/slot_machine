import React from "react"
import getImage from "../helpers/images.js"

export default function Reels({ reels, reelRefs, showGreen, spinning }) {
  return reels.map((reel, i) => (
    <React.Fragment key={i}>
      <Reel key={i} ref={reelRefs[i]} reel={reel} showGreen={showGreen} reelIndex={i} spinning={spinning} />
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

const Reel = React.forwardRef(({ reel, spinning, showGreen, reelIndex }, ref) => {
  // Duplicate symbols twice for seamless loop
  const doubledReel = reelIndex === 0 || reelIndex === 1 ? [...reel, ...reel] : [...reel, ...reel, ...reel, ...reel, ...reel]

  return (
    <div className={`reel_container ${showGreen ? "green_background" : spinning ? "active" : ""}`}>
      <div className="reel_inner">
        <div ref={ref} className={`reel_strip ${spinning ? "spinning" : ""}`}>
          {doubledReel.map((symbol, i) => symbol === 'Blank' ? <div id={`reel_${reelIndex}_pos_${i}`} style={{height: i === 50 || i === 52 ? 200 : 150, width: '100%', backgroundColor:'transparent'}} key={i}/> : (
            <img key={i} src={getImage(symbol)} className="symbol" alt={symbol} id={`reel_${reelIndex}_pos_${i}`} />
          ))}
        </div>
      </div>
    </div>
  )
})
