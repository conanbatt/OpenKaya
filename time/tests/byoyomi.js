var MAIN_TIME = 30;
var PERIOD_TIME = 5;
var PERIODS = 3;

function binder(method, object, args) {
	return function(orig_args) { method.apply(object, [orig_args].concat(args)); };
}

function timerEqual(game_remain, test_remain, test_text) {
	equal(Math.floor(game_remain[WHITE].main_time), test_remain[WHITE].main_time, test_text);
	equal(Math.floor(game_remain[BLACK].main_time), test_remain[BLACK].main_time, test_text);
	equal(game_remain[WHITE].periods, test_remain[WHITE].periods, test_text);
	equal(game_remain[BLACK].periods, test_remain[BLACK].periods, test_text);
	equal(Math.floor(game_remain[WHITE].period_time), test_remain[WHITE].period_time, test_text);
	equal(Math.floor(game_remain[BLACK].period_time), test_remain[BLACK].period_time, test_text);
}

test("Configure Timer", function() {

	var test_remain = {};

	// Config
		var server = new Server();
		var config1 = {
			time_system: "Byoyomi",
			main_time: MAIN_TIME,
			period_time: PERIOD_TIME,
			periods: PERIODS,
			div_clock_b: "divb1",
			div_clock_w: "divw1",
			div_result: "divr1",
		}
		var board1 = new Board(config1);

		var config2 = {
			time_system: "Byoyomi",
			main_time: MAIN_TIME,
			period_time: PERIOD_TIME,
			periods: PERIODS,
			div_clock_b: "divb2",
			div_clock_w: "divw2",
			div_result: "divr2",
		}
		var board2 = new Board(config2);

		server.subscribe(board1);
		server.subscribe(board2);

	// Init Tests
		// Time and periods
		test_remain[BLACK] = {
			'main_time': MAIN_TIME,
			'periods': PERIODS,
			'period_time': PERIOD_TIME,
		};
		test_remain[WHITE] = {
			'main_time': MAIN_TIME,
			'periods': PERIODS,
			'period_time': PERIOD_TIME,
		};
		deepEqual(board1.time.remain, test_remain, "B1: At startup the time is " + MAIN_TIME + " seconds AND " + PERIODS + " periods.");
		deepEqual(board2.time.remain, test_remain, "B1: At startup the time is " + MAIN_TIME + " seconds AND " + PERIODS + " periods.");

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
			test_remain[BLACK].main_time = MAIN_TIME - 6;
			test_remain[WHITE].main_time = MAIN_TIME;
			test_remain[BLACK].periods = PERIODS;
			test_remain[WHITE].periods = PERIODS;
			test_remain[BLACK].period_time = PERIOD_TIME;
			test_remain[WHITE].period_time = PERIOD_TIME;

			timerEqual(board1.time.remain, test_remain, "B1: 6 seconds passed until B played.");
			timerEqual(board2.time.remain, test_remain, "B2: 6 seconds passed until B played.");

			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 5900);
	});

	// Play and test
	asyncTest("White plays 10 seconds after black", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK].main_time = MAIN_TIME - 6;
			test_remain[WHITE].main_time = MAIN_TIME - 10;
			test_remain[BLACK].periods = PERIODS;
			test_remain[WHITE].periods = PERIODS;
			test_remain[BLACK].period_time = PERIOD_TIME;
			test_remain[WHITE].period_time = PERIOD_TIME;

			timerEqual(board1.time.remain, test_remain, "B1: 10 seconds passed until W played.");
			timerEqual(board2.time.remain, test_remain, "B2: 10 seconds passed until W played.");

			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 9900);
	});

	// Play and test
	asyncTest("Black plays after 12 seconds", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].main_time = MAIN_TIME - 6 - 12;
			test_remain[WHITE].main_time = MAIN_TIME - 10;
			test_remain[BLACK].periods = PERIODS;
			test_remain[WHITE].periods = PERIODS;
			test_remain[BLACK].period_time = PERIOD_TIME;
			test_remain[WHITE].period_time = PERIOD_TIME;

			timerEqual(board1.time.remain, test_remain, "B1: 12 seconds passed until B played again. It was a great move!");
			timerEqual(board2.time.remain, test_remain, "B2: 12 seconds passed until B played again. It was a great move!");

			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 11900);
	});

	// Play and test
	asyncTest("White tries to play 22 seconds after black. He has used up his main time.", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK].main_time = MAIN_TIME - 6 - 12;
			test_remain[WHITE].main_time = 0; // end of main time.
			test_remain[BLACK].periods = PERIODS;
			test_remain[WHITE].periods = PERIODS;
			test_remain[BLACK].period_time = PERIOD_TIME;
			test_remain[WHITE].period_time = PERIOD_TIME;

			timerEqual(board1.time.remain, test_remain, "B1: 22 seconds passed until W played. He is now in his first byo-yomi.");
			timerEqual(board2.time.remain, test_remain, "B2: 22 seconds passed until W played. He is now in his first byo-yomi.");

			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 21900);
	});

	// Play and test
	asyncTest("Black plays after 18 seconds, he has 12 seconds main time, so uses one byoyomi periods", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].main_time = 0;
			test_remain[WHITE].main_time = 0;
			test_remain[BLACK].periods = PERIODS - 1;
			test_remain[WHITE].periods = PERIODS;
			test_remain[BLACK].period_time = PERIOD_TIME;
			test_remain[WHITE].period_time = PERIOD_TIME;

			timerEqual(board1.time.remain, test_remain, "B1: 18 seconds passed until B played again. He has two periods left!");
			timerEqual(board2.time.remain, test_remain, "B2: 18 seconds passed until B played again. He has two periods left!");

			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 17900);
	});

	// Play and test
	asyncTest("White tries to play 2 seconds after black, this should cost no byoyomi periods.", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK].main_time = 0;
			test_remain[WHITE].main_time = 0;
			test_remain[BLACK].periods = PERIODS - 1;
			test_remain[WHITE].periods = PERIODS;
			test_remain[BLACK].period_time = PERIOD_TIME;
			test_remain[WHITE].period_time = PERIOD_TIME;

			timerEqual(board1.time.remain, test_remain, "B1: 2 seconds passed until W played. That was fast!");
			timerEqual(board2.time.remain, test_remain, "B2: 2 seconds passed until W played. That was fast!");

			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 1900);
	});

	// Play and test
	asyncTest("Black tries to play 11 seconds after white, but he only has two byoyomi periods left.", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].main_time = 0;
			test_remain[WHITE].main_time = 0;
			test_remain[BLACK].periods = 0; // No more periods
			test_remain[WHITE].periods = PERIODS;
			test_remain[BLACK].period_time = 0; // No more time
			test_remain[WHITE].period_time = PERIOD_TIME;

			timerEqual(board1.time.remain, test_remain, "B1: 11 seconds passed until B played. Game was ended before, so no effect.");
			timerEqual(board2.time.remain, test_remain, "B2: 11 seconds passed until B played. Game was ended before, so no effect.");

			equal(board1.time.status, ST_STOPED, "B1: Not counting");
			equal(board2.time.status, ST_STOPED, "B2: Not counting");
			equal(board1.time.actual_color, null, "B1: No actual color");
			equal(board2.time.actual_color, null, "B2: No actual color");
			start();
		}, 10900);
	});

});
