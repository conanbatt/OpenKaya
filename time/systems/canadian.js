var ST_STOPED = 0;
var ST_PAUSED = 1;
var ST_COUNTING = 2;
var BLACK = 'B';
var WHITE = 'W';

function CanadianTimer(game, main_time, period_time, period_stones) {
	// Validation
	if (!this.validate(main_time, period_time, period_stones)) {
		return false;
	}

	// Game
	this.game = game;

	// Remaining time and current stone
	this.remain = {};
	this.remain[BLACK] = {
		'main_time': main_time,
		'period_time': period_time,
		'period_stones': period_stones,
	};
	this.remain[WHITE] = {
		'main_time': main_time,
		'period_time': period_time,
		'period_stones': period_stones,
	};

	// Stats
	this.status = ST_PAUSED;
	this.actual_color;
	this.last_resume;
	this.last_pause;

	// System
	this.system = {};
	this.system.name = "Canadian";
	this.system.main_time = main_time;
	this.system.period_time = period_time;
	this.system.period_stones = period_stones;
}

CanadianTimer.prototype = {
	// Validation
	validate: function(main_time, period_time, period_stones) {
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
			if (typeof period_time != "number" || parseInt(period_time, 10) != period_time || period_time <= 0) {
				throw new Error("Period time parameter must be a positive integer indicating seconds per period.");
				return false;
			}
		}

		if (period_stones == undefined) {
			throw new Error("Must configure number of period stones.");
			return false;
		} else {
			if (typeof period_stones != "number" || parseInt(period_stones, 10) != period_stones || period_stones <= 0) {
				throw new Error("Period stones parameter must be a positive integer indicating number of stones per period.");
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
			remain_color.period_time = remain.period_time;
			remain_color.period_stones = remain.period_stones;
		}
	},

	// If it's not counting: update remain, color, last_resume and status, register interval, start!
	resume: function(color, remain_b, remain_w) {
		if (this.status == ST_PAUSED) {
			if (remain_b && remain_w) {
				this.remain[BLACK].main_time = remain_b.main_time;
				this.remain[BLACK].period_time = remain_b.period_time;
				this.remain[BLACK].period_stones = remain_b.period_stones;
				this.remain[WHITE].main_time = remain_w.main_time;
				this.remain[WHITE].period_time = remain_w.period_time;
				this.remain[WHITE].period_stones = remain_w.period_stones;
			}
			this.actual_color = color;
			this.status = ST_COUNTING;
			this.last_resume = new Date();
			this.clock = window.setInterval(this.binder(this.tick, this), 100);
		}
	},

	// If it's counting: update last_pause, status and remain. Clear interval.
	pause: function(decrement_period_stones) {
		if (this.status == ST_COUNTING) {
			var remain_color = this.remain[this.actual_color];

			this.last_pause = new Date();
			window.clearInterval(this.clock);
			this.status = ST_PAUSED;
			remain_color.main_time -= ((this.last_pause - this.last_resume) / 1000);

			// Delegate extra removed time from main_time to period_time.
			if (remain_color.main_time < 0) {
				remain_color.period_time += remain_color.main_time;
				remain_color.main_time = 0;
			}

			if (remain_color.main_time <= 0) {
				// If we're on overtime subtract a stone and reset the period if necessary
				// This will actually work even if period_stones is 1.
				if (decrement_period_stones) {
					remain_color.period_stones--;
					if (remain_color.period_stones <= 0) {
						remain_color.period_stones = this.system.period_stones;
						remain_color.period_time = this.system.period_time;
					}
				}
			}

			return this.remain;
		}
		return false;
	},

	// Stop, clear everything up, update remain from arguments.
	stop: function(remain) {
		window.clearInterval(this.clock);
		if (remain) {
			this.remain[BLACK].time = remain[BLACK].time;
			this.remain[BLACK].period_stones = remain[BLACK].period_stones;
			this.remain[BLACK].period_time = remain[BLACK].period_time;
			this.remain[WHITE].time = remain[WHITE].time;
			this.remain[WHITE].period_stones = remain[WHITE].period_stones;
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
			'period_stones': this.remain[BLACK].period_stones,
			'period_time': this.remain[BLACK].period_time,
		};
		tmp_remain[WHITE] = {
			'main_time': this.remain[WHITE].main_time,
			'period_stones': this.remain[WHITE].period_stones,
			'period_time': this.remain[WHITE].period_time,
		};

		var tmp_remain_color = tmp_remain[this.actual_color];

		tmp_remain_color.main_time = remain_color.main_time - (new Date() - this.last_resume) / 1000;

		// Delegate extra removed time from main_time to period_time.
		if (tmp_remain_color.main_time < 0) {
			tmp_remain_color.period_time += tmp_remain_color.main_time;
			tmp_remain_color.main_time = 0;
		}

		this.game.update_clocks(tmp_remain);
		if (tmp_remain_color.period_time <= 0) {
			remain_color.main_time = 0;
			remain_color.period_time = 0;
			this.stop();
			this.game.announce_time_loss(this.remain);
		}
	},

	binder: function (method, object, args) {
		return function(orig_args) { method.apply(object, [orig_args].concat(args)); };
	},
}
