var STARTING_TIME = 30;
var PERIOD_TIME = 5;
var PERIOD = 3;

function binder(method, object, args) {
	return function(orig_args) { method.apply(object, [orig_args].concat(args)); };
}

test("Configure Timer", function() {

	var test_remain = {};

	// Config
		var server = new Server();
		var config1 = {
			time_system: "Byoyomi",
			starting_time: STARTING_TIME,
			period_time: PERIOD_TIME,
			period: PERIOD,
			div_clock_b: "divb1",
			div_clock_w: "divw1",
			div_result: "divr1",
		}
		var board1 = new Board(config1);

		var config2 = {
			time_system: "Byoyomi",
			starting_time: STARTING_TIME,
			period_time: PERIOD_TIME,
			period: PERIOD,
			div_clock_b: "divb2",
			div_clock_w: "divw2",
			div_result: "divr2",
		}
		var board2 = new Board(config2);

		server.subscribe(board1);
		server.subscribe(board2);

	// Init Tests
		// Time and period
		test_remain[BLACK] = {
			'time': STARTING_TIME,
			'period':  PERIOD
		};
		test_remain[WHITE] = {
			'time': STARTING_TIME,
			'period':  PERIOD
		};
		deepEqual(board1.time.remain, test_remain, "B1: At startup the time is " + STARTING_TIME + " seconds AND " + PERIOD + " periods.");
		deepEqual(board2.time.remain, test_remain, "B1: At startup the time is " + STARTING_TIME + " seconds AND " + PERIOD + " periods.");

		// Status
		equal(board1.time.status, ST_PAUSED, "B1: Starts paused.");
		equal(board2.time.status, ST_PAUSED, "B2: Starts paused.");

		// Actual color
		equal(board1.time.actual_color, null, "B1: No color at startup.");
		equal(board2.time.actual_color, null, "B2: No color at startup.");

		// Timestamps
		equal(board1.time.last_resume, null, "B1: No timestamp for last resume.");
		equal(board2.time.last_resume, null, "B2: No timestamp for last resume.");
		equal(board1.time.last_pause, null, "B1: No timestamp for last pause.");
		equal(board2.time.last_pause, null, "B2: No timestamp for last pause.");

	// Start game
	server.start_game();

	// Play and test
	asyncTest("Black plays after 6 seconds", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].time = STARTING_TIME - 6;
			test_remain[WHITE].time = STARTING_TIME;
		  test_remain[BLACK].period = PERIOD;
		  test_remain[WHITE].period = PERIOD;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 6 seconds passed until B played.");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 6 seconds passed until B played.");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 6 seconds passed until B played.");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 6 seconds passed until B played.");
			equal(board1.time.remain[WHITE].period, test_remain[WHITE].period, "B1: 6 seconds passed until B played.");
			equal(board1.time.remain[BLACK].period, test_remain[BLACK].period, "B1: 6 seconds passed until B played.");
			equal(board2.time.remain[WHITE].period, test_remain[WHITE].period, "B2: 6 seconds passed until B played.");
			equal(board2.time.remain[BLACK].period, test_remain[BLACK].period, "B2: 6 seconds passed until B played.");
			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 5900);
	});

	// Play and test
	asyncTest("White plays 10 seconds after black", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK].time = STARTING_TIME - 6;
			test_remain[WHITE].time = STARTING_TIME - 10;
		  test_remain[BLACK].period = PERIOD;
		  test_remain[WHITE].period = PERIOD;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 10 seconds passed until W played.");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 10 seconds passed until W played.");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 10 seconds passed until W played.");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 10 seconds passed until W played.");
			equal(board1.time.remain[WHITE].period, test_remain[WHITE].period, "B1: 10 seconds passed until W played.");
			equal(board1.time.remain[BLACK].period, test_remain[BLACK].period, "B1: 10 seconds passed until W played.");
			equal(board2.time.remain[WHITE].period, test_remain[WHITE].period, "B2: 10 seconds passed until W played.");
			equal(board2.time.remain[BLACK].period, test_remain[BLACK].period, "B2: 10 seconds passed until W played.");
			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 9900);
	});

	// Play and test
	asyncTest("Black plays after 12 seconds", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].time = STARTING_TIME - 6 - 12;
			test_remain[WHITE].time = STARTING_TIME - 10;
		  test_remain[BLACK].period = PERIOD;
		  test_remain[WHITE].period = PERIOD;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 12 seconds passed until B played again. It was a great move!");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 12 seconds passed until B played again. It was a great move!");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 12 seconds passed until B played again. It was a great move!");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 12 seconds passed until B played again. It was a great move!");
			equal(board1.time.remain[WHITE].period, test_remain[WHITE].period, "B1: 12 seconds passed until B played again. It was a great move!");
			equal(board1.time.remain[BLACK].period, test_remain[BLACK].period, "B1: 12 seconds passed until B played again. It was a great move!");
			equal(board2.time.remain[WHITE].period, test_remain[WHITE].period, "B2: 12 seconds passed until B played again. It was a great move!");
			equal(board2.time.remain[BLACK].period, test_remain[BLACK].period, "B2: 12 seconds passed until B played again. It was a great move!");
			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 11900);
	});

	// Play and test
	asyncTest("White tries to play 22 seconds after black. He has used up his main time.", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK].time = STARTING_TIME - 6 - 12;
			test_remain[WHITE].time = STARTING_TIME - 10 - 20 + PERIOD_TIME;
		  test_remain[BLACK].period = PERIOD;
		  test_remain[WHITE].period = PERIOD - 1;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 22 seconds passed until W played. He is now in his first byo-yomi.");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 22 seconds passed until W played. He is now in his first byo-yomi.");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 22 seconds passed until W played. He is now in his first byo-yomi.");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 22 seconds passed until W played. He is now in his first byo-yomi.");
			equal(board1.time.remain[WHITE].period, test_remain[WHITE].period, "B1: 22 seconds passed until W played. He is now in his first byo-yomi.");
			equal(board1.time.remain[BLACK].period, test_remain[BLACK].period, "B1: 22 seconds passed until W played. He is now in his first byo-yomi.");
			equal(board2.time.remain[WHITE].period, test_remain[WHITE].period, "B2: 22 seconds passed until W played. He is now in his first byo-yomi.");
			equal(board2.time.remain[BLACK].period, test_remain[BLACK].period, "B2: 22 seconds passed until W played. He is now in his first byo-yomi.");
			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 21900);
	});

	// Play and test
	asyncTest("Black plays after 18 seconds, he has 12 seconds main time, so uses one byoyomi period", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].time = STARTING_TIME - 6 - 12 - 12 + PERIOD_TIME - 5 + PERIOD_TIME;
			test_remain[WHITE].time = STARTING_TIME - 10 - 20 + PERIOD_TIME;
		  test_remain[BLACK].period = PERIOD - 2;
		  test_remain[WHITE].period = PERIOD - 1;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 18 seconds passed until B played again. He has two periods left!");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 18 seconds passed until B played again. He has two periods left!");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 18 seconds passed until B played again. He has two periods left!");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 18 seconds passed until B played again. He has two periods left!");
			equal(board1.time.remain[WHITE].period, test_remain[WHITE].period, "B1: 18 seconds passed until B played again. He has two periods left!");
			equal(board1.time.remain[BLACK].period, test_remain[BLACK].period, "B1: 18 seconds passed until B played again. He has two periods left!");
			equal(board2.time.remain[WHITE].period, test_remain[WHITE].period, "B2: 18 seconds passed until B played again. He has two periods left!");
			equal(board2.time.remain[BLACK].period, test_remain[BLACK].period, "B2: 18 seconds passed until B played again. He has two periods left!");
			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 17900);
	});

	// Play and test
	asyncTest("White tries to play 2 seconds after black, this should cost no byoyomi periods.", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK].time = STARTING_TIME - 6 - 12 - 12 + PERIOD_TIME - 5 + PERIOD_TIME;
			test_remain[WHITE].time = STARTING_TIME - 10 - 20 + PERIOD_TIME;
		  test_remain[BLACK].period = PERIOD - 2;
		  test_remain[WHITE].period = PERIOD - 1;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 2 seconds passed until W played. That was fast!");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 2 seconds passed until W played. That was fast!");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 2 seconds passed until W played. That was fast!");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 2 seconds passed until W played. That was fast!");
			equal(board1.time.remain[WHITE].period, test_remain[WHITE].period, "B1: 2 seconds passed until W played. That was fast!");
			equal(board1.time.remain[BLACK].period, test_remain[BLACK].period, "B1: 2 seconds passed until W played. That was fast!");
			equal(board2.time.remain[WHITE].period, test_remain[WHITE].period, "B2: 2 seconds passed until W played. That was fast!");
			equal(board2.time.remain[BLACK].period, test_remain[BLACK].period, "B2: 2 seconds passed until W played. That was fast!");
			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 1900);
	});

	// Play and test
	asyncTest("Black tries to play 11 seconds after white, but he only has two byoyomi periods left.", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].time = STARTING_TIME - 6 - 12 - 12 + PERIOD_TIME - 5 + PERIOD_TIME - 5 + PERIOD_TIME - 5; // Time ended and no period remain
			test_remain[WHITE].time = STARTING_TIME - 10 - 20 + PERIOD_TIME;
		  test_remain[BLACK].period = PERIOD - 3;
		  test_remain[WHITE].period = PERIOD - 1;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 11 seconds passed until B played. Game was ended before, so no effect.");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 11 seconds passed until B played. Game was ended before, so no effect.");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 11 seconds passed until B played. Game was ended before, so no effect.");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 11 seconds passed until B played. Game was ended before, so no effect.");
			equal(board1.time.remain[WHITE].period, test_remain[WHITE].period, "B1: 11 seconds passed until B played. Game was ended before, so no effect.");
			equal(board1.time.remain[BLACK].period, test_remain[BLACK].period, "B1: 11 seconds passed until B played. Game was ended before, so no effect.");
			equal(board2.time.remain[WHITE].period, test_remain[WHITE].period, "B2: 11 seconds passed until B played. Game was ended before, so no effect.");
			equal(board2.time.remain[BLACK].period, test_remain[BLACK].period, "B2: 11 seconds passed until B played. Game was ended before, so no effect.");
			equal(board1.time.status, ST_STOPED, "B1: Not counting");
			equal(board2.time.status, ST_STOPED, "B2: Not counting");
			equal(board1.time.actual_color, null, "B1: No actual color");
			equal(board2.time.actual_color, null, "B2: No actual color");
			start();
		}, 10900);
	});

});
