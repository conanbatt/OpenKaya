
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
	} else if (config.time_system == "Fischer") {
		this.time = new FischerTimer(this, config.starting_time, config.bonus);
	} else if (config.time_system == "Byoyomi") {
		this.time = new ByoyomiTimer(this, config.starting_time, config.period, config.period_time);
	} else if (config.time_system == "Canadian") {
		this.time = new CanadianTimer(this, config.starting_time, config.period_time, config.period_stone);
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
			if(remain[BLACK].period > 0) {
				this.div_clocks[BLACK].innerHTML = Math.round(remain[BLACK].time) + ' (' + remain[BLACK].period + ')';
			} else if(remain[BLACK].period == 0) {
				this.div_clocks[BLACK].innerHTML = Math.round(remain[BLACK].time) + ' SD';
			} else {
				this.div_clocks[BLACK].innerHTML = Math.round(remain[BLACK].time);
			}

			if(remain[WHITE].period > 0) {
				this.div_clocks[WHITE].innerHTML = Math.round(remain[WHITE].time) + ' (' + remain[WHITE].period + ')';
			} else if(remain[WHITE].period == 0) {
				this.div_clocks[WHITE].innerHTML = Math.round(remain[WHITE].time) + ' SD';
			} else {
				this.div_clocks[WHITE].innerHTML = Math.round(remain[WHITE].time);
			}
		} else if (this.time.system.name == 'Canadian') {
			if(remain[BLACK].stone > 0) {
				this.div_clocks[BLACK].innerHTML = Math.round(remain[BLACK].time) + ' / ' + remain[BLACK].stone;
			} else {
				this.div_clocks[BLACK].innerHTML = Math.round(remain[BLACK].time);
			}

			if(remain[WHITE].stone > 0) {
				this.div_clocks[WHITE].innerHTML = Math.round(remain[WHITE].time) + ' / ' + remain[WHITE].stone;
			} else {
				this.div_clocks[WHITE].innerHTML = Math.round(remain[WHITE].time);
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
