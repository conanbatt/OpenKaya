var ST_STOPED = 0;
var ST_PAUSED = 1;
var ST_COUNTING = 2;

function AbsoluteTimer(game, time, div_b, div_w) {
	// Game
	this.game = game;

	// Remaining time
	this.remain = {};
	this.remain[BLACK] = time;
	this.remain[WHITE] = time;

	// Stats
	this.status = ST_STOPED;
	this.actual_color;
	this.last_resume;
	this.last_pause;

	// Draw
	this.game.update_clocks(this.remain);
}

AbsoluteTimer.prototype = {
	// If it's not counting: update remain, color, last_resume and status, register interval, start!
	resume: function(color, remain_b, remain_w) {
		if (this.status != ST_COUNTING) {
			if (remain_b && remain_w) {
				this.remain[BLACK] = remain_b;
				this.remain[WHITE] = remain_w;
			}
			this.actual_color = color;
			this.status = ST_COUNTING;
			this.last_resume = new Date();
			this.clock = window.setInterval(binder(this.tick, this), 1000);
		}
	},

	// If it's counting: update last_pause, status and remain. Clear interval.
	pause: function() {
		if (this.status == ST_COUNTING) {
			this.last_pause = new Date();
			window.clearInterval(this.clock);
			this.status = ST_PAUSED;
			this.remain[this.actual_color] -= Math.round((this.last_pause - this.last_resume) / 1000);
			return this.remain;
		}
		return false;
	},

	// Stop, clear everything up, update remain from arguments.
	stop: function(remain) {
		window.clearInterval(this.clock);
		if (remain) {
			this.remain = remain;
			this.game.update_clocks(this.remain);
		}
		this.actual_color = null;
		this.last_resume = null;
		this.last_pause = null;
		this.status = ST_STOPED;
	},

	// This handles the interval callback, creates a remain estimation and updates the clocks.
	// if remaining time reaches 0, client announces loss to server.
	tick: function() {
		var tmp_remain = {};
		tmp_remain[BLACK] = this.remain[BLACK];
		tmp_remain[WHITE] = this.remain[WHITE];
		tmp_remain[this.actual_color] = this.remain[this.actual_color] - Math.round((new Date() - this.last_resume) / 1000);
		this.game.update_clocks(tmp_remain);
		if (tmp_remain[this.actual_color] <= 0) {
			this.remain[this.actual_color] = 0;
			this.stop();
			this.game.announce_loss(this.remain);
		}
	},


}
