// helpers/soundController.js
import { Howl, Howler } from "howler"

Howler.volume(1)

// import your sounds
import hit1 from "../assets/sounds/reel_stop_1.mp3"
import hit2 from "../assets/sounds/reel_stop_2.mp3"
import hit3 from "../assets/sounds/reel_stop_3.mp3"
import bonus1 from "../assets/sounds/symbol_hit01.mp3"
import bonus2 from "../assets/sounds/symbol_hit02.mp3"
import bonus3 from "../assets/sounds/symbol_hit03.mp3"
import counting from "../assets/sounds/normal_win.mp3"
import finished_counting from "../assets/sounds/normal_win_stop.mp3"
import click from "../assets/sounds/click.mp3"
import tone from "../assets/sounds/Vlcn_Bet_Tone.mp3"
import anticipation from "../assets/sounds/anticipation.mp3"
import bell from "../assets/sounds/jackpotBell.mp3"

import reelSpin1 from "../assets/sounds/Vlcn_ReelSpin_01.mp3"
import reelSpin2 from "../assets/sounds/Vlcn_ReelSpin_02.mp3"
import reelSpin3 from "../assets/sounds/Vlcn_ReelSpin_03.mp3"
import reelSpin4 from "../assets/sounds/Vlcn_ReelSpin_04.mp3"
import reelSpin5 from "../assets/sounds/Vlcn_ReelSpin_05.mp3"
import reelSpin6 from "../assets/sounds/Vlcn_ReelSpin_06.mp3"
import reelSpin7 from "../assets/sounds/Vlcn_ReelSpin_07.mp3"
import reelSpin8 from "../assets/sounds/Vlcn_ReelSpin_08.mp3"
import reelSpin9 from "../assets/sounds/Vlcn_ReelSpin_09.mp3"
import reelSpin10 from "../assets/sounds/Vlcn_ReelSpin_10.mp3"
import reelSpin11 from "../assets/sounds/Vlcn_ReelSpin_11.mp3"
import reelSpin12 from "../assets/sounds/Vlcn_ReelSpin_12.mp3"
import reelSpin13 from "../assets/sounds/Vlcn_ReelSpin_13.mp3"
import reelSpin14 from "../assets/sounds/Vlcn_ReelSpin_14.mp3"
import reelSpin15 from "../assets/sounds/Vlcn_ReelSpin_15.mp3"
import reelSpin16 from "../assets/sounds/Vlcn_ReelSpin_16.mp3"
import reelSpin17 from "../assets/sounds/Vlcn_ReelSpin_17.mp3"
import reelSpin18 from "../assets/sounds/Vlcn_ReelSpin_18.mp3"
import reelSpin19 from "../assets/sounds/Vlcn_ReelSpin_19.mp3"
import reelSpin20 from "../assets/sounds/Vlcn_ReelSpin_20.mp3"
import reelSpin21 from "../assets/sounds/Vlcn_ReelSpin_21.mp3"
import reelSpin22 from "../assets/sounds/Vlcn_ReelSpin_22.mp3"
import reelSpin23 from "../assets/sounds/Vlcn_ReelSpin_23.mp3"
import reelSpin24 from "../assets/sounds/Vlcn_ReelSpin_24.mp3"
import reelSpin25 from "../assets/sounds/Vlcn_ReelSpin_25.mp3"
import reelSpin26 from "../assets/sounds/Vlcn_ReelSpin_26.mp3"
import reelSpin27 from "../assets/sounds/Vlcn_ReelSpin_27.mp3"
import reelSpin28 from "../assets/sounds/Vlcn_ReelSpin_28.mp3"
import reelSpin29 from "../assets/sounds/Vlcn_ReelSpin_29.mp3"
import reelSpin30 from "../assets/sounds/Vlcn_ReelSpin_30.mp3"
import reelSpin31 from "../assets/sounds/Vlcn_ReelSpin_31.mp3"
import reelSpin32 from "../assets/sounds/Vlcn_ReelSpin_32.mp3"
import reelSpin33 from "../assets/sounds/Vlcn_ReelSpin_33.mp3"
import reelSpin34 from "../assets/sounds/Vlcn_ReelSpin_34.mp3"
import reelSpin35 from "../assets/sounds/Vlcn_ReelSpin_35.mp3"
import reelSpin36 from "../assets/sounds/Vlcn_ReelSpin_36.mp3"
import reelSpin37 from "../assets/sounds/Vlcn_ReelSpin_37.mp3"
import reelSpin38 from "../assets/sounds/Vlcn_ReelSpin_38.mp3"
import reelSpin39 from "../assets/sounds/Vlcn_ReelSpin_39.mp3"
import bonusMusic from "../assets/sounds/bonus_music.mp3"

export const reelSpinSounds = [
  reelSpin1,
  reelSpin2,
  reelSpin3,
  reelSpin4,
  reelSpin5,
  reelSpin6,
  reelSpin7,
  reelSpin8,
  reelSpin9,
  reelSpin10,
  reelSpin11,
  reelSpin12,
  reelSpin13,
  reelSpin14,
  reelSpin15,
  reelSpin16,
  reelSpin17,
  reelSpin18,
  reelSpin19,
  reelSpin20,
  reelSpin21,
  reelSpin22,
  reelSpin23,
  reelSpin24,
  reelSpin25,
  reelSpin26,
  reelSpin27,
  reelSpin28,
  reelSpin29,
  reelSpin30,
  reelSpin31,
  reelSpin32,
  reelSpin33,
  reelSpin34,
  reelSpin35,
  reelSpin36,
  reelSpin37,
  reelSpin38,
  reelSpin39
]

// Function to randomly select one
export function getRandomReelSpin() {
  const randomIndex = Math.floor(Math.random() * reelSpinSounds.length)
  return reelSpinSounds[randomIndex]
}

const soundInstances = {
  spin: new Howl({ src: [getRandomReelSpin()], loop: false }),
  hit1: new Howl({ src: [hit1], loop: false }),
  hit2: new Howl({ src: [hit2], loop: false }),
  hit3: new Howl({ src: [hit3], loop: false }),
  bonus1: new Howl({ src: [bonus1], loop: false }),
  bonus2: new Howl({ src: [bonus2], loop: false }),
  bonus3: new Howl({ src: [bonus3], loop: false }),
  tone: new Howl({ src: [tone], loop: false }),
  click: new Howl({ src: [click], loop: false }),
  anticipation: new Howl({ src: [anticipation], loop: false }),
  counting: new Howl({ src: [counting], loop: true, volume: 0.9 }),
  bonus_music: new Howl({ src: [bonusMusic], loop: true, volume: 0.3 }),
  finished_counting: new Howl({ src: [finished_counting], loop: false, volume: 0.4 }),
  bell: new Howl({ src: [bell], loop: false, volume: 0.4 })
}

// --- Main controller ---
export function sound(name, { rate = 1, loop = false, volume } = {}) {
  const s = soundInstances[name]
  if (!s) return null

  s.rate(rate)
  // s.loop(loop);
  if (volume !== undefined) s.volume(volume)

  return s // return persistent Howl instance
}

export function randomizeSpinSound() {
  const randomSpinSrc = getRandomReelSpin()

  // stop and unload old spin sound
  const oldSpin = soundInstances.spin
  if (oldSpin) {
    oldSpin.stop()
    oldSpin.unload()
  }

  // create new spin sound with new random src
  soundInstances.spin = new Howl({
    src: [randomSpinSrc],
    loop: false,
    volume: 0.7
  })
}
