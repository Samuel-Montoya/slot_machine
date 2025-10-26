import Bar from '../assets/barpng.png'
import Cherry from '../assets/cherry.png'
import DoubleBar from '../assets/doublebar.png'
import TripleBar from '../assets/triplebar.png'
import Seven from '../assets/seven.png'
import Wild from '../assets/wild.png'
import Bonus from '../assets/money_machine.png'

export default function getImage(symbol) {
    if(symbol === 'SingleBar') return Bar
    if(symbol === 'DoubleBar') return DoubleBar
    if(symbol === 'TripleBar') return TripleBar
    if(symbol === 'Cherry') return Cherry
    if(symbol === 'Seven') return Seven
    if(symbol === 'Wild') return Wild
    if(symbol === 'Bonus') return Bonus
}