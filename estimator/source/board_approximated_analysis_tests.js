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




test("BoardApproximatedAnalysis: estimateTerritory should find some territories", function(){

	var test_board = [
                [ e , B  , e  , e , e  , e  ],
                [ e , B , e  , W, e  , e  ],
                [ e , B , e  , e , W , e  ],
                [ e , e  , e  , e , W , e  ],
                [ e , B , e  , e , W , e  ],
                [ e , e  , e  , e , e  , e  ],
            ];

	var scoreboard = new BoardApproximatedAnalysis(test_board, 0.5, 0, 0);

	scoreboard.estimateTerritory();

	var analysedBoard = scoreboard.getBoardArray();
	var expected_result = [
                [ TB , B  , U  , U , U  , U  ],
                [ TB , B , U , W, TW , U ],
                [ TB , B , U , U , W , TW ],
                [ U , U , U , U , W , TW ],
                [ U , B , U , U , W , U ],
                [ TB , U , U , U , U , U ],
            ];

	ok(are_similar_boards(analysedBoard, expected_result));
    
});
