var STARTING_TIME = 5;
var PERIOD_TIME = 10;
var PERIOD_STONE = 3;
function binder(method, object, args) {
	return function(orig_args) { method.apply(object, [orig_args].concat(args)); };
}

test("Configure Timer", function() {

	var test_remain = {};

	// Config
		var server = new Server();
		var config1 = {
			time_system: "Canadian",
			starting_time: STARTING_TIME,
			period_time: PERIOD_TIME,
			period_stone: PERIOD_STONE,
			div_clock_b: "divb1",
			div_clock_w: "divw1",
			div_result: "divr1",
		}
		var board1 = new Board(config1);

		var config2 = {
			time_system: "Canadian",
			starting_time: STARTING_TIME,
			period_time: PERIOD_TIME,
			period_stone: PERIOD_STONE,
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
			'stone':  0
		};
		test_remain[WHITE] = {
			'time': STARTING_TIME,
			'stone':  0
		};
		deepEqual(board1.time.remain, test_remain, "B1: At startup the time is " + STARTING_TIME + " seconds, no stones played.");
		deepEqual(board2.time.remain, test_remain, "B1: At startup the time is " + STARTING_TIME + " seconds, no stones played.");

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
	asyncTest("Black plays after 3 seconds", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].time = STARTING_TIME - 3;
			test_remain[WHITE].time = STARTING_TIME;
		  test_remain[BLACK].stone = 0;
		  test_remain[WHITE].stone = 0;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 3 seconds passed until B played.");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 3 seconds passed until B played.");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 3 seconds passed until B played.");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 3 seconds passed until B played.");
			equal(board1.time.remain[WHITE].stone, test_remain[WHITE].stone, "B1: 3 seconds passed until B played.");
			equal(board1.time.remain[BLACK].stone, test_remain[BLACK].stone, "B1: 3 seconds passed until B played.");
			equal(board2.time.remain[WHITE].stone, test_remain[WHITE].stone, "B2: 3 seconds passed until B played.");
			equal(board2.time.remain[BLACK].stone, test_remain[BLACK].stone, "B2: 3 seconds passed until B played.");
			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
			console.log('got here');
		}, 2900);
	});

	// Play and test
	asyncTest("White plays after 6 seconds", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK].time = STARTING_TIME - 3;
			test_remain[WHITE].time = STARTING_TIME - 5 + PERIOD_TIME - 1; // should exceed main time by 1 second
		  test_remain[BLACK].stone = 0;
		  test_remain[WHITE].stone = PERIOD_STONE - 1;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(board1.time.remain[WHITE].stone, test_remain[WHITE].stone, "B1: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(board1.time.remain[BLACK].stone, test_remain[BLACK].stone, "B1: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(board2.time.remain[WHITE].stone, test_remain[WHITE].stone, "B2: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(board2.time.remain[BLACK].stone, test_remain[BLACK].stone, "B2: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 5900);
	});

	// Play and test
	asyncTest("Black plays after 5 seconds", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].time = STARTING_TIME - 3 - 2 + PERIOD_TIME - 3;
			test_remain[WHITE].time = STARTING_TIME - 5 + PERIOD_TIME - 1;
		  test_remain[BLACK].stone = PERIOD_STONE - 1;
		  test_remain[WHITE].stone = PERIOD_STONE - 1;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(board1.time.remain[WHITE].stone, test_remain[WHITE].stone, "B1: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(board1.time.remain[BLACK].stone, test_remain[BLACK].stone, "B1: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(board2.time.remain[WHITE].stone, test_remain[WHITE].stone, "B2: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(board2.time.remain[BLACK].stone, test_remain[BLACK].stone, "B2: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 4900);
	});

	// Play and test
	asyncTest("White plays after 3 seconds", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK].time = STARTING_TIME - 3 - 2 + PERIOD_TIME - 3;
			test_remain[WHITE].time = STARTING_TIME - 5 + PERIOD_TIME - 1 - 3;
		  test_remain[BLACK].stone = PERIOD_STONE - 1;
		  test_remain[WHITE].stone = PERIOD_STONE - 2;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 6 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 6 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 6 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 6 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(board1.time.remain[WHITE].stone, test_remain[WHITE].stone, "B1: 6 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(board1.time.remain[BLACK].stone, test_remain[BLACK].stone, "B1: 6 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(board2.time.remain[WHITE].stone, test_remain[WHITE].stone, "B2: 6 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(board2.time.remain[BLACK].stone, test_remain[BLACK].stone, "B2: 6 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 2900);
	});

	// Play and test
	asyncTest("Black plays after 5 seconds", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].time = STARTING_TIME - 3 - 2 + PERIOD_TIME - 3 - 5;
			test_remain[WHITE].time = STARTING_TIME - 5 + PERIOD_TIME - 1 - 3;
		  test_remain[BLACK].stone = PERIOD_STONE - 2;
		  test_remain[WHITE].stone = PERIOD_STONE - 2;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(board1.time.remain[WHITE].stone, test_remain[WHITE].stone, "B1: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(board1.time.remain[BLACK].stone, test_remain[BLACK].stone, "B1: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(board2.time.remain[WHITE].stone, test_remain[WHITE].stone, "B2: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(board2.time.remain[BLACK].stone, test_remain[BLACK].stone, "B2: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 4900);
	});

	// Play and test
	asyncTest("White plays after 3 seconds", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK].time = STARTING_TIME - 3 - 2 + PERIOD_TIME - 3 - 5;
			test_remain[WHITE].time = STARTING_TIME - 5 + PERIOD_TIME - 1 - 3 - 3 + (PERIOD_TIME - 3); // He had 3 seconds remaining in his active period
		  test_remain[BLACK].stone = PERIOD_STONE - 2;
		  test_remain[WHITE].stone = PERIOD_STONE - 3 + PERIOD_STONE;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 3 seconds passed until W played, he starts a new period.");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 3 seconds passed until W played, he starts a new period.");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 3 seconds passed until W played, he starts a new period.");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 3 seconds passed until W played, he starts a new period.");
			equal(board1.time.remain[WHITE].stone, test_remain[WHITE].stone, "B1: 3 seconds passed until W played, he starts a new period.");
			equal(board1.time.remain[BLACK].stone, test_remain[BLACK].stone, "B1: 3 seconds passed until W played, he starts a new period.");
			equal(board2.time.remain[WHITE].stone, test_remain[WHITE].stone, "B2: 3 seconds passed until W played, he starts a new period.");
			equal(board2.time.remain[BLACK].stone, test_remain[BLACK].stone, "B2: 3 seconds passed until W played, he starts a new period.");
			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 2900);
	});

	// Play and test
	asyncTest("Black plays after 4 seconds, but he runs out of time!", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].time = STARTING_TIME - 3 - 2 + PERIOD_TIME - 3 - 5 - 2; // Should exceed time by 2 seconds
			test_remain[WHITE].time = STARTING_TIME - 5 + PERIOD_TIME - 1 - 3 - 3 + (PERIOD_TIME - 3);
		  test_remain[BLACK].stone = PERIOD_STONE - 3;
		  test_remain[WHITE].stone = PERIOD_STONE - 3 + PERIOD_STONE;
			equal(Math.round(board1.time.remain[WHITE].time), test_remain[WHITE].time, "B1: 5 seconds passed until B played, Game ended.");
			equal(Math.round(board1.time.remain[BLACK].time), test_remain[BLACK].time, "B1: 5 seconds passed until B played, Game ended.");
			equal(Math.round(board2.time.remain[WHITE].time), test_remain[WHITE].time, "B2: 5 seconds passed until B played, Game ended.");
			equal(Math.round(board2.time.remain[BLACK].time), test_remain[BLACK].time, "B2: 5 seconds passed until B played, Game ended.");
			equal(board1.time.remain[WHITE].stone, test_remain[WHITE].stone, "B1: 5 seconds passed until B played, Game ended.");
			equal(board1.time.remain[BLACK].stone, test_remain[BLACK].stone, "B1: 5 seconds passed until B played, Game ended.");
			equal(board2.time.remain[WHITE].stone, test_remain[WHITE].stone, "B2: 5 seconds passed until B played, Game ended.");
			equal(board2.time.remain[BLACK].stone, test_remain[BLACK].stone, "B2: 5 seconds passed until B played, Game ended.");
			equal(board1.time.status, ST_STOPED, "B1: Not counting");
			equal(board2.time.status, ST_STOPED, "B2: Not counting");
			equal(board1.time.actual_color, null, "B1: No actual color");
			equal(board2.time.actual_color, null, "B2: No actual color");
			start();
		}, 3900);
	});

});
