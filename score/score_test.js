//TODO this should be in the SCORE board as constants
var BLACK = "B"
var WHITE = "W"
var EMPTY = "*"
var BLACK_DEAD = "N"
var WHITE_DEAD = "E"
var NO_OWNER = "X"

// Declaration
var japanese_score;
var chinese_score;

// Helper functions
	function genericSetup(board) {
		japanese_score = new Score("Japanese", board);
		chinese_score = new Score("Chinese", board); //TBD later ?. Main difference is that each stone is counted for territory
	}

	function genericTeardown() {
		japanese_score = undefined;
		chinese_score = undefined;
	}

//NOTE: standard test board is 6x6

// No point board
	module("No points", {
		setup: function() {
			genericSetup([
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("Should count 0 points for both without stones on the board(Japanese)", function(){
		var jscore = japanese_score.calculate_score();
		equal(jscore.black_points, 0);
		equal(jscore.white_points, 0);
	});

	test("Should count 0 points for both without stones on the board(Chinese)", function(){
		var cscore = chinese_score.calculate_score();
		equal(cscore.black_points, 0);
		equal(cscore.white_points, 0);
	});


// Single stone board
	module("Single stone board", {
		setup: function() {
			genericSetup([
				["B","*","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("Should count 35(Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points, 35);
		equal(score.white_points, 0);
	});

	test("Should count 36(Chinese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points, 36);
		equal(score.white_points, 0);
	});


// Neutral board
	module("Neutral board", {
		setup: function() {
			genericSetup([
				["B","W","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"],
				["*","*","*","*","*","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("Should count 0 points (Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points, 0);
		equal(score.white_points, 0);
	});
	test("Should count 1 point for each (Japanese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points, 1);
		equal(score.white_points, 1);
	});


// Black territory board
	module("Black territory board", {
		setup: function() {
			genericSetup([
				["*","B","*","*","*","*"],
				["*","B","*","*","*","*"],
				["*","B","*","*","*","*"],
				["*","B","*","W","*","*"],
				["*","B","*","*","*","*"],
				["*","B","*","*","*","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("Should count territory for black(Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points, 6);
		equal(score.white_points, 0);
	});

	test("Should count territory for black(Chinese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points, 12);
		equal(score.white_points, 1);
	});


// Both territory board
	module("Both territory board", {
		setup: function() {
			genericSetup([
				["*","B","*","W","*","*"],
				["*","B","*","W","*","*"],
				["*","B","*","W","*","*"],
				["*","B","*","W","*","*"],
				["*","B","*","W","*","*"],
				["*","B","*","W","*","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("Should count territory for both(Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points, 6);
		equal(score.white_points, 12);
	});

	test("Should count territory for both(Chinese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points, 12);
		equal(score.white_points, 18);
	});

//Territory in the corner
	module("Territory in the corner", {
		setup: function() {
			genericSetup([
				["*","B","B","W","W","W"],
				["B","*","B","W","W","W"],
				["B","B","B","W","W","W"],
				["B","B","B","W","W","W"],
				["B","B","B","W","*","W"],
				["B","B","B","W","W","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("Should count territory for both(Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points, 2);
		equal(score.white_points, 2);
	});

	test("Should count territory for both(Chinese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points, 18);
		equal(score.white_points, 18);
	});


// Seki board 1 (eyes)
	module("Seki board 1", {
		setup: function() {
			genericSetup([
				["B","B","*","W","W","W"],
				["B","B","B","W","W","W"],
				["B","B","B","W","W","W"],
				["B","B","B","W","W","W"],
				["B","B","B","W","W","W"],
				["*","B","B","W","W","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("should count 0 for both (Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points, 0);
		equal(score.white_points, 0);
	});

  	test("should count points for both (Chinese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points, 17);
		equal(score.white_points, 18);
	});


//TODO check this out : http://www.lifein19x19.com/forum/viewtopic.php?p=79204#p79204"


// Seki board 2 (eyes)
	module("Seki board 2", {
		setup: function() {
			genericSetup([
				["B","B","*","W","*","B"],
				["B","B","B","W","B","B"],
				["B","B","B","W","B","B"],
				["B","B","B","W","B","B"],
				["B","B","B","W","B","B"],
				["*","B","B","W","B","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("should count 0 for both (Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points,0);
		equal(score.white_points,0);
	});

	test("should count points for both (Chinese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points,28);
		equal(score.white_points,6);
	});

// Seki board 3 (eyes + no eyes)
	module("Seki board 3", {
		setup: function() {
			genericSetup([
				["W","*","B","*","B","B"],
				["*","W","B","B","B","B"],
				["B","B","W","W","B","B"],
				["*","B","W","W","W","W"],
				["B","B","W","W","*","W"],
				["B","B","W","W","W","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});


// Seki board 4 (big eyes, small eyes...)
	module("Seki board 4", {
		setup: function() {
			genericSetup([
				["*","*","B","*","W","*"],
				["*","*","B","W","W","*"],
				["B","B","B","W","W","*"],
				["*","*","W","B","W","W"],
				["W","W","*","B","B","B"],
				["*","W","*","B","*","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("should count 0 for both (Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points,0);
		equal(score.white_points,3);
	});

	test("should count points for both (Chinese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points,16);
		equal(score.white_points,15);
	});


// Seki board 5 (real game example...)
	module("Seki board 5", {
		setup: function() {
			genericSetup([
				["*","B","B","B","W","*","*","*","*"],
				["W","*","B","W","W","*","W","*","*"],
				["W","W","B","W","*","*","W","*","*"],
				["B","W","W","B","W","W","*","*","*"],
				["B","B","B","B","W","*","W","*","*"],
				["*","*","B","B","B","W","*","*","*"],
				["*","*","B","B","W","*","W","*","*"],
				["*","*","B","W","W","W","*","*","*"],
				["*","*","B","B","W","*","*","*","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("should count points for both (Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points, 8);
		equal(score.white_points, 29);
	});

	test("should count points for both (Chinese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points,27);
		equal(score.white_points,52);
	});


// Seki board 6 (single pointers...)
	module("Seki board 5", {
		setup: function() {
			genericSetup([
				["*","W","*","W","*","W"],
				["W","*","W","*","W","*"],
				["*","W","*","W","*","W"],
				["W","*","W","*","W","*"],
				["*","W","*","W","*","W"],
				["W","*","W","*","W","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("should count points for white (Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points, 0);
		equal(score.white_points, 18);
	});

	test("should count points for both (Chinese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points, 0);
		equal(score.white_points, 36);
	});


// Black dead stones board
	module("Black dead stones board", {
		setup: function() {
			genericSetup([
				["B","B","*","W","W","N"],
				["B","B","*","W","W","N"],
				["B","B","*","W","W","N"],
				["B","B","*","W","W","N"],
				["B","B","*","W","W","N"],
				["B","B","*","W","W","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("should count dead stones double (Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points,0);
		equal(score.white_points,11);
	});

	test("should not count dead stones double (Chinese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points,12);
		equal(score.white_points,18);
	});


// White dead stones board
	module("White dead stones board", {
		setup: function() {
			genericSetup([
				["*","E","B","*","*","*"],
				["*","E","B","*","*","*"],
				["*","E","B","*","*","*"],
				["*","E","B","W","*","*"],
				["*","E","B","*","*","*"],
				["*","E","B","*","*","*"]
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

	test("should count dead stones double (Japanese)", function(){
		var score = japanese_score.calculate_score();
		equal(score.black_points,18);
		equal(score.white_points,0);
	});

	test("should not count dead stones double (Chinese)", function(){
		var score = chinese_score.calculate_score();
		equal(score.black_points,18);
		equal(score.white_points,1);
	});

// China breaker
// Juego con reglas chinas. Archivo: ~/Downloads/sgf/juego_chino_rompe_scoring.sgf
	module("Single stone board", {
		setup: function() {
			genericSetup([
				["W", "B", "B", "B", "*", "B", "*", "B", "W", "W", "*", "*", "N", "*", "W", "*", "W", "*", "W", ],
				["W", "W", "B", "B", "B", "*", "B", "*", "B", "W", "*", "W", "N", "N", "W", "W", "N", "W", "*", ],
				["W", "B", "B", "B", "W", "B", "*", "B", "B", "B", "W", "W", "W", "N", "*", "*", "N", "N", "W", ],
				["W", "W", "W", "W", "W", "B", "B", "E", "E", "*", "B", "W", "N", "N", "N", "N", "N", "W", "*", ],
				["*", "*", "N", "*", "W", "W", "W", "B", "*", "B", "B", "W", "W", "N", "N", "N", "N", "W", "W", ],
				["W", "N", "N", "W", "W", "B", "B", "B", "B", "W", "B", "W", "W", "W", "N", "W", "W", "N", "*", ],
				["*", "W", "N", "*", "W", "B", "B", "B", "W", "W", "W", "W", "*", "W", "N", "W", "*", "W", "W", ],
				["W", "*", "W", "W", "W", "W", "B", "B", "B", "B", "W", "W", "*", "*", "W", "*", "W", "W", "*", ],
				["*", "W", "W", "B", "W", "W", "W", "B", "W", "B", "B", "B", "W", "W", "*", "W", "W", "*", "W", ],
				["W", "W", "B", "B", "B", "W", "B", "B", "W", "W", "W", "B", "B", "W", "W", "B", "B", "W", "W", ],
				["W", "B", "*", "B", "E", "B", "B", "W", "W", "W", "W", "W", "B", "W", "W", "B", "B", "B", "W", ],
				["B", "B", "*", "B", "*", "*", "B", "B", "B", "B", "W", "W", "W", "W", "W", "B", "*", "B", "W", ],
				["*", "*", "B", "B", "B", "B", "*", "B", "B", "B", "W", "N", "N", "*", "W", "B", "*", "B", "B", ],
				["B", "B", "*", "*", "B", "*", "*", "*", "B", "B", "B", "W", "*", "*", "W", "B", "*", "*", "*", ],
				["B", "*", "*", "*", "*", "*", "*", "B", "W", "W", "B", "W", "*", "W", "B", "*", "*", "*", "*", ],
				["B", "*", "B", "*", "B", "*", "B", "B", "W", "W", "W", "W", "*", "W", "B", "*", "E", "*", "*", ],
				["B", "B", "B", "B", "B", "*", "*", "B", "B", "W", "W", "W", "W", "B", "*", "B", "B", "*", "*", ],
				["*", "*", "B", "*", "*", "*", "B", "B", "B", "B", "W", "W", "B", "B", "B", "*", "*", "*", "*", ],
				["*", "*", "B", "B", "B", "*", "B", "B", "B", "W", "W", "W", "W", "B", "*", "*", "*", "*", "*", ],
			]);
		},
		teardown: function() {
			genericTeardown();
		}
	});

