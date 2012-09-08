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


test("BoardExactAnalysis should find some dame territories ", function(){

	var test_board1 = [
                [ e , B , B , e , W , B ],
                [ e , B , e , W , W , e ],
                [ B , B , e , W , e , e ],
                [ e , B , e , W , e , e ],
                [ B , B , e , W , e , e ],
                [ e , e , W , e , B , e ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);

	scoreboard1.findDame(false);

	var analysedBoard1 = scoreboard1.getBoardArray();
	var expected_result1 = [
                [ e , B , B , D , W , B ],
                [ e , B , D , W , W , D ],
                [ B , B , D , W , e , e ],
                [ e , B , D , W , e , e ],
                [ B , B , D , W , D , e ],
                [ e , D , W , D , B , e ]
            ];

	ok(are_similar_boards(analysedBoard1, expected_result1));
    
	var test_board2 = [
                [ e  , BA , BA , e  , WA , BD ],
                [ e  , BA , e  , WA , WA , e  ],
                [ BA , BA , e  , WA , e  , e  ],
                [ e  , BA , e  , WA , e  , e  ],
                [ BA , BA , e  , WA , e  , e  ],
                [ e  , e  , W , e  , BD , e  ]
            ];

	var scoreboard2 = new BoardExactAnalysis(test_board2, 0.5, 0, 0);

	scoreboard2.findDame(true);

	var analysedBoard2 = scoreboard2.getBoardArray();
	var expected_result2 = [
                [ e  , BA , BA , D  , WA , BD ],
                [ e  , BA , D  , WA , WA , e  ],
                [ BA , BA , D  , WA , e  , e  ],
                [ e  , BA , D  , WA , e  , e  ],
                [ BA , BA , D  , WA , e  , e  ],
                [ e  , e  , W , e  , BD , e  ]
            ];

	ok(are_similar_boards(analysedBoard2, expected_result2));
    
});
