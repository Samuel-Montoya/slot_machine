// helpers/soundController.js
import { Howl, Howler } from "howler";

Howler.volume(1);

// import your sounds
import reelSpin from "../assets/sounds/spinning.wav";
import hit from "../assets/sounds/hit.wav";
import bonus1 from "../assets/sounds/symbol.wav";
import bonus2 from "../assets/sounds/symbol_2.wav";
import bonus3 from "../assets/sounds/symbol_3.wav";
import counting from "../assets/sounds/counting.wav";
import finished_counting from "../assets/sounds/finished_counting.wav";

// preload and store them in a lookup
const sounds = {
    spin: new Howl({
        src: [reelSpin],
        loop: false,
        // volume: 0.4,
    }),
    hit: new Howl({
        src: [hit],
        loop: false,
        volume: 0.5,
    }),
    bonus1: new Howl({
        src: [bonus1],
        loop: false,
        // volume: 0.4,
    }),
    bonus2: new Howl({
        src: [bonus2],
        loop: false,
        // volume: 0.4,
    }),
    bonus3: new Howl({
        src: [bonus3],
        loop: false,
        // volume: 0.4,
    }),
    counting: new Howl({
        src: [counting],
        loop: true,
        volume: 0.4,
    }),
    finished_counting: new Howl({
        src: [finished_counting],
        loop: false,
        volume: 0.4,
    }),
};

// Global controller function
export function sound(name, { rate = 1, loop = false, volume } = {}) {
    const s = sounds[name];
    if (!s) return;
    const id = s
    s.rate(rate);
    s.play()
    if (loop) s.loop(true, id);
    if (volume !== undefined) s.volume(volume, id);
    return id;
}