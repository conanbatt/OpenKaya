var MAIN_TIME = 5;
var PERIOD_TIME = 10;
var PERIOD_STONES = 3;
function binder(method, object, args) {
	return function(orig_args) { method.apply(object, [orig_args].concat(args)); };
}

test("Configure Timer", function() {

	var test_remain = {};

	// Config
		var server = new Server();
		var config1 = {
			time_system: "Canadian",
			main_time: MAIN_TIME,
			period_time: PERIOD_TIME,
			period_stones: PERIOD_STONES,
			div_clock_b: "divb1",
			div_clock_w: "divw1",
			div_result: "divr1",
		}
		var board1 = new Board(config1);

		var config2 = {
			time_system: "Canadian",
			main_time: MAIN_TIME,
			period_time: PERIOD_TIME,
			period_stones: PERIOD_STONES,
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
			'main_time': MAIN_TIME,
			'period_stones': PERIOD_STONES,
			'period_time': PERIOD_TIME,
		};
		test_remain[WHITE] = {
			'main_time': MAIN_TIME,
			'period_stones': PERIOD_STONES,
			'period_time': PERIOD_TIME,
		};
		deepEqual(board1.time.remain, test_remain, "B1: At startup the time is " + MAIN_TIME + " seconds, no stones played.");
		deepEqual(board2.time.remain, test_remain, "B1: At startup the time is " + MAIN_TIME + " seconds, no stones played.");

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
			test_remain[BLACK].main_time = MAIN_TIME - 3;
			test_remain[WHITE].main_time = MAIN_TIME;
			test_remain[BLACK].period_stones = PERIOD_STONES;
			test_remain[WHITE].period_stones = PERIOD_STONES;
			test_remain[BLACK].period_time = PERIOD_TIME;
			test_remain[WHITE].period_time = PERIOD_TIME;
			equal(Math.floor(board1.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B1: Main time for white was reduced by 3 seconds.");
			equal(Math.floor(board1.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B1: Main time for black is intact.");
			equal(Math.floor(board2.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B2: Main time for white was reduced by 3 seconds.");
			equal(Math.floor(board2.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B2: Main time for black is intact.");
			equal(board1.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B1: Period stones are intact for both black and white.");
			equal(board1.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B1: Period stones are intact for both black and white.");
			equal(board2.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B2: Period stones are intact for both black and white.");
			equal(board2.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B2: Period stones are intact for both black and white.");
			equal(board1.time.remain[WHITE].period_time, test_remain[WHITE].period_time, "B1: Period time remains the same for both black and white.");
			equal(board1.time.remain[BLACK].period_time, test_remain[BLACK].period_time, "B1: Period time remains the same for both black and white.");
			equal(board2.time.remain[WHITE].period_time, test_remain[WHITE].period_time, "B2: Period time remains the same for both black and white.");
			equal(board2.time.remain[BLACK].period_time, test_remain[BLACK].period_time, "B2: Period time remains the same for both black and white.");
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
			test_remain[BLACK].main_time = MAIN_TIME - 3;
			test_remain[WHITE].main_time = MAIN_TIME - 5;
			test_remain[BLACK].period_time = PERIOD_TIME;
			test_remain[WHITE].period_time = PERIOD_TIME - 1; // should exceed main time by 1 second.
			test_remain[BLACK].period_stones = PERIOD_STONES;
			test_remain[WHITE].period_stones = PERIOD_STONES - 1; // As exeeded main time, this stone counts as a period stone.
			equal(Math.floor(board1.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B1: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(Math.floor(board1.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B1: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(Math.floor(board2.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B2: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(Math.floor(board2.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B2: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(board1.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B1: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(board1.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B1: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(board2.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B2: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(board2.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B2: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(Math.floor(board1.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B1: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(Math.floor(board1.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B1: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(Math.floor(board2.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B2: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(Math.floor(board2.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B2: 6 seconds passed until W played, he has 9 seconds to play 2 more stones.");
			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 5900);
	});

	// Play and test
	asyncTest("Black plays after 5 seconds", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].main_time = MAIN_TIME - 5;
			test_remain[WHITE].main_time = MAIN_TIME - 5;
			test_remain[BLACK].period_time = PERIOD_TIME - 3; // should exceed main time by 3 second.
			test_remain[WHITE].period_time = PERIOD_TIME - 1;
			test_remain[BLACK].period_stones = PERIOD_STONES - 1; // As exeeded main time, this stone counts as a period stone.
			test_remain[WHITE].period_stones = PERIOD_STONES - 1;
			equal(Math.floor(board1.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B1: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(Math.floor(board1.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B1: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(Math.floor(board2.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B2: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(Math.floor(board2.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B2: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(board1.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B1: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(board1.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B1: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(board2.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B2: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(board2.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B2: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(Math.floor(board1.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B1: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(Math.floor(board1.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B1: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(Math.floor(board2.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B2: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(Math.floor(board2.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B2: 5 seconds passed until B played, 7 seconds left to play 2 stones.");
			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 4900);
	});

	// Play and test
	asyncTest("White plays after 3 seconds", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK].main_time = MAIN_TIME - 5;
			test_remain[WHITE].main_time = MAIN_TIME - 5;
			test_remain[BLACK].period_time = PERIOD_TIME - 3;
			test_remain[WHITE].period_time = PERIOD_TIME - 1 - 3; // 3 seconds more.
			test_remain[BLACK].period_stones = PERIOD_STONES - 1;
			test_remain[WHITE].period_stones = PERIOD_STONES - 1 - 1; // 2nd period stone.
			equal(Math.floor(board1.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B1: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(Math.floor(board1.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B1: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(Math.floor(board2.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B2: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(Math.floor(board2.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B2: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(board1.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B1: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(board1.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B1: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(board2.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B2: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(board2.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B2: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(Math.floor(board1.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B1: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(Math.floor(board1.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B1: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(Math.floor(board2.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B2: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(Math.floor(board2.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B2: 3 seconds passed until W played, he has 6 seconds to play 1 more stone.");
			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 2900);
	});

	// Play and test
	asyncTest("Black plays after 5 seconds", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].main_time = MAIN_TIME - 5;
			test_remain[WHITE].main_time = MAIN_TIME - 5;
			test_remain[BLACK].period_time = PERIOD_TIME - 3 - 5; // 5 seconds more.
			test_remain[WHITE].period_time = PERIOD_TIME - 1 - 3;
			test_remain[BLACK].period_stones = PERIOD_STONES - 1 - 1; // 2nd period stone.
			test_remain[WHITE].period_stones = PERIOD_STONES - 1 - 1;
			equal(Math.floor(board1.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B1: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(Math.floor(board1.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B1: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(Math.floor(board2.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B2: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(Math.floor(board2.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B2: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(board1.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B1: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(board1.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B1: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(board2.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B2: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(board2.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B2: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(Math.floor(board1.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B1: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(Math.floor(board1.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B1: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(Math.floor(board2.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B2: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(Math.floor(board2.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B2: 5 seconds passed until B played, 2 seconds left to play 1 stone.");
			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 4900);
	});

	// Play and test
	asyncTest("White plays after 3 seconds", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK].main_time = MAIN_TIME - 5;
			test_remain[WHITE].main_time = MAIN_TIME - 5;
			test_remain[BLACK].period_time = PERIOD_TIME - 3 - 5;
			test_remain[WHITE].period_time = PERIOD_TIME; // 3rd stone: period time restarted.
			test_remain[BLACK].period_stones = PERIOD_STONES - 1 - 1;
			test_remain[WHITE].period_stones = PERIOD_STONES; // 3rd stone: period stones restarted.
			equal(Math.floor(board1.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B1: 3 seconds passed until W played, he starts a new period.");
			equal(Math.floor(board1.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B1: 3 seconds passed until W played, he starts a new period.");
			equal(Math.floor(board2.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B2: 3 seconds passed until W played, he starts a new period.");
			equal(Math.floor(board2.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B2: 3 seconds passed until W played, he starts a new period.");
			equal(board1.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B1: 3 seconds passed until W played, he starts a new period.");
			equal(board1.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B1: 3 seconds passed until W played, he starts a new period.");
			equal(board2.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B2: 3 seconds passed until W played, he starts a new period.");
			equal(board2.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B2: 3 seconds passed until W played, he starts a new period.");
			equal(Math.floor(board1.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B1: 3 seconds passed until W played, he starts a new period.");
			equal(Math.floor(board1.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B1: 3 seconds passed until W played, he starts a new period.");
			equal(Math.floor(board2.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B2: 3 seconds passed until W played, he starts a new period.");
			equal(Math.floor(board2.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B2: 3 seconds passed until W played, he starts a new period.");
			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 2900);
	});

	// Play and test
	asyncTest("Black plays after 4 seconds, but he runs out of time!", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK].main_time = MAIN_TIME - 5;
			test_remain[WHITE].main_time = MAIN_TIME - 5;
			test_remain[BLACK].period_time = 0; // Out of time!
			test_remain[WHITE].period_time = PERIOD_TIME;
			test_remain[BLACK].period_stones = PERIOD_STONES - 1 - 1; // Couldn't place the 3rd stone.
			test_remain[WHITE].period_stones = PERIOD_STONES;
			equal(Math.floor(board1.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B1: 5 seconds passed until B played, Game ended.");
			equal(Math.floor(board1.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B1: 5 seconds passed until B played, Game ended.");
			equal(Math.floor(board2.time.remain[WHITE].main_time), test_remain[WHITE].main_time, "B2: 5 seconds passed until B played, Game ended.");
			equal(Math.floor(board2.time.remain[BLACK].main_time), test_remain[BLACK].main_time, "B2: 5 seconds passed until B played, Game ended.");
			equal(board1.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B1: 5 seconds passed until B played, Game ended.");
			equal(board1.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B1: 5 seconds passed until B played, Game ended.");
			equal(board2.time.remain[WHITE].period_stones, test_remain[WHITE].period_stones, "B2: 5 seconds passed until B played, Game ended.");
			equal(board2.time.remain[BLACK].period_stones, test_remain[BLACK].period_stones, "B2: 5 seconds passed until B played, Game ended.");
			equal(Math.floor(board1.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B1: 5 seconds passed until B played, Game ended.");
			equal(Math.floor(board1.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B1: 5 seconds passed until B played, Game ended.");
			equal(Math.floor(board2.time.remain[WHITE].period_time), test_remain[WHITE].period_time, "B2: 5 seconds passed until B played, Game ended.");
			equal(Math.floor(board2.time.remain[BLACK].period_time), test_remain[BLACK].period_time, "B2: 5 seconds passed until B played, Game ended.");
			equal(board1.time.status, ST_STOPED, "B1: Not counting");
			equal(board2.time.status, ST_STOPED, "B2: Not counting");
			equal(board1.time.actual_color, null, "B1: No actual color");
			equal(board2.time.actual_color, null, "B2: No actual color");
			start();
		}, 3900);
	});

});
