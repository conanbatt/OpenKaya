//Check API and test "toggle status" feature
//v0.1.0

/** History
0.1.0: creation of this test file
*/

/** Note
(i, j) coords are relative to a double array board[i][j] so (i, 1) corresponds to the black group in the following example:
	var clear_territory_board = [
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"]
            ];
*/

function are_equal_boards(board1, board2){
  
	for(var i=0;i<board1.length;i++){
		for(var j=0;j<board1[i].length;j++){
			if(board1[i][j] != board2[i][j]){ 
				return false;
			}
		}
	}
	return true;
}


test("ScoreBoard should define the constants used to mark groups dead or alive", function(){

	ok(ScoreBoard.BLACK == "B");
	ok(ScoreBoard.WHITE == "W");
	ok(ScoreBoard.EMPTY == "*");
	ok(ScoreBoard.BLACK_DEAD == "N");
	ok(ScoreBoard.WHITE_DEAD == "E");
	ok(ScoreBoard.BLACK_ALIVE == "A");
	ok(ScoreBoard.WHITE_ALIVE == "Z");
	ok(ScoreBoard.TERRITORY_BLACK == "BP");
	ok(ScoreBoard.TERRITORY_WHITE == "WP");
	ok(ScoreBoard.TERRITORY_UNKNOWN == "X");
});

test("Should be able to mark a black string of stones as dead or alive if you select one of them", function(){

	var test_board = [
                ["*","B","*","W","*","B"],
                ["*","B","*","W","*","*"],
                ["B","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","B","*"]
            ];

	var scoreboard = new ScoreBoard(test_board);

	//mark black group as dead
	var toggledBoard = scoreboard.toggleAt(0, 1);
	var expected_result1 = [
                ["*","N","*","W","*","B"],
                ["*","N","*","W","*","*"],
                ["N","N","*","W","*","*"],
                ["*","N","*","W","*","*"],
                ["*","N","*","W","*","*"],
                ["*","N","*","W","B","*"]
            ];

	ok(are_equal_boards(toggledBoard, expected_result1));
    

	//now make black group back to life
	toggledBoard = scoreboard.toggleAt(4,1);
	var expected_result2 = [
                ["*","A","*","W","*","B"],
                ["*","A","*","W","*","*"],
                ["A","A","*","W","*","*"],
                ["*","A","*","W","*","*"],
                ["*","A","*","W","*","*"],
                ["*","A","*","W","B","*"]
            ];

	ok(are_equal_boards(toggledBoard, expected_result2));
    

	//now make black group dead again
	toggledBoard = scoreboard.toggleAt(5,1);
	var expected_result3 = [
                ["*","N","*","W","*","B"],
                ["*","N","*","W","*","*"],
                ["N","N","*","W","*","*"],
                ["*","N","*","W","*","*"],
                ["*","N","*","W","*","*"],
                ["*","N","*","W","B","*"]
            ];

	ok(are_equal_boards(toggledBoard, expected_result3));

    
	//retrieve result with getBoardArray()
	var result_board = scoreboard.getBoardArray();

	ok(are_equal_boards(result_board, expected_result3));
});


test("Should be able to mark a white string of stones as dead or alive if you select one of them", function(){

	var test_board = [
                ["*","B","*","W","*","W"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","W","W"],
                ["*","B","*","W","B","W"],
                ["*","B","*","W","*","W"]
            ];

	var scoreboard = new ScoreBoard(test_board);

	//mark white group as dead
	var toggledBoard = scoreboard.toggleAt(2, 3);
	var expected_result1 = [
                ["*","B","*","E","*","W"],
                ["*","B","*","E","*","*"],
                ["*","B","*","E","*","*"],
                ["*","B","*","E","E","E"],
                ["*","B","*","E","B","E"],
                ["*","B","*","E","*","E"]
            ];

	ok(are_equal_boards(toggledBoard, expected_result1));
    

	//now make white group back to life
	toggledBoard = scoreboard.toggleAt(5, 3);
	var expected_result2 = [
                ["*","B","*","Z","*","W"],
                ["*","B","*","Z","*","*"],
                ["*","B","*","Z","*","*"],
                ["*","B","*","Z","Z","Z"],
                ["*","B","*","Z","B","Z"],
                ["*","B","*","Z","*","Z"]
            ];

	ok(are_equal_boards(toggledBoard, expected_result2));
    

	//now make white group dead again
	toggledBoard = scoreboard.toggleAt(1, 3);
	var expected_result3 = [
                ["*","B","*","E","*","W"],
                ["*","B","*","E","*","*"],
                ["*","B","*","E","*","*"],
                ["*","B","*","E","E","E"],
                ["*","B","*","E","B","E"],
                ["*","B","*","E","*","E"]
            ];

	ok(are_equal_boards(toggledBoard, expected_result3));


	//retrieve result with getBoardArray()
	var result_board = scoreboard.getBoardArray();

	ok(are_equal_boards(result_board, expected_result3));
    
});


test("Should implement getSize()", function(){

	var test_board = [
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"]
            ];

	var scoreboard = new ScoreBoard(test_board);

	var size = scoreboard.getSize();
	
	ok(size == 6);
});

test("Should store a board independantly of its source and the result of getBoard should be independant from its creator", function(){

	var test_board = [
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"]
            ];

	var scoreboard = new ScoreBoard(test_board);
	
	test_board[0][1] = "W";
	test_board[1][0] = "W";
	test_board[1][1] = "W";

	var saved_board = scoreboard.getBoardArray();
	var expected_result = [
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"]
            ];

	ok(are_equal_boards(saved_board, expected_result));
	
	saved_board[3][3] = "B";
	saved_board[4][4] = "B";
	saved_board[5][5] = "B";

	var saved_board2 = scoreboard.getBoardArray();
	var expected_result2 = [
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"]
            ];

	ok(are_equal_boards(saved_board2, expected_result2));
	
	
});


test("Should be able to clone a board", function(){

	var test_board = [
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"]
            ];

	var scoreboard = new ScoreBoard(test_board);

	var cloned_board = scoreboard.clone();
	
	//change the original test board
	scoreboard.toggleAt(1, 4);

	var saved_board = cloned_board.getBoardArray();	
	var expected_result = [
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"],
                ["*","B","*","W","*","*"]
            ];

	ok(are_equal_boards(saved_board, expected_result));
});

