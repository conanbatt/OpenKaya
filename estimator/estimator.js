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
         * uses Influence-base control
         * for statement initiates board
         * 
         */

        for (var row = 0; row < size; ++row) {
            for (var col = 0; col < size; ++col) {
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
                        //document.write("yes, I get there boss");
                        tmpboard[row][col] = 0;
                        result.white_territory++;
                        result.white_captures++;

                    }
                    break;
                case WHITE_DEAD:
                    {
                        //document.write("yes, I get there boss");
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

            for (var row = 0; row < size; ++row) {
                for (var col = 0; col < size; ++col) {

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





        //document.write(result.board);
        return result;

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