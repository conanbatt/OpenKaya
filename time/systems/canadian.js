var ST_STOPED = 0;
var ST_PAUSED = 1;
var ST_COUNTING = 2;
var BLACK = 'B';
var WHITE = 'W';

function CanadianTimer(game, time, period_time, period_stone) {
	// Validation
	if (!this.validate(time, period_time, period_stone)) {
		return false;
	}

	// Game
	this.game = game;

	// Remaining time and current stone
	this.remain = {};
	this.remain[BLACK] = {
		'time': time,
		'stone': 0
	};
	this.remain[WHITE] = {
		'time': time,
		'stone': 0
	};

	// Stats
	this.status = ST_PAUSED;
	this.actual_color;
	this.last_resume;
	this.last_pause;

	// System
	this.system = {};
	this.system.name = "Canadian";
	this.system.time = time;
	this.system.period_time = period_time;
	this.system.period_stone = period_stone;
}

CanadianTimer.prototype = {
	// Validation
	validate: function(time, period_time, period_stone) {
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
			if (typeof period_time != "number" || parseInt(period_time, 10) != period_time || period_time <= 0) {
				throw new Error("Period time parameter must be a positive integer indicating seconds per period.");
				return false;
			}
		}

		if (period_stone == undefined) {
			throw new Error("Must configure number of period stones.");
			return false;
		} else {
			if (typeof period_stone != "number" || parseInt(period_stone, 10) != period_stone || period_stone <= 0) {
				throw new Error("Period stones parameter must be a positive integer indicating number of stones per period.");
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
			this.remain[color].time = time;
		}
	},

	// Force a remaining period for a player.
	set_stone: function(color, stone) {
		if (color != "B" && color != "W") {
			throw new Error("Wrong color");
		} else {
			this.remain[color].period = stone;
		}
	},

	// If it's not counting: update remain, color, last_resume and status, register interval, start!
	// If it's not counting: update remain, color, last_resume and status, register interval, start!
	resume: function(color, remain_b, remain_w) {
		if (this.status == ST_PAUSED) {
			if (remain_b && remain_w) {
				this.remain[BLACK].time = remain_b.time;
				this.remain[BLACK].stone = remain_b.stone;
				this.remain[WHITE].time = remain_w.time;
				this.remain[WHITE].stone = remain_w.stone;
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

			// If we have stone == 0 then we are on main time, so if time < 0.5 switch to overtime display.
			if (remain_color.time < 0.5 && remain_color.stone == 0) {
				remain_color.stone = this.system.period_stone;
				remain_color.time += this.system.period_time;
			} 

 			// If we're on overtime subtract a stone and reset the period if necessary
			// This will actually work even if period_stone is 1.
			if (remain_color.stone > 0) {
				remain_color.stone--;
				if (remain_color.stone <= 0) {
					remain_color.stone = this.system.period_stone;
					remain_color.time = this.system.period_time;
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
			this.remain[BLACK].stone = remain[BLACK].stone;
			this.remain[WHITE].time = remain[WHITE].time;
			this.remain[WHITE].stone = remain[WHITE].stone;
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
		}
	},

	// This handles the interval callback, creates a remain estimation and updates the clocks.
	// if remaining time reaches 0, client announces loss to server.
	tick: function() {
		var remain_color = this.remain[this.actual_color];

		var tmp_remain = {};
		tmp_remain[BLACK] = {
			'time': this.remain[BLACK].time,
			'stone': this.remain[BLACK].stone
		};
		tmp_remain[WHITE] = {
			'time': this.remain[WHITE].time,
			'stone': this.remain[WHITE].stone
		};

		var tmp_remain_color = tmp_remain[this.actual_color];

		tmp_remain_color.time = remain_color.time - (new Date() - this.last_resume) / 1000;

		// If we have stone == 0 then we are on main time, so if time < 0.5 switch to overtime display.
    if (tmp_remain_color.time < 0.5 && tmp_remain_color.stone == 0) {
      tmp_remain_color.stone = this.system.period_stone;
      tmp_remain_color.time += this.system.period_time;
    }

		this.game.update_clocks(tmp_remain);
		if (tmp_remain_color.time <= 0) {
			remain_color.time = 0;
			remain_color.stone = 0;
			this.stop();
			this.game.announce_time_loss(this.remain);
		}
	},

	binder: function (method, object, args) {
		return function(orig_args) { method.apply(object, [orig_args].concat(args)); };
	},
}
