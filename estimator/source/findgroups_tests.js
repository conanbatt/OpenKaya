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


test("FindGroups should detect groups adequately", function(){

	var test_board = [
                [ e  , B  , W , W  , W , B  ],
                [ e  , B  , e  , W  , e  , W ],
                [ B  , B  , W , W  , W , e  ],
                [ e  , B  , B  , W  , W , W ],
                [ e  , e  , B  , W  , W , W ],
                [ e  , B  , B  , W  , B  , e  ]
            ];

	var findgroups = new FindGroups(test_board);

	var groups = findgroups.getBoardArray();
	var expected_result = [
                [ "T0" , "B0" , "W0" , "W0" , "W0" , "B1"  ],
                [ "T0" , "B0" , "T1" , "W0"  , "T2" , "W1" ],
                [ "B0" , "B0" , "W0" , "W0" , "W0" , "T3" ],
                [ "T4" , "B0" , "B0" , "W0" , "W0" , "W0" ],
                [ "T4" , "T4" , "B0" , "W0" , "W0" , "W0" ],
                [ "T4" , "B0" , "B0" , "W0" , "B2"  , "T5" ]
            ];

	ok(are_equal_boards(groups, expected_result));
    
});

test("FindGroups should add territories separators on first line", function(){

	var test_board = [
                [ e  , B  , e ,  e   , e  , B  ],
                [ e  , B  , e  , W  , e  , W ],
                [ B  , B  , W , W  , W , e  ],
                [ e  , B  , B  , W  , W , e ],
                [ e  , B  , B  , W  , W , e ],
                [ e  , e  , e  , e  , e  , e  ]
            ];

	var findgroups = new FindGroups(test_board);

	var groups = findgroups.getBoardArray();
	var expected_result = [
                [ "T0" , "B0" ,   U   ,    U    ,    U  , "B1"  ],
                [ "T0" , "B0" , "T1" , "W0"  , "T2" , "W1" ],
                [ "B0" , "B0" , "W0" , "W0" , "W0" , "T3" ],
                [ "T4" , "B0" , "B0" , "W0" , "W0" ,   U    ],
                [ "T4" , "B0" , "B0" , "W0" , "W0" ,   U    ],
                [   U   ,    U  ,   U   ,    U   ,    U   ,   U    ]
            ];

	ok(are_similar_boards(groups, expected_result));
	ok(findgroups.getTerritorySeparators().length >= 2);
    
});
