// paylines.js
export const paylines = [
    // Straight lines
    [[0,0],[1,0],[2,0]], // Top Row
    [[0,1],[1,1],[2,1]], // Middle Row
    [[0,2],[1,2],[2,2]], // Bottom Row

    // Diagonals
    [[0,0],[1,1],[2,2]], // Top-left to bottom-right
    [[0,2],[1,1],[2,0]], // Bottom-left to top-right

    // V & inverted V shapes (classic 9-line layout)
    [[0,0],[1,1],[2,0]],
    [[0,2],[1,1],[2,2]],
    [[0,1],[1,0],[2,1]],
    [[0,1],[1,2],[2,1]]
];
