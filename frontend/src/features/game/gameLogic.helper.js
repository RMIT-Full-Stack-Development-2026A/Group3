// Check for valid moves
export const isValidMove = (board, row, col) => {
    // If the cell is empty, then it is valid.
    return board[row][col] === null;
};

// Function to check win
export const checkWin = (board, row, col, marker) => {
    // Automatically retrieve the chessboard size (10 or 15) from the input array.
    const boardSize = board.length; 
    
    // Declare 4 direction vectors: Horizontal, Vertical, Main Diagonal (\), Secondary Diagonal (/)
    const directions = [
        {dx:0, dy: 1},   // Move horizontally (Same row, increase column)
        {dx: 1, dy: 0},   // Move vertically (Increase rows, same column)
        {dx:1, dy: 1},   // Main diagonal (Increase rows, increase columns)
        {dx:1, dy: -1}   // Sub-diagonal movement (Increase rows, decrease columns)
    ];

    // Browse through each direction one by one.
    for (let {dx, dy} of directions) {
        let count = 1; // Initialize counter = 1 (including the piece just placed down)
        let winLine = [[row, col]]; // Array to store coordinates for effects

        // Scan in the positive direction
        for (let i = 1; i <= 4; i++) {
            let r = row + dx * i;
            let c = col + dy * i;
            
            // Not being thrown off the board and that square has the same type of flag
            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === marker) {
                count++;
                winLine.push([r, c]);
            } else {
                break; // If there are repeated disconnections, stop scanning in this direction immediately.
            }
        }

        // Scan in the negative direction
        for (let i = 1; i <= 4; i++) {
            let r = row - dx * i;
            let c = col - dy * i;
            
            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === marker) {
                count++;
                winLine.push([r, c]);
            } else {
                break;
            }
        }

        // If the total number of consecutive flags is >= 5, return the object.
        if (count >= 5) {
            return { win: true, winLine: winLine };
        }
    }

    // If check all four directions and none of them have 5 stones
    return { win: false, winLine: [] };
};