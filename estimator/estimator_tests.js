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



test("Inheritance: constructor should be able to call parent class", function(){

var expected_result = 10;
var parent = new parentClass(10);
var child = new childClass(10, "child");
ok(parent.size == expected_result);
ok(child.size == expected_result);

});

test("Inheritance: child class should be able to use parent member variables and can overwrite them", function(){

var parent = new parentClass(10);
var child = new childClass(10, "child");
ok(parent.getValue1() == "value1 from parent");
ok(child.getValue1() == "value1 from parent");
ok(parent.getValue2() == "value2 from parent");
ok(child.getValue2() == "value2 from child");
});

test("Inheritance: child class should be able to call parent functions", function(){

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
var KB = ScoreBoard.TERRITORY_KO_BLACK;
var KW = ScoreBoard.TERRITORY_KO_WHITE;
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


test("BoardExactAnalysis should get group properties correctly", function(){

	var test_board = [
                [ e  , B  , W , W  , W , B  ],
                [ e  , B  , e  , W  , e  , W ],
                [ B  , B  , W , W  , W , e  ],
                [ e  , B  , B  , W  , W , W ],
                [ e  , e  , B  , W  , W , W ],
                [WD, B  , B  , W  ,BD, e  ]
            ];

	var scoreboard = new BoardExactAnalysis(test_board, 0.5, 0, 0);
	var findgroups = new FindGroups(test_board);

	var groups = findgroups.getBoardArray();
	var expected_result = [
                [ "T0" , "B0" , "W0" , "W0" , "W0" , "B1"  ],
                [ "T0" , "B0" , "T1" , "W0"  , "T2" , "W1" ],
                [ "B0" , "B0" , "W0" , "W0" , "W0" , "T3" ],
                [ "T4" , "B0" , "B0" , "W0" , "W0" , "W0" ],
                [ "T4" , "T4" , "B0" , "W0" , "W0" , "W0" ],
                [ "W2" , "B0" , "B0" , "W0" , "B2"  , "T5" ]
            ];

	ok(are_equal_boards(groups, expected_result));
	
	ok(scoreboard.groupNames[ScoreBoard.getKey(0, 0)] == "T0");
	ok(scoreboard.groupNames[ScoreBoard.getKey(4, 4)] == "W0");
	ok(scoreboard.groupNames[ScoreBoard.getKey(5, 4)] == "B2");

	ok(scoreboard.groupCoords["W0"].length == (14*2));
	ok(scoreboard.groupLibCoords["W2"].length == (1*2));
	
	var expectedNeighbors = ["T0", "W0", "T1", "T4", "W2"];
	var testOk = true;
	for(var i=0; i<5; i++) {
		if(scoreboard.groupNeighbors["B0"][expectedNeighbors[i]] != true) {
			testOk = false;
		}
	}
	ok(testOk);
	
	ok(scoreboard.metagroupChildren[scoreboard.metagroupName["B0"]][0] == "B0");
	ok(scoreboard.metagroupProperties[scoreboard.metagroupName["W2"]][BoardExactAnalysis.PROPERTY_METAGROUP_IS_DEAD] == true);
});


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
                [ B , B , D , W , U , U ],
                [ e , B , D , W , U , U ],
                [ B , B , D , W , D , U ],
                [ U , D , W , D , B , U ]
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
                [  e  , BA , D  , WA , e  , e  ],
                [ BA , BA , D  , WA , e  , e  ],
                [  U  ,  U , W , e  , BD , e  ]
            ];

	ok(are_similar_boards(analysedBoard2, expected_result2));
    
});

test("BoardExactAnalysis should mark alive groups next to marked-as-dead group", function(){

	var test_board1 = [
                [ e , B , B , e , W , BD],
                [ e , B , e , e , W , e ],
                [ B , B , e , W , e , e ],
                [ e , e , e , W , e , e ],
                [ B , B , e , W , e , e ],
                [ WD, e , W , e , B , e ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);

	ok(scoreboard1.getGroupStatusAt(0,4) == ScoreBoard.STATUS_GROUP_ALIVE);
	ok(scoreboard1.getGroupStatusAt(0,5) == ScoreBoard.STATUS_GROUP_DEAD);
	ok(scoreboard1.getGroupStatusAt(1,4) == ScoreBoard.STATUS_GROUP_ALIVE);
	ok(scoreboard1.getGroupStatusAt(4,0) == ScoreBoard.STATUS_GROUP_ALIVE);
	ok(scoreboard1.getGroupStatusAt(4,1) == ScoreBoard.STATUS_GROUP_ALIVE);
	ok(scoreboard1.getGroupStatusAt(5,0) == ScoreBoard.STATUS_GROUP_DEAD);
});


test("BoardExactAnalysis should find group connections", function(){

	var test_board1 = [
                [ e ,   B , e ,  WA , e , WD],
                [ e ,   e , B ,  e , WA , e ],
                [ B ,   B , e ,  e , e , e ],
                [ e ,   e , W , W , e , W ],
                [ B ,   B , W ,  e , e , W ],
                [ WD, e , W , W , e , W ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);
	scoreboard1.findConnections();
	
	ok(scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(0, 1), scoreboard1.getGroupNameAt(1, 2)));
	ok(scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(0, 1), scoreboard1.getGroupNameAt(2, 0)));
	ok(scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(0, 1), scoreboard1.getGroupNameAt(4, 0)));
	ok(scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(1, 2), scoreboard1.getGroupNameAt(2, 1)));
	ok(scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(2, 1), scoreboard1.getGroupNameAt(4, 0)));

	ok(scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(0, 3), scoreboard1.getGroupNameAt(1, 4)));
	ok(!scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(0, 5), scoreboard1.getGroupNameAt(1, 4)));

	ok(scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(3, 3), scoreboard1.getGroupNameAt(3, 5)));


	var test_board2 = [
                [  e ,  B ,  e ,  e ,  e ,  e ],
                [  e ,  W , B ,  B ,  W ,  B ],
                [  e ,  W ,  B ,  W ,  e ,  W ],
                [  W , B ,  e ,  e ,  e ,  e ],
                [  B ,  e ,  B ,  W ,  e ,  W ],
                [  W , B ,  W ,  e ,  W ,  e ]
            ];

	var scoreboard2 = new BoardExactAnalysis(test_board2, 0.5, 0, 0);
	scoreboard2.findConnections();
	ok(scoreboard2.isSameMetagroup(scoreboard2.getGroupNameAt(0, 1), scoreboard2.getGroupNameAt(1, 2)));
	ok(scoreboard2.isSameMetagroup(scoreboard2.getGroupNameAt(1, 4), scoreboard2.getGroupNameAt(2, 3)));
	ok(scoreboard2.isSameMetagroup(scoreboard2.getGroupNameAt(1, 4), scoreboard2.getGroupNameAt(2, 5)));
	ok(scoreboard2.isSameMetagroup(scoreboard2.getGroupNameAt(3, 1), scoreboard2.getGroupNameAt(4, 2)));
	ok(scoreboard2.isSameMetagroup(scoreboard2.getGroupNameAt(4, 3), scoreboard2.getGroupNameAt(4, 5)));
	ok(scoreboard2.isSameMetagroup(scoreboard2.getGroupNameAt(4, 3), scoreboard2.getGroupNameAt(5, 4)));

	
});


test("BoardExactAnalysis should find simple eyes", function(){

	var test_board1 = [
                [ e ,  B ,  e ,  e , e ,  e],
                [ B ,  B ,  B ,  e , e ,  e],
                [ e ,  B ,  e ,  B , e ,  e],
                [ B ,  B ,  B ,  e , B ,  e],
                [ e ,  B ,  e ,  B , W ,  e],
                [ e ,  W ,  B ,  W , W ,  e]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);
	scoreboard1.findConnections();
	scoreboard1.lookForSimpleEyeOrKo();
	
	ok(scoreboard1.getTerritoryPropAt(0, 0, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE) == true);
	ok(scoreboard1.getTerritoryPropAt(2, 0, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE) == true);
	ok(scoreboard1.getTerritoryPropAt(4, 0, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE) != true);
	ok(scoreboard1.getTerritoryPropAt(5, 0, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE) != true);
	ok(scoreboard1.getTerritoryPropAt(0, 2, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE) != true);
	ok(scoreboard1.getTerritoryPropAt(2, 2, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE) == true);
	ok(scoreboard1.getTerritoryPropAt(4, 2, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE) != true);
	ok(scoreboard1.getTerritoryPropAt(3, 3, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE) != true);
	ok(scoreboard1.getTerritoryPropAt(4, 5, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE) != true);


});


test("BoardExactAnalysis should find ko", function(){
	var test_board1 = [
                [  e ,  e ,  e ,  e ,  e ,  e ],
                [  e ,  B ,  W ,  e ,  e ,  e ],
                [  B ,  e ,  B ,  W ,  e ,  e ],
                [  e ,  B ,  W ,  e ,  e ,  W ],
                [  e ,  e ,  e ,  B ,  W ,  e ],
                [  e ,  e ,  B ,  e ,  B ,  W ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);
	scoreboard1.findConnections();
	scoreboard1.lookForSimpleEyeOrKo();

	var analysedBoard1 = scoreboard1.getBoardArray();
	var expected_result1 = [
                [  U ,  U ,  U ,  U ,  U ,  U ],
                [  U ,  B ,  W ,  U ,  U ,  U ],
                [  B ,  KB ,  B ,  W ,  U ,  U ],
                [  U ,  B ,  W ,  U ,  U ,  W ],
                [  U ,  U ,  U ,  B ,  W ,  KW ],
                [  U ,  U ,  B ,  KB ,  B ,  W ]
            ];

	ok(are_similar_boards(analysedBoard1, expected_result1));
 	
});


test("BoardExactAnalysis should find some dead groups in atari (findAtariCapturedForSure)", function(){
	var test_board1 = [
                [  e ,  B ,  e ,  B ,  e ,  W ],
                [  B ,  e ,  B ,  e ,  W ,  B ],
                [  B ,  W ,  B ,  e ,  W ,  e ],
                [  e ,  B ,  W ,  W ,  W ,  e ],
                [  e ,  e ,  e ,  B ,  B ,  W ],
                [  e ,  e ,  W ,  W , W ,  e ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);
	scoreboard1.findAtariCapturedForSure();

	ok(!scoreboard1.isGroupDead(scoreboard1.getGroupNameAt(0, 5)));
	ok(!scoreboard1.isGroupDead(scoreboard1.getGroupNameAt(1, 5)));
	ok(scoreboard1.isGroupDead(scoreboard1.getGroupNameAt(2, 1)));
	ok(scoreboard1.isGroupDead(scoreboard1.getGroupNameAt(4, 4)));
	ok(scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(3, 3), scoreboard1.getGroupNameAt(4, 5)));
	ok(scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(3, 3), scoreboard1.getGroupNameAt(5, 3)));
	ok(scoreboard1.getMetagroupProp(scoreboard1.getGroupNameAt(3, 3), BoardExactAnalysis.PROPERTY_METAGROUP_HAS_ONE_EYE) != null);
 	
});


test("BoardExactAnalysis should find some eyes", function(){
	var test_board1 = [
                [  e ,  B ,  B ,  e ,  e ,  e ],
                [  B ,  e ,  B ,  e ,  B ,  e ],
                [  B ,  e ,  B ,  W ,  B ,  B ],
                [  B ,  B ,  W ,  e ,  B ,  e ],
                [  e ,  e ,  W ,  B ,  e ,  B ],
                [  e ,  e ,  W ,  e ,  B ,  e ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);
	scoreboard1.checkForEyes();

	var analysedBoard1 = scoreboard1.getBoardArray();
	var expected_result1 = [
                [  U ,  B ,  B ,  U ,  U ,  U ],
                [  B ,  TB ,  B ,  U ,  B ,  U ],
                [  B ,  TB ,  B ,  W ,  B ,  B ],
                [  B ,  B ,  W ,  U ,  B ,  U ],
                [  U ,  U ,  W ,  B ,  U ,  B ],
                [  U ,  U ,  W ,  U ,  B ,  U ]
            ];
	ok(are_similar_boards(analysedBoard1, expected_result1));

	ok(scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(0, 1), scoreboard1.getGroupNameAt(1, 0)));
	ok(scoreboard1.getMetagroupProp(scoreboard1.getGroupNameAt(1, 0), BoardExactAnalysis.PROPERTY_METAGROUP_HAS_ONE_EYE) != null);
	ok(scoreboard1.getMetagroupProp(scoreboard1.getGroupNameAt(4, 3), BoardExactAnalysis.PROPERTY_METAGROUP_HAS_ONE_EYE) == null);
 	
	var test_board2 = [
                [  e ,  e ,  W ,  W ,  e ,  e ],
                [  e ,  W ,  e ,  e ,  W ,  e ],
                [  e ,  W ,  e ,  e ,  W ,  e ],
                [  e ,  B ,  W ,  W ,  B ,  e ],
                [  W ,  B ,  B ,  B ,  B ,  e ],
                [  e ,  W ,  e ,  e ,  e ,  e ]
            ];

	var scoreboard2 = new BoardExactAnalysis(test_board2, 0.5, 0, 0);
	scoreboard2.checkForEyes();

	var analysedBoard2 = scoreboard2.getBoardArray();
	var expected_result2 = [
                [  U ,  U ,  W ,  W ,  U ,  U ],
                [  U ,  W ,  TW ,  TW ,  W ,  U ],
                [  U ,  W ,  TW ,  TW ,  W ,  U ],
                [  U ,  B ,  W ,  W ,  B ,  U ],
                [  W ,  B ,  B ,  B ,  B ,  U ],
                [  U ,  W ,  U ,  U ,  U ,  U ]
            ];
	ok(are_similar_boards(analysedBoard2, expected_result2));

	ok(scoreboard2.isSameMetagroup(scoreboard2.getGroupNameAt(0, 2), scoreboard2.getGroupNameAt(1, 1)));
	ok(scoreboard2.isSameMetagroup(scoreboard2.getGroupNameAt(0, 2), scoreboard2.getGroupNameAt(2, 4)));
	ok(scoreboard2.isSameMetagroup(scoreboard2.getGroupNameAt(0, 2), scoreboard2.getGroupNameAt(3, 2)));
	ok(scoreboard2.getMetagroupProp(scoreboard2.getGroupNameAt(0, 2), BoardExactAnalysis.PROPERTY_METAGROUP_HAS_ONE_EYE) != null);
	ok(scoreboard2.getMetagroupProp(scoreboard2.getGroupNameAt(4, 0), BoardExactAnalysis.PROPERTY_METAGROUP_HAS_ONE_EYE) == null);
 	
});


test("BoardExactAnalysis should find some live shapes", function(){
	var test_board1 = [
                [  e ,  B ,  W ,  e ,  e ,  e ],
                [  B ,  B ,  W ,  e ,  e ,  e ],
                [  e ,  B ,  W ,  e ,  B ,  B ],
                [  B ,  B ,  W ,  B ,  e ,  B ],
                [  e ,  e ,  W ,  B ,  B ,  e ],
                [  e ,  e ,  W ,  e ,  B ,  B ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);
	scoreboard1.checkForEyes();

	var analysedBoard1 = scoreboard1.getBoardArray();
	var expected_result1 = [
                [  TB ,  B ,  W ,  U ,  U ,  U ],
                [  B ,  B ,  W ,  U ,  U ,  U ],
                [  TB ,  B ,  W ,  U ,  B ,  B ],
                [  B ,  B ,  W ,  B ,  TB ,  B ],
                [  U ,  U ,  W ,  B ,  B ,  TB ],
                [  U ,  U ,  W ,  U ,  B ,  B ]
            ];
	ok(are_similar_boards(analysedBoard1, expected_result1));

	ok(scoreboard1.isSameMetagroup(scoreboard1.getGroupNameAt(2, 5), scoreboard1.getGroupNameAt(5, 5)));
	ok(scoreboard1.getMetagroupProp(scoreboard1.getGroupNameAt(0, 1), BoardExactAnalysis.PROPERTY_METAGROUP_IS_ALIVE) == true);
	ok(scoreboard1.getMetagroupProp(scoreboard1.getGroupNameAt(2, 5), BoardExactAnalysis.PROPERTY_METAGROUP_IS_ALIVE) == true);
 	
	var test_board2 = [
                [  B ,  e ,  B ,  e ,  B ,  B ],
                [  B ,  B ,  B ,  B ,  B ,  B ],
                [  B ,  B ,  W ,  W ,  W ,  W ],
                [  B ,  W ,  e ,  W ,  e ,  W ],
                [  B ,  W ,  W ,  e ,  W ,  e ],
                [  B ,  B ,  B ,  W ,  W ,  BA ]
            ];

	var scoreboard2 = new BoardExactAnalysis(test_board2, 0.5, 0, 0);
	scoreboard2.checkForEyes();

	var analysedBoard2 = scoreboard2.getBoardArray();
	var expected_result2 = [
                [  B ,  TB ,  B ,  TB ,  B ,  B ],
                [  B ,  B ,  B ,  B ,  B ,  B ],
                [  B ,  B ,  W ,  W ,  W ,  W ],
                [  B ,  W ,  TW ,  W ,  TW ,  W ],
                [  B ,  W ,  W ,  TW ,  W ,  U ],
                [  B ,  B ,  B ,  W ,  W ,  BA ]
            ];
	ok(are_similar_boards(analysedBoard2, expected_result2));

	ok(scoreboard2.isSameMetagroup(scoreboard2.getGroupNameAt(2, 2), scoreboard2.getGroupNameAt(4, 1)));
	ok(scoreboard2.isSameMetagroup(scoreboard2.getGroupNameAt(2, 2), scoreboard2.getGroupNameAt(5, 4)));
	ok(scoreboard2.getMetagroupProp(scoreboard2.getGroupNameAt(0, 0), BoardExactAnalysis.PROPERTY_METAGROUP_IS_ALIVE) == true);
	ok(scoreboard2.getMetagroupProp(scoreboard2.getGroupNameAt(5, 4), BoardExactAnalysis.PROPERTY_METAGROUP_IS_ALIVE) == true);
 	
});


test("BoardExactAnalysis.isAloneInTerritory", function(){
	var test_board1 = [
                [  e ,  e ,  W ,  e ,  e ,  B ],
                [  e ,  B ,  W ,  B ,  e ,  e ],
                [  e ,  B ,  W ,  W ,  W ,  W ],
                [  e ,  B ,  W ,  B ,  e ,  B ],
                [  e ,  e ,  W ,  B ,  e ,  B ],
                [  e ,  e ,  W ,  e ,  e ,  e ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);
	scoreboard1.findConnections();
	
	ok(scoreboard1.isAloneInTerritory(scoreboard1.metagroupName[scoreboard1.getGroupNameAt(1, 1)], scoreboard1.getGroupNameAt(0, 0)) == true);
	ok(scoreboard1.isAloneInTerritory(scoreboard1.metagroupName[scoreboard1.getGroupNameAt(0, 5)], scoreboard1.getGroupNameAt(0, 4)) == false);
	ok(scoreboard1.isAloneInTerritory(scoreboard1.metagroupName[scoreboard1.getGroupNameAt(4, 5)], scoreboard1.getGroupNameAt(5, 5)) == true);
});


test("BoardExactAnalysis should find some dead groups", function(){
	var test_board1 = [
                [  e ,  e ,  W ,  W ,  e ,  e ],
                [  e ,  B ,  W ,  B ,  e ,  e ],
                [  e ,  B ,  W ,  W , W , W ],
                [  e ,  B ,  W ,  B ,  e ,  W ],
                [  W , W , W ,  B ,  W , W ],
                [  e ,  e ,  W ,  e ,  W ,  e ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);
	scoreboard1.findDeadGroups();
	
	ok(scoreboard1.getMetagroupProp(scoreboard1.getGroupNameAt(2, 0), BoardExactAnalysis.PROPERTY_METAGROUP_IS_DEAD) != true);
	ok(scoreboard1.getMetagroupProp(scoreboard1.getGroupNameAt(3, 1), BoardExactAnalysis.PROPERTY_METAGROUP_IS_DEAD) == true);
	ok(scoreboard1.getMetagroupProp(scoreboard1.getGroupNameAt(3, 3), BoardExactAnalysis.PROPERTY_METAGROUP_IS_DEAD) == true);
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

