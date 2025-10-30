/**
 *
 * I think I figured out how to do lands in-between
 * Add blanks to the reels
 * Then, when rendering, make the blank spots render HALF the px
 * Then, add the total amount of blank spots * the HALF px amount
 * 10 blank spots in a reel = 300 / 2 so 150
 * Although, now I think there should be a blank spot in-between EACH symbol
 *
 * Then, if any reel lands on a blank, would it count as win? Could blank spots still be counted if other symbols line up?
 *
 */

const reel1 = [
    "TripleBar","Blank","Seven","Blank","TripleBar","Blank","Wild","Blank","Bonus","Blank",
    "DoubleBar","Blank","DoubleBar","Blank","DoubleBar","Blank","Seven","Blank","SingleBar","Blank",
    "Cherry","Blank","Bonus","Blank","DoubleBar","Blank","Seven","Blank","TripleBar","Blank",
    "SingleBar","Blank","DoubleBar","Blank","Seven","Blank","Bonus","Blank","Cherry","Blank",
    "Cherry","Blank","DoubleBar","Blank","TripleBar","Blank","SingleBar","Blank","SingleBar","Blank"
];

const reel2 = [
    "DoubleBar","Blank","Bonus","Blank","SingleBar","Blank","TripleBar","Blank","SingleBar","Blank",
    "DoubleBar","Blank","Seven","Blank","TripleBar","Blank","TripleBar","Blank","Bonus","Blank",
    "SingleBar","Blank","Seven","Blank","DoubleBar","Blank","TripleBar","Blank","Seven","Blank",
    "TripleBar","Blank","Wild","Blank","SingleBar","Blank","DoubleBar","Blank","Bonus","Blank",
    "SingleBar","Blank","SingleBar","Blank","TripleBar","Blank","Seven","Blank","DoubleBar","Blank"
];

const reel3 = [
    "DoubleBar","Blank","Bonus","Blank","SingleBar","Blank","Wild","Blank","TripleBar","Blank",
    "Seven","Blank","SingleBar","Blank","TripleBar","Blank","DoubleBar","Blank","Seven","Blank",
    "Bonus","Blank","TripleBar","Blank","SingleBar","Blank","DoubleBar","Blank","TripleBar","Blank",
    "Bonus","Blank","DoubleBar","Blank","TripleBar","Blank","Seven","Blank","DoubleBar","Blank",
    "SingleBar","Blank","Seven","Blank","Bonus","Blank","Cherry","Blank","DoubleBar","Blank"
];


export { reel1, reel2, reel3 };
