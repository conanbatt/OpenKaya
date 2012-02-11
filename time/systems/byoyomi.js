var ST_STOPED = 0;
var ST_PAUSED = 1;
var ST_COUNTING = 2;
var BLACK = 'B';
var WHITE = 'W';

function ByoyomiTimer(game, main_time, periods, period_time) {
	// Validation
	if (!this.validate(main_time, periods, period_time)) {
		return false;
	}

	// Game
	this.game = game;

	// Remaining time and period
	this.remain = {};
	this.remain[BLACK] = {
		'main_time': main_time,
		'period_time': period_time,
		'periods': periods,
	};
	this.remain[WHITE] = {
		'main_time': main_time,
		'period_time': period_time,
		'periods': periods,
	};

	// Stats
	this.status = ST_PAUSED;
	this.actual_color;
	this.last_resume;
	this.last_pause;

	// System
	this.system = {};
	this.system.name = "Byoyomi";
	this.system.main_time = main_time;
	this.system.periods = periods;
	this.system.period_time = period_time;
}

ByoyomiTimer.prototype = {
	// Validation
	validate: function(main_time, periods, period_time) {
		if (main_time == undefined) {
			throw new Error("Must configure a main time.");
			return false;
		} else {
			if (typeof main_time != "number" || parseInt(main_time, 10) != main_time || main_time < 0) {
				throw new Error("Main time parameter must be a non-negative integer indicating seconds.");
				return false;
			}
		}

		if (period_time == undefined) {
			throw new Error("Must configure a period_time.");
			return false;
		} else {
			if (typeof period_time != "number" || parseInt(period_time, 10) != period_time || period_time < 0) {
				throw new Error("Period time parameter must be a non-negative integer indicating seconds per period.");
				return false;
			}
		}

		if (periods == undefined) {
			throw new Error("Must configure number of periods.");
			return false;
		} else {
			if (typeof periods != "number" || parseInt(periods, 10) != periods || periods < 0) {
				throw new Error("Periods parameter must be a non-negative integer indicating number of periods.");
				return false;
			}
		}

		return true;
	},

	// Force a remaining time for a player.
	set_remain: function(color, remain) {
		if (color != "B" && color != "W") {
			throw new Error("Wrong color");
		} else {
			var remain_color = this.remain[color];
			remain_color.main_time = remain.main_time;
			remain_color.periods = remain.periods;
			remain_color.period_time = remain.period_time;
		}
	},

	// If it's not counting: update remain, color, last_resume and status, register interval, start!
	resume: function(color, remain_b, remain_w) {
		if (this.status == ST_PAUSED) {
			if (remain_b && remain_w) {
				this.remain[BLACK].main_time = remain_b.main_time;
				this.remain[BLACK].periods = remain_b.periods;
				this.remain[BLACK].period_time = remain_b.period_time;
				this.remain[WHITE].main_time = remain_w.main_time;
				this.remain[WHITE].periods = remain_w.periods;
				this.remain[WHITE].period_time = remain_b.period_time;
			}
			this.actual_color = color;
			this.status = ST_COUNTING;
			this.last_resume = new Date();
			this.clock = window.setInterval(this.binder(this.tick, this), 100);
		}
	},

	// If it's counting: update last_pause, status and remain. Clear interval.
	pause: function(reset_period_time) {
		if (this.status == ST_COUNTING) {
			var remain_color = this.remain[this.actual_color];

			this.last_pause = new Date();
			window.clearInterval(this.clock);
			this.status = ST_PAUSED;

			// Always remove time from main_time, even if it would be negative afterwards
			remain_color.main_time -= ((this.last_pause - this.last_resume) / 1000);

			// Delegate extra removed time from main_time to period_time.
			if (remain_color.main_time < 0) {
				remain_color.period_time += remain_color.main_time;
				remain_color.main_time = 0;
			}

			// If the time is less than zeor, attempt to add periods
			while(remain_color.period_time <= 0 && this.remain[this.actual_color].periods > 1) {
				remain_color.periods--;
				remain_color.period_time += this.system.period_time;
			}

			// If remain time is greater than zero, but we've used periods, force to the period time.
			if (remain_color.period_time > 0 && remain_color.periods <= this.system.periods && reset_period_time) {
				remain_color.period_time = this.system.period_time;
			}

			return this.remain;
		}
		return false;
	},

	// Stop, clear everything up, update remain from arguments.
	stop: function(remain) {
		window.clearInterval(this.clock);
		if (remain) {
			this.remain[BLACK].main_time = remain[BLACK].main_time;
			this.remain[BLACK].periods = remain[BLACK].periods;
			this.remain[BLACK].period_time = remain[BLACK].period_time;
			this.remain[WHITE].main_time = remain[WHITE].main_time;
			this.remain[WHITE].periods = remain[WHITE].periods;
			this.remain[WHITE].period_time = remain[WHITE].period_time;
		}
		this.actual_color = null;
		this.last_resume = null;
		this.last_pause = null;
		this.status = ST_STOPED;
	},

	adjust: function(adjustment) {
		if (this.status != ST_STOPED) {
			var remain_color = this.remain[this.actual_color];
			remain_color.main_time -= Number(adjustment);
		}
	},

	// This handles the interval callback, creates a remain estimation and updates the clocks.
	// if remaining time reaches 0, client announces loss to server.
	tick: function() {
		var remain_color = this.remain[this.actual_color];

		var tmp_remain = {};
		tmp_remain[BLACK] = {
			'main_time': this.remain[BLACK].main_time,
			'periods': this.remain[BLACK].periods,
			'period_time': this.remain[BLACK].period_time,
		};
		tmp_remain[WHITE] = {
			'main_time': this.remain[WHITE].main_time,
			'periods': this.remain[WHITE].periods,
			'period_time': this.remain[WHITE].period_time,
		};

		var tmp_remain_color = tmp_remain[this.actual_color];

		// Always remove time from main_time, even if it would be negative afterwards
		tmp_remain_color.main_time = remain_color.main_time - (new Date() - this.last_resume) / 1000;

		// Delegate extra removed time from main_time to period_time.
		if (tmp_remain_color.main_time < 0) {
			tmp_remain_color.period_time += tmp_remain_color.main_time;
			tmp_remain_color.main_time = 0;
		}

		// If the time <= 0, attempt to add a period
		while (tmp_remain_color.period_time <= 0 && tmp_remain_color.periods > 1) {
			tmp_remain_color.period_time += this.system.period_time;
			tmp_remain_color.periods--;
		}

		this.game.update_clocks(tmp_remain);
		if (tmp_remain_color.period_time <= 0) {
			remain_color.main_time = 0;
			remain_color.periods = 0;
			remain_color.period_time = 0;
			this.stop();
			this.game.announce_time_loss(this.remain);
		}
	},

	binder: function (method, object, args) {
		return function(orig_args) { method.apply(object, [orig_args].concat(args)); };
	},
}
