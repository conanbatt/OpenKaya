var ST_STOPED = 0;
var ST_PAUSED = 1;
var ST_COUNTING = 2;
var BLACK = "B";
var WHITE = "W";

function HourglassTimer(game, time) {
	// Validation
	if (!this.validate(time)) {
		return false;
	}

	// Game
	this.game = game;

	// Remaining time
	this.remain = {};
	this.remain[BLACK] = time;
	this.remain[WHITE] = time;

	// Stats
	this.status = ST_PAUSED;
	this.actual_color;
	this.last_resume;
	this.last_pause;

	// System
	this.system = {};
	this.system.name = "Hourglass";
	this.system.time = time;
}

HourglassTimer.prototype = {
	// Validation
	validate: function(time) {
		if (time == undefined) {
			throw new Error("Must configure a main time.");
			return false;
		} else {
			if (typeof time != "number" || parseInt(time, 10) != time) {
				throw new Error("Main time parameter must be an integer indicating secconds.");
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
			this.remain[color] = time;
		}
	},

	// If it's not counting: update remain, color, last_resume and status, register interval, start!
	resume: function(color, remain_b, remain_w) {
		if (this.status == ST_PAUSED) {
			if (remain_b && remain_w) {
				this.remain[BLACK] = remain_b;
				this.remain[WHITE] = remain_w;
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
			this.last_pause = new Date();
			window.clearInterval(this.clock);
			this.status = ST_PAUSED;

			var tmp_resume = (new Date() - this.last_resume) / 1000;

			if (this.actual_color == BLACK) {
				this.remain[BLACK] -= tmp_resume;
				this.remain[WHITE] += tmp_resume;
			} else {
				this.remain[BLACK] += tmp_resume;
				this.remain[WHITE] -= tmp_resume;
			}
			return this.remain;
		}
		return false;
	},

	// Stop, clear everything up, update remain from arguments.
	stop: function(remain) {
		window.clearInterval(this.clock);
		if (remain) {
			this.remain = remain;
		}
		this.actual_color = null;
		this.last_resume = null;
		this.last_pause = null;
		this.status = ST_STOPED;
	},

	adjust: function(adjustment) {
		if (this.status != ST_STOPED) {
			this.remain[this.actual_color] -= Number(adjustment);
		}
	},

	// This handles the interval callback, creates a remain estimation and updates the clocks.
	// if remaining time reaches 0, client announces loss to server.
	tick: function() {
		var tmp_remain = {};
		tmp_remain[BLACK] = this.remain[BLACK];
		tmp_remain[WHITE] = this.remain[WHITE];

		var tmp_resume = (new Date() - this.last_resume) / 1000;
		if (this.actual_color == BLACK) {
			tmp_remain[BLACK] -= tmp_resume;
			tmp_remain[WHITE] += tmp_resume;
		} else {
			tmp_remain[BLACK] += tmp_resume;
			tmp_remain[WHITE] -= tmp_resume;
		}

		this.game.update_clocks(tmp_remain);
		if (tmp_remain[this.actual_color] <= 0) {
			// Correct the remaining time for both players
			if (this.actual_color == BLACK) {
				this.remain[WHITE] += this.remain[BLACK];
				this.remain[BLACK] = 0
			} else {
				this.remain[BLACK] += this.remain[WHITE];
				this.remain[WHITE] = 0;
			}

			this.stop();
			this.game.announce_time_loss(this.remain);
		}
	},

	binder: function (method, object, args) {
		return function(orig_args) { method.apply(object, [orig_args].concat(args)); };
	},
}
