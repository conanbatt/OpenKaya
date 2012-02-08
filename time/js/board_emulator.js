
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
	} else if (config.time_system == "Hourglass") {
		this.time = new HourglassTimer(this, config.starting_time);
	} else if (config.time_system == "Bronstein") {
		this.time = new BronsteinTimer(this, config.starting_time, config.bonus);
	} else if (config.time_system == "Fischer") {
		this.time = new FischerTimer(this, config.starting_time, config.bonus);
	} else if (config.time_system == "Byoyomi") {
		this.time = new ByoyomiTimer(this, config.main_time, config.periods, config.period_time);
	} else if (config.time_system == "Canadian") {
		this.time = new CanadianTimer(this, config.main_time, config.period_time, config.period_stones);
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
		var remain = this.time.pause(true);
		this.server.play(this.my_color, remain);
	},

	update_game: function(next_move, remain_b, remain_w) {
		this.time.pause();
		this.next_move = next_move;
		this.time.resume(this.next_move, remain_b, remain_w);
	},

	update_clocks: function(remain) {
		if (this.time.system.name == 'Byoyomi') {
			if (remain[BLACK].main_time > 0) {
				this.div_clocks[BLACK].innerHTML = Math.floor(remain[BLACK].main_time + 0.99);
			} else if (remain[BLACK].periods <= 1) {
				this.div_clocks[BLACK].innerHTML = Math.floor(remain[BLACK].period_time + 0.99) + ' SD';
			} else {
				this.div_clocks[BLACK].innerHTML = Math.floor(remain[BLACK].period_time + 0.99) + ' (' + remain[BLACK].periods + ')';
			}

			if (remain[WHITE].main_time > 0) {
				this.div_clocks[WHITE].innerHTML = Math.floor(remain[WHITE].main_time + 0.99);
			} else if (remain[WHITE].periods <= 1) {
				this.div_clocks[WHITE].innerHTML = Math.floor(remain[WHITE].period_time + 0.99) + ' SD';
			} else {
				this.div_clocks[WHITE].innerHTML = Math.floor(remain[WHITE].period_time + 0.99) + ' (' + remain[WHITE].periods + ')';
			}
		} else if (this.time.system.name == 'Canadian') {
			if (remain[BLACK].main_time > 0) {
				this.div_clocks[BLACK].innerHTML = Math.floor(remain[BLACK].main_time + 0.99);
			} else {
				this.div_clocks[BLACK].innerHTML = Math.floor(remain[BLACK].period_time + 0.99) + ' / ' + remain[BLACK].period_stones;
			}

			if (remain[WHITE].main_time > 0) {
				this.div_clocks[WHITE].innerHTML = Math.floor(remain[WHITE].main_time + 0.99);
			} else {
				this.div_clocks[WHITE].innerHTML = Math.floor(remain[WHITE].period_time + 0.99) + ' / ' + remain[WHITE].period_stones;
			}
		} else {
			this.div_clocks[BLACK].innerHTML = Math.round(remain[BLACK]);
			this.div_clocks[WHITE].innerHTML = Math.round(remain[WHITE]);
		}
	},

	announce_time_loss: function(remain) {
		if(this.next_move == this.my_color) {
			this.next_move = null;
			this.div_result.innerHTML = this.my_color + " LOSE";
			this.server.announce_loss(this.my_color, remain);
		}
	},

	announce_win: function(remain) {
		this.next_move = null;
		this.div_result.innerHTML = this.my_color + " WIN";
		this.time.stop(remain);
	},

}
