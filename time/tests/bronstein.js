
var STARTING_TIME = 30;
var BONUS = 3;

function binder(method, object, args) {
	return function(orig_args) { method.apply(object, [orig_args].concat(args)); };
}

test("Configure Timer", function() {

	var test_remain = {};

	// Config
		var server = new Server();
		var config1 = {
			time_system: "Bronstein",
			starting_time: STARTING_TIME,
			bonus: BONUS,
			div_clock_b: "divb1",
			div_clock_w: "divw1",
			div_result: "divr1",
		}
		var board1 = new Board(config1);

		var config2 = {
			time_system: "Bronstein",
			starting_time: STARTING_TIME,
			bonus: BONUS,
			div_clock_b: "divb2",
			div_clock_w: "divw2",
			div_result: "divr2",
		}
		var board2 = new Board(config2);

		server.subscribe(board1);
		server.subscribe(board2);

	// Init Tests
		// Time
		test_remain[BLACK] = STARTING_TIME;
		test_remain[WHITE] = STARTING_TIME;
		deepEqual(board1.time.remain, test_remain, "B1: At startup the time is " + STARTING_TIME + " secconds.");
		deepEqual(board2.time.remain, test_remain, "B2: At startup the time is " + STARTING_TIME + " secconds.");

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
			test_remain[BLACK] = STARTING_TIME - 6 + BONUS;
			test_remain[WHITE] = STARTING_TIME;
			equal(Math.round(board1.time.remain[WHITE]), test_remain[WHITE], "B1: 6 seconds passed until B played.");
			equal(Math.round(board1.time.remain[BLACK]), test_remain[BLACK], "B1: 6 seconds passed until B played.");
			equal(Math.round(board2.time.remain[WHITE]), test_remain[WHITE], "B2: 6 seconds passed until B played.");
			equal(Math.round(board2.time.remain[BLACK]), test_remain[BLACK], "B2: 6 seconds passed until B played.");
			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 5900);
	});

	// Play and test
	asyncTest("White plays 10 seconds after black", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK] = STARTING_TIME - 6 + BONUS;
			test_remain[WHITE] = STARTING_TIME - 10 + BONUS;
			equal(Math.round(board1.time.remain[WHITE]), test_remain[WHITE], "B1: 10 seconds passed until W played.");
			equal(Math.round(board1.time.remain[BLACK]), test_remain[BLACK], "B1: 10 seconds passed until W played.");
			equal(Math.round(board2.time.remain[WHITE]), test_remain[WHITE], "B2: 10 seconds passed until W played.");
			equal(Math.round(board2.time.remain[BLACK]), test_remain[BLACK], "B2: 10 seconds passed until W played.");
			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 9900);
	});

	// Play and test
	asyncTest("Black plays after 12 seconds", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK] = STARTING_TIME - 6 - 12 + BONUS + BONUS;
			test_remain[WHITE] = STARTING_TIME - 10 + BONUS;
			equal(Math.round(board1.time.remain[WHITE]), test_remain[WHITE], "B1: 12 seconds passed until B played again. It was a great move!");
			equal(Math.round(board1.time.remain[BLACK]), test_remain[BLACK], "B1: 12 seconds passed until B played again. It was a great move!");
			equal(Math.round(board2.time.remain[WHITE]), test_remain[WHITE], "B2: 12 seconds passed until B played again. It was a great move!");
			equal(Math.round(board2.time.remain[BLACK]), test_remain[BLACK], "B2: 12 seconds passed until B played again. It was a great move!");
			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 11900);
	});

	// Play and test
	asyncTest("White tries to play 22 seconds after black. As he has had one bonus, he can play.", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK] = STARTING_TIME - 6 - 12 + BONUS + BONUS;
			test_remain[WHITE] = STARTING_TIME - 10 - 22 + BONUS + BONUS;
			equal(Math.round(board1.time.remain[WHITE]), test_remain[WHITE], "B1: 22 seconds passed until W played. Game was ended before, so no effect.");
			equal(Math.round(board1.time.remain[BLACK]), test_remain[BLACK], "B1: 22 seconds passed until W played. Game was ended before, so no effect.");
			equal(Math.round(board2.time.remain[WHITE]), test_remain[WHITE], "B2: 22 seconds passed until W played. Game was ended before, so no effect.");
			equal(Math.round(board2.time.remain[BLACK]), test_remain[BLACK], "B2: 22 seconds passed until W played. Game was ended before, so no effect.");
			equal(board1.time.actual_color, BLACK, "B1: Counting for Black");
			equal(board2.time.actual_color, BLACK, "B2: Counting for Black");
			start();
		}, 21900);
	});

	// Play and test
	asyncTest("Black plays after 1 second", function() {
		setTimeout(function() {
			board2.play();
			test_remain[BLACK] = STARTING_TIME - 6 - 12 - 1 + BONUS + BONUS + 1; // Should only receive 1 second (bronstein)
			test_remain[WHITE] = STARTING_TIME - 10 - 22 + BONUS + BONUS;
			equal(Math.round(board1.time.remain[WHITE]), test_remain[WHITE], "B1: 1 second passed until B played again. That was fast!");
			equal(Math.round(board1.time.remain[BLACK]), test_remain[BLACK], "B1: 1 second passed until B played again. That was fast!");
			equal(Math.round(board2.time.remain[WHITE]), test_remain[WHITE], "B2: 1 second passed until B played again. That was fast!");
			equal(Math.round(board2.time.remain[BLACK]), test_remain[BLACK], "B2: 1 second passed until B played again. That was fast!");
			equal(board1.time.actual_color, WHITE, "B1: Counting for White");
			equal(board2.time.actual_color, WHITE, "B2: Counting for White");
			start();
		}, 900);
	});

	// Play and test
	asyncTest("White tries to play 5 seconds after black, but he had only 4 seconds remaining.", function() {
		setTimeout(function() {
			board1.play();
			test_remain[BLACK] = STARTING_TIME - 6 - 12 - 1 + BONUS + BONUS + 1;
			test_remain[WHITE] = STARTING_TIME - 10 - 22 + BONUS + BONUS - 4; // Time ended and no bonus
			equal(Math.round(board1.time.remain[WHITE]), test_remain[WHITE], "B1: 22 seconds passed until W played. Game was ended before, so no effect.");
			equal(Math.round(board1.time.remain[BLACK]), test_remain[BLACK], "B1: 22 seconds passed until W played. Game was ended before, so no effect.");
			equal(Math.round(board2.time.remain[WHITE]), test_remain[WHITE], "B2: 22 seconds passed until W played. Game was ended before, so no effect.");
			equal(Math.round(board2.time.remain[BLACK]), test_remain[BLACK], "B2: 22 seconds passed until W played. Game was ended before, so no effect.");
			equal(board1.time.status, ST_STOPED, "B1: Not counting");
			equal(board2.time.status, ST_STOPED, "B2: Not counting");
			equal(board1.time.actual_color, null, "B1: No actual color");
			equal(board2.time.actual_color, null, "B2: No actual color");
			start();
		}, 4900);
	});

});
