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

test("Should be able to mark a black string of stones as dead or alive if you select one of them", function(){

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


test("Should be able to mark a white string of stones as dead or alive if you select one of them", function(){

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


test("Should implement getSize()", function(){

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

test("Should store a board independantly of its source and the result of getBoard should be independant from its creator", function(){

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


test("Should be able to clone a board", function(){

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

test("Should be able to count komi", function(){

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

test("Should be able to count marked territories", function(){

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

test("Should be able to count marked dead groups", function(){

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


//Check js inheritance feature
//v0.2.0

/** History
0.1.0: creation of this test file
0.2.0: rename test classes
*/

function parentClass(size) {
	//define some member variables
	this.size = size;
	this.value1 = "value1 from parent";
	this.value2 = "value2 from parent";
	this.constant1 = 1;
	this.constant2 = 1;
}

//static
parentClass.StaticConstant = 1;

//static
parentClass.staticFunction1 = function(s) {
	return "" + s + " from parentClass.staticFunction1";
};

parentClass.prototype.getSize  = function() {
	return this.size;
};

parentClass.prototype.getValue1  = function() {
	return this.value1;
};

parentClass.prototype.getValue2  = function() {
	return this.value2;
};

parentClass.prototype.doSomething  = function() {
	return this.size*this.size;
};


//childClass may be defined in another file than parentClass, but parentClass must be loaded first
function childClass(size, name) {
	this._base_childClass.call(this, size);//call parent constructor
	//new child member variables
	this.name = name;
	//redefine some parent variables
	this.value2 = "value2 from child";
	this.constant2 = 2;
}

extendClass(childClass, parentClass);//define inheritance

childClass.prototype.doSomething  = function() {
	var parentResult = this._base_childClass.prototype.doSomething.call(this);//call parent function
	return parentResult + parentClass.StaticConstant + this.constant1 + this.constant2;
};



test("Constructor should be able to call parent class", function(){

var expected_result = 10;
var parent = new parentClass(10);
var child = new childClass(10, "child");
ok(parent.size == expected_result);
ok(child.size == expected_result);

});

test("Child should be able to use parent member variables and can overwrite them", function(){

var parent = new parentClass(10);
var child = new childClass(10, "child");
ok(parent.getValue1() == "value1 from parent");
ok(child.getValue1() == "value1 from parent");
ok(parent.getValue2() == "value2 from parent");
ok(child.getValue2() == "value2 from child");
});

test("Child should be able to call parent functions", function(){

var parent = new parentClass(10);
var child = new childClass(10, "child");
ok(parent.doSomething() == 100);
ok(child.doSomething() == 104);
});


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




test("BoardApproximatedAnalysis.estimateTerritory should find some territories", function(){

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

