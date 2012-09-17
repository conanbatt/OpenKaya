//Check API and test "toggle status" feature
//v0.1.0

/** History
0.1.0: creation of this test file
*/

/** Note
(i, j) coords are relative to a double array board[i][j] so (i, 1) corresponds to the black group in the following example:
	var clear_territory_board = [
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ]
            ];
*/

var e = ScoreBoard.EMPTY;
var B = ScoreBoard.BLACK;
var W = ScoreBoard.WHITE;
var D = ScoreBoard.TERRITORY_DAME;
var BD = ScoreBoard.BLACK_DEAD;
var WD = ScoreBoard.WHITE_DEAD;
var BA = ScoreBoard.BLACK_ALIVE;
var WA = ScoreBoard.WHITE_ALIVE;
var TB = ScoreBoard.TERRITORY_BLACK;
var TW = ScoreBoard.TERRITORY_WHITE;
var TU = ScoreBoard.TERRITORY_UNKNOWN;
var U = "?";

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

//allow U as a wildcard
function are_similar_boards(board1, board2){
  
	for(var i=0;i<board1.length;i++){
		for(var j=0;j<board1[i].length;j++){
			if(board2[i][j] == U){ 
				continue;
			}
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

test("ScoreBoard should be able to mark a black string of stones as dead or alive if you select one of them", function(){

	var test_board = [
                [ e  , B  , e  , W  , e  , B  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ B  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , B  , e  ]
            ];

	var scoreboard = new ScoreBoard(test_board, 0.5, 0, 0);

	//mark black group as dead
	var toggledBoard = scoreboard.toggleAt(0, 1);
	var expected_result1 = [
                [ e  , BD , e  , W  , e  , B  ],
                [ e  , BD , e  , W  , e  , e  ],
                [ BD , BD , e  , W  , e  , e  ],
                [ e  , BD , e  , W  , e  , e  ],
                [ e  , BD , e  , W  , e  , e  ],
                [ e  , BD , e  , W  , B  , e  ]
            ];

	ok(are_equal_boards(toggledBoard, expected_result1));
    

	//now make black group back to life
	toggledBoard = scoreboard.toggleAt(4,1);
	var expected_result2 = [
                [ e  , BA , e  , W  , e  , B  ],
                [ e  , BA , e  , W  , e  , e  ],
                [ BA , BA , e  , W  , e  , e  ],
                [ e  , BA , e  , W  , e  , e  ],
                [ e  , BA , e  , W  , e  , e  ],
                [ e  , BA , e  , W  , B  , e  ]
            ];

	ok(are_equal_boards(toggledBoard, expected_result2));
    

	//now make black group dead again
	toggledBoard = scoreboard.toggleAt(5,1);
	var expected_result3 = [
                [ e  , BD , e  , W  , e  , B  ],
                [ e  , BD , e  , W  , e  , e  ],
                [ BD , BD , e  , W  , e  , e  ],
                [ e  , BD , e  , W  , e  , e  ],
                [ e  , BD , e  , W  , e  , e  ],
                [ e  , BD , e  , W  , B  , e  ]
            ];

	ok(are_equal_boards(toggledBoard, expected_result3));

    
	//retrieve result with getBoardArray()
	var result_board = scoreboard.getBoardArray();

	ok(are_equal_boards(result_board, expected_result3));
});


test("ScoreBoard should be able to mark a white string of stones as dead or alive if you select one of them", function(){

	var test_board = [
                [ e  , B  , e  , W  , e  , W  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , W  , W  ],
                [ e  , B  , e  , W  , B  , W  ],
                [ e  , B  , e  , W  , e  , W  ]
            ];

	var scoreboard = new ScoreBoard(test_board, 0.5, 0, 0);

	//mark white group as dead
	var toggledBoard = scoreboard.toggleAt(2, 3);
	var expected_result1 = [
                [ e  , B  , e  , WD , e  , W  ],
                [ e  , B  , e  , WD , e  , e  ],
                [ e  , B  , e  , WD , e  , e  ],
                [ e  , B  , e  , WD , WD , WD ],
                [ e  , B  , e  , WD , B  , WD ],
                [ e  , B  , e  , WD , e  , WD ]
            ];

	ok(are_equal_boards(toggledBoard, expected_result1));
    

	//now make white group back to life
	toggledBoard = scoreboard.toggleAt(5, 3);
	var expected_result2 = [
                [ e  , B  , e  , WA , e  , W  ],
                [ e  , B  , e  , WA , e  , e  ],
                [ e  , B  , e  , WA , e  , e  ],
                [ e  , B  , e  , WA , WA , WA ],
                [ e  , B  , e  , WA , B  , WA ],
                [ e  , B  , e  , WA , e  , WA ]
            ];

	ok(are_equal_boards(toggledBoard, expected_result2));
    

	//now make white group dead again
	toggledBoard = scoreboard.toggleAt(1, 3);
	var expected_result3 = [
                [ e  , B  , e  , WD , e  , W  ],
                [ e  , B  , e  , WD , e  , e  ],
                [ e  , B  , e  , WD , e  , e  ],
                [ e  , B  , e  , WD , WD , WD ],
                [ e  , B  , e  , WD , B  , WD ],
                [ e  , B  , e  , WD , e  , WD ]
            ];

	ok(are_equal_boards(toggledBoard, expected_result3));


	//retrieve result with getBoardArray()
	var result_board = scoreboard.getBoardArray();

	ok(are_equal_boards(result_board, expected_result3));
    
});


test("ScoreBoard should implement getSize()", function(){

	var test_board = [
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ]
            ];

	var scoreboard = new ScoreBoard(test_board, 0.5, 0, 0);

	var size = scoreboard.getSize();
	
	ok(size == 6);
});


test("ScoreBoard should implement getKey() and getCoordFromKey()", function(){

	var i1 = 0;
	var j1 = 3;
	var key1 = ScoreBoard.getKey(i1, j1);
	var ar1 = ScoreBoard.getCoordFromKey(key1);
	ok(ar1[0] == i1 && ar1[1] == j1);
	
	var i2 = 7;
	var j2 = 0;
	var key2 = ScoreBoard.getKey(i2, j2);
	var ar2 = ScoreBoard.getCoordFromKey(key2);
	ok(ar2[0] == i2 && ar2[1] == j2);
	
	var i3 = 3;
	var j3 = 3;
	var key3 = ScoreBoard.getKey(i3, j3);
	var ar3 = ScoreBoard.getCoordFromKey(key3);
	ok(ar3[0] == i3 && ar3[1] == j3);
	
});


test("ScoreBoard should store a board independantly of its source and the result of getBoard should be independant from its creator", function(){

	var test_board = [
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ]
            ];

	var scoreboard = new ScoreBoard(test_board, 0.5, 0, 0);
	
	test_board[0][1] =  W  ;
	test_board[1][0] =  W  ;
	test_board[1][1] =  W  ;

	var saved_board = scoreboard.getBoardArray();
	var expected_result = [
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ]
            ];

	ok(are_equal_boards(saved_board, expected_result));
	
	saved_board[3][3] =  B  ;
	saved_board[4][4] =  B  ;
	saved_board[5][5] =  B  ;

	var saved_board2 = scoreboard.getBoardArray();
	var expected_result2 = [
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ]
            ];

	ok(are_equal_boards(saved_board2, expected_result2));
	
	
});


test("ScoreBoard should be able to clone a board", function(){

	var test_board = [
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ]
            ];

	var scoreboard = new ScoreBoard(test_board, 0.5, 0, 0);

	var cloned_board = scoreboard.clone();
	
	//change the original test board
	scoreboard.toggleAt(1, 4);

	var saved_board = cloned_board.getBoardArray();	
	var expected_result = [
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ]
            ];

	ok(are_equal_boards(saved_board, expected_result));
});

test("ScoreBoard should be able to count komi", function(){

	var test_board = [
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ]
            ];

	{
		var scoreboard = new ScoreBoard(test_board, 0.5, 0, 0);
		scoreboard.countJapaneseResult();

		ok(scoreboard.getBlackScore() == 0);
		ok(scoreboard.getWhiteScore() == 0.5);
		ok(scoreboard.getGameResult() == "W+0.5");
	}
	{
		var scoreboard = new ScoreBoard(test_board, -4.5, 0, 0);
		scoreboard.countJapaneseResult();

		ok((scoreboard.getBlackScore() - scoreboard.getWhiteScore()) == 4.5);
		ok(scoreboard.getGameResult() == "B+4.5");
	}
});

test("ScoreBoard should be able to count marked territories", function(){

	var test_board = [
                [ TB , B  , e  , W  , TW , TW ],
                [ TB , B  , e  , W  , TW , TW ],
                [ TB , B  , e  , W  , TW , TW ],
                [ TB , B  , e  , W  , TW , TW ],
                [ TB , B  , e  , W  , TW , TW ],
                [ TB , B  , e  , W  , TW , TW ]
            ];

	var scoreboard = new ScoreBoard(test_board, 0.5, 0, 0);
	scoreboard.countJapaneseResult();

	ok(scoreboard.getBlackScore() == 6);
	ok(scoreboard.getWhiteScore() == 12.5);
	ok(scoreboard.getGameResult() == "W+6.5");
});

test("ScoreBoard should be able to count marked dead groups", function(){

	var test_board = [
                [ e  , BD , e  , e  , e  , e  ],
                [ e  , e  , e  , e  , e  , e  ],
                [ e  , e  , e  , e  , e  , e  ],
                [ e  , e  , e  , WD , e  , e  ],
                [ e  , e  , e  , e  , e  , e  ],
                [ e  , BD , e  , e  , e  , e  ]
            ];

	var scoreboard = new ScoreBoard(test_board, 0.5, 0, 0);
	scoreboard.countJapaneseResult();

	ok(scoreboard.getBlackScore() == 2);
	ok(scoreboard.getWhiteScore() == 4.5);
	ok(scoreboard.getGameResult() == "W+2.5");
});

