
function Board(config) {
	// Next move
	this.next_move = BLACK;

	// Divs
	this.div_result = document.getElementById(config.div_result);
	this.div_clocks = {};
	this.div_clocks[BLACK] = document.getElementById(config.div_clock_b);
	this.div_clocks[WHITE] = document.getElementById(config.div_clock_w);

	// Color
	this.my_color;

	// Timer
	if (config.time_system == "Absolute") {
		this.time = new AbsoluteTimer(this, config.starting_time);
	} else {
		throw new Error("No time system defined or time system not available.");
	}
}

Board.prototype = {

	play: function() {
		if (!this.next_move) {
			return false;
		}
		if (this.my_color != this.next_move) {
			throw new Error("Not my turn to play.");
			return false;
		}
		var remain = this.time.pause();
		this.server.play(this.my_color, remain);
	},

	update_game: function(next_move, remain_b, remain_w) {
		this.time.pause();
		this.next_move = next_move;
		this.time.resume(this.next_move, remain_b, remain_w);
	},

	update_clocks: function(remain) {
		this.div_clocks[BLACK].innerHTML = Math.round(remain[BLACK]);
		this.div_clocks[WHITE].innerHTML = Math.round(remain[WHITE]);
	},

	announce_loss: function(remain) {
		this.next_move = null;
		this.div_result.innerHTML = this.my_color + " LOSE";
		this.server.announce_loss(this.my_color, remain);
	},

	announce_win: function(remain) {
		this.next_move = null;
		this.div_result.innerHTML = this.my_color + " WIN";
		this.time.stop(remain);
	},

}
