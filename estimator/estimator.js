function Estimator() {

    var komi;

    // checks if the komi was defined in function call with a number value
    if (arguments.length > 0 && typeof arguments[0].komi == "number") {
        komi = arguments[0].komi;
    } else {
        komi = 6.5;
    }

    this.estimate = function (board_original) {
        var board = cloneBoard(board_original);
        //document.write(board);
        // creates a board which will be used throughout the processes
        var tmpboard = cloneBoard(board_original);
        var size = board.length;
        var cur_type;
        var result = {
            white_territory: 0,
            black_territory: 0,
            black_captures: 0,
            white_captures: 0,
            estimation: "",
            // creates a reference to the board Array Object
            board: board,
            groups: []
        };

        /*
         * uses Influence-based control
         * for statement initiates board
         * 
         */

        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                cur_type = board[row][col];

                switch (cur_type) {
                case EMPTY:
                    {
                        tmpboard[row][col] = 0;
                    }
                    break;
                case BLACK:
                    {
                        tmpboard[row][col] = 50;
                    }
                    break;
                case WHITE:
                    {
                        tmpboard[row][col] = -50;
                    }
                    break;
                case BLACK_DEAD:
                    {
                        tmpboard[row][col] = 0;
                        result.white_territory++;
                        result.white_captures++;

                    }
                    break;
                case WHITE_DEAD:
                    {
                        tmpboard[row][col] = 0;
                        result.black_territory++;
                        result.black_captures++;
                    }
                    break;
                    // default not to be used, but just in case, would default to EMPTY
                default:
                    {
                        tmpboard[row][col] = 0;
                    }
                }
            }
        }

        var radiate = 4;
        //does the radiation 4 times
        while (--radiate >= 0) {

            var tmpboard2 = cloneBoard(tmpboard);

            for (var row = 0; row < size; row++) {
                for (var col = 0; col < size; col++) {

                    var cur_value = tmpboard2[row][col];
                    var blackCount = 0;
                    var whiteCount = 0;

                    if (row + 1 < size) {

                        if (tmpboard2[row + 1][col] > 0) {
                            blackCount++;
                        } else if (tmpboard2[row + 1][col] < 0) {
                            whiteCount++;

                        }
                    }

                    if (row - 1 >= 0) {

                        if (tmpboard2[row - 1][col] > 0) {
                            blackCount++;
                        } else if (tmpboard2[row - 1][col] < 0) {
                            whiteCount++;

                        }
                    }

                    if (col + 1 < size) {

                        if (tmpboard2[row][col + 1] > 0) {
                            blackCount++;
                        } else if (tmpboard2[row][col + 1] < 0) {
                            whiteCount++;

                        }
                    }

                    if (col - 1 >= 0) {

                        if (tmpboard2[row][col - 1] > 0) {
                            blackCount++;
                        } else if (tmpboard2[row][col - 1] < 0) {
                            whiteCount++;

                        }
                    }

                    // algorithm says to take absolute value, but this works too
                    cur_value += blackCount;
                    cur_value -= whiteCount;

                    // assign new value to tmpboard
                    tmpboard[row][col] = cur_value;

                    // if we are in last iteration, cur_value is final value,
                    // so we can modify board and compute score right away
                    if (radiate == 0 && board[row][col] == EMPTY) {

                        if (cur_value == 0) {
                            board[row][col] = NO_OWNER;
                        } else if (cur_value > 0) {
                            board[row][col] = "BP";
                            result.black_territory++;
                        } else if (cur_value < 0) {
                            board[row][col] = "WP";
                            result.white_territory++;
                        }
                    }

                }
            }
        }

        // now we are ready to read tmpboard and board
        var difference = (result.white_territory + result.white_captures + komi) - (result.black_territory + result.black_captures);

        if (difference < 0) {
            result.estimation = "B+" + Math.abs(difference);
        } else if (difference > 0) {
            result.estimation = "W+" + difference;
        } else if (difference == 0) {
            result.estimation = "JIGO";
        }

        return result;

    }
    // makes a live chain dead and a dead one live
    // returns the new board
    this.toggle_LD = function (board0, move) {

        var board_LD = cloneBoard(board0);
        var cur_type = board_LD[move[0]][move[1]];

        var new_type;

        if (cur_type != BLACK && cur_type != WHITE && cur_type != BLACK_DEAD && cur_type != WHITE_DEAD) {

            return board_LD;

        }

        switch (cur_type) {
        case BLACK:
            {
                new_type = BLACK_DEAD;
            }
            break;
        case WHITE:
            {
                new_type = WHITE_DEAD;
            }
            break;
        case BLACK_DEAD:
            {
                new_type = BLACK;

            }
            break;
        case WHITE_DEAD:
            {
                new_type = WHITE;
            }
            break;
            // default not to be used, but just in case, would set same as cur_type
        default:
            {
                new_type = cur_type;
            }
        }

        var chain = findChain(board_LD, move, cur_type);

        for (var i = 0; i < chain.length; i++) {
            var row = chain[i][0];
            var col = chain[i][1];
            board_LD[row][col] = new_type;

        }

        return board_LD;

    }

    // finds and returns the chain
    var findChain = function (board, move, cur_type) {
            var coords = [];
            var current_coords;
            var stack_coords = [];
            var size = board.length;

            coords.push([move[0], move[1]]);
            stack_coords.push([move[0], move[1]]);

            while (current_coords = stack_coords.shift()) {

                var row = current_coords[0];
                var col = current_coords[1];

                if (row + 1 < size) {

                    if (board[row + 1][col] == cur_type && !contains(coords, [row + 1, col])) {

                        coords.push([row + 1, col]);
                        stack_coords.push([row + 1, col]);

                    }
                }

                if (row - 1 >= 0) {

                    if (board[row - 1][col] == cur_type && !contains(coords, [row - 1, col])) {

                        coords.push([row - 1, col]);
                        stack_coords.push([row - 1, col]);

                    }
                }

                if (col + 1 < size) {

                    if (board[row][col + 1] == cur_type && !contains(coords, [row, col + 1])) {

                        coords.push([row, col + 1]);
                        stack_coords.push([row, col + 1]);

                    }
                }

                if (col - 1 >= 0) {

                    if (board[row][col - 1] == cur_type && !contains(coords, [row, col - 1])) {

                        coords.push([row, col - 1]);
                        stack_coords.push([row, col - 1]);

                    }
                }
            }

            return coords;

        }


    var cloneBoard = function (cboard) {
            var dup = [];
            var tmp = [];
            for (var row in cboard) {
                for (var col in cboard) {
                    tmp[col] = (cboard[row][col] == undefined ? EMPTY : cboard[row][col]);
                }
                dup.push(tmp);
                tmp = [];
            }
            return dup;
        }
};

function contains(a, obj) {
    var i = 0;
    for (i = 0; i < a.length; i++) {
        var tempArray = a[i];
        if (tempArray[0] == obj[0] && tempArray[1] == obj[1]) {
            return true;
        }
    }


    return false;
}