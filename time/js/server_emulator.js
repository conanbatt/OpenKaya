
function Server() {
	this.players = {
		BLACK: null,
		WHITE: null,
	}
}

Server.prototype = {
	subscribe: function(board) {
		if (this.players[WHITE] == null) {
			this.players[WHITE] = board;
			board.my_color = WHITE;
			board.server = this;
		} else if (this.players[BLACK] == null) {
			this.players[BLACK] = board;
			board.my_color = BLACK;
			board.server = this;
		}
	},

	play: function(color, remain) {
		this.broadcast(this.opposite_color(color), remain);
	},

	broadcast: function(next_move, remain) {
		if (remain) {
			if (this.players[WHITE] != null) {
				this.players[WHITE].update_game(next_move, remain.B, remain.W);
			}
			if (this.players[BLACK] != null) {
				this.players[BLACK].update_game(next_move, remain.B, remain.W);
			}
		} else {
			if (this.players[WHITE] != null) {
				this.players[WHITE].update_game(next_move);
			}
			if (this.players[BLACK] != null) {
				this.players[BLACK].update_game(next_move);
			}
		}
	},

	opposite_color: function(color) {
		if (color == BLACK) {
			return WHITE;
		} else {
			return BLACK;
		}
	},

	start_game: function() {
		this.broadcast(BLACK);
	},

	announce_loss: function(color, remain) {
		this.players[this.opposite_color(color)].announce_win(remain);
	},

}
