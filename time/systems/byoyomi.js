var ST_STOPED = 0;
var ST_PAUSED = 1;
var ST_COUNTING = 2;
var BLACK = 'B';
var WHITE = 'W';

function ByoyomiTimer(game, time, period, period_time) {
	// Validation
	if (!this.validate(time, period, period_time)) {
		return false;
	}

	// Game
	this.game = game;

	// Remaining time and period
	this.remain = {};
	this.remain[BLACK] = {
		'time': time,
		'period': period
	};
	this.remain[WHITE] = {
		'time': time,
		'period': period
	};

	// Stats
	this.status = ST_PAUSED;
	this.actual_color;
	this.last_resume;
	this.last_pause;

	// System
	this.system = {};
	this.system.name = "Byoyomi";
	this.system.time = time;
	this.system.period = period;
	this.system.period_time = period_time;
}

ByoyomiTimer.prototype = {
	// Validation
	validate: function(time, period, period_time) {
		if (time == undefined) {
			throw new Error("Must configure a main time.");
			return false;
		} else {
			if (typeof time != "number" || parseInt(time, 10) != time || time < 0) {
				throw new Error("Main time parameter must be a non-negative integer indicating seconds.");
				return false;
			}
		}

		if (period_time == undefined) {
			throw new Error("Must configure a period_time.");
			return false;
		} else {
			if (typeof period_time != "number" || parseInt(period_time, 10) != period_time || time < 0) {
				throw new Error("Period time parameter must be a non-negative integer indicating seconds per period.");
				return false;
			}
		}

		if (period == undefined) {
			throw new Error("Must configure number of periods.");
			return false;
		} else {
			if (typeof period != "number" || parseInt(period, 10) != period || time < 0) {
				throw new Error("Period parameter must be a non-negative integer indicating number of periods.");
				return false;
			}
		}

		return true;
	},

	// Force a remaining time for a player.
	set_remain: function(color, time) {
		if (color != "B" && color != "W") {
			throw new Error("Wrong color");
		} else {
			var remain_color = this.remain[color];
			remain_color.time = time;

			// Need to consider time with regard to byoyomi periods
			while(remain_color.time > this.system.period_time && remain_color.period < this.system.period) {
				remain_color.period++;
				remain_color.time -= this.system.period_time;
			}
		}
	},

	// Force a remaining period for a player.
	set_period: function(color, period) {
		if (color != "B" && color != "W") {
			throw new Error("Wrong color");
		} else {
			this.remain[color].period = period;
		}
	},

	// If it's not counting: update remain, color, last_resume and status, register interval, start!
	// If it's not counting: update remain, color, last_resume and status, register interval, start!
	resume: function(color, remain_b, remain_w) {
		if (this.status == ST_PAUSED) {
			if (remain_b && remain_w) {
				this.remain[BLACK].time = remain_b.time;
				this.remain[BLACK].period = remain_b.period;
				this.remain[WHITE].time = remain_w.time;
				this.remain[WHITE].period = remain_w.period;
			}
			this.actual_color = color;
			this.status = ST_COUNTING;
			this.last_resume = new Date();
			this.clock = window.setInterval(this.binder(this.tick, this), 100);
		}
	},

	// If it's counting: update last_pause, status and remain. Clear interval.
	pause: function() {
		if (this.status == ST_COUNTING) {
			var remain_color = this.remain[this.actual_color];

			this.last_pause = new Date();
			window.clearInterval(this.clock);
			this.status = ST_PAUSED;
			remain_color.time -= ((this.last_pause - this.last_resume) / 1000);

			// If the time is less than zeor, attempt to add periods
			while(remain_color.time < 0.5 && this.remain[this.actual_color].period > 0) {
				remain_color.period--;
				remain_color.time += this.system.period_time;
			}

			// If remain time is greater than zero, but we've used periods, force to the period time.
			if(remain_color.time > 0.5 && remain_color.period < this.system.period) {
				remain_color.time = this.system.period_time;
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
			this.remain[BLACK].period = remain[BLACK].period;
			this.remain[WHITE].time = remain[WHITE].time;
			this.remain[WHITE].period = remain[WHITE].period;
		}
		this.actual_color = null;
		this.last_resume = null;
		this.last_pause = null;
		this.status = ST_STOPED;
	},

	adjust: function(adjustment) {
		if (this.status != ST_STOPED) {
			var remain_color = this.remain[this.actual_color];
			remain_color.time -= Number(adjustment);

			// Need to consider time with regard to byoyomi periods
			while(remain_color.time > this.system.period_time && remain_color.period < this.system.period) {
				remain_color.period++;
				remain_color.time -= this.system.period_time;
			}
		}
	},

	// This handles the interval callback, creates a remain estimation and updates the clocks.
	// if remaining time reaches 0, client announces loss to server.
	tick: function() {
		var remain_color = this.remain[this.actual_color];

		var tmp_remain = {};
		tmp_remain[BLACK] = {
			'time': this.remain[BLACK].time,
			'period': this.remain[BLACK].period
		};
		tmp_remain[WHITE] = {
				'time': this.remain[WHITE].time,
				'period': this.remain[WHITE].period
		};

		var tmp_remain_color = tmp_remain[this.actual_color];

		tmp_remain_color.time = remain_color.time - (new Date() - this.last_resume) / 1000;

		// If the time < 0.5, attempt to add a period
		while (tmp_remain_color.time < 0.5 && tmp_remain_color.period > 0) {
			tmp_remain_color.time += this.system.period_time;
			tmp_remain_color.period--;
		}

		// Don't diplay periods if we are still in main time
		if (tmp_remain[BLACK].period == this.system.period) {
			tmp_remain[BLACK].period = null;
		}
		if (tmp_remain[WHITE].period == this.system.period) {
			tmp_remain[WHITE].period = null;
		}

		this.game.update_clocks(tmp_remain);
		if (tmp_remain_color.time <= 0) {
			remain_color.time = 0;
			remain_color.period = 0;
			this.stop();
			this.game.announce_time_loss(this.remain);
		}
	},

	binder: function (method, object, args) {
		return function(orig_args) { method.apply(object, [orig_args].concat(args)); };
	},
}
