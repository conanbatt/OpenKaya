function ScoreBoardJGOAdaptor(jgoboard, size, komi, black_captures, white_captures, exactAnalysisOnly) {

	this.size = size;
	var board = new Array(size);
	for(var i=0;i<size;i++) {
		board[i] = new Array(size);
		for(var j=0;j<size;j++) {
			var kind;
			var jgoID = jgoboard.get(new JGOCoordinate(i,j));
			if(jgoID == JGO_CLEAR) {
				kind = ScoreBoard.EMPTY;
			} else if (jgoID == JGO_BLACK) {
				kind = ScoreBoard.BLACK;
			} else if(jgoID == JGO_WHITE) {
				kind = ScoreBoard.WHITE;
			}
			board[i][j] = kind;
		}
	}
	if(exactAnalysisOnly) {
		this.savedboard = new BoardExactAnalysis(board, komi, black_captures, white_captures);
	} else {
		this.savedboard = new BoardApproximatedAnalysis(board, komi, black_captures, white_captures);
	}
	this.board = this.savedboard.clone();
	this.board.computeAnalysis();
	this.board.countJapaneseResult();
}

ScoreBoardJGOAdaptor.prototype.toggleAndEstimate  = function(i, j) {
	var isDead = (this.board.getGroupStatusAt(i, j) == ScoreBoard.STATUS_GROUP_DEAD);
	this.savedboard.toggleAt(i, j, isDead);
	this.board = this.savedboard.clone();
	this.board.computeAnalysis();
	this.board.countJapaneseResult();
};

ScoreBoardJGOAdaptor.prototype.display  = function(jgoboard, showDebugInfo) {
	for(var i=0;i<this.size;i++) {
		for(var j=0;j<this.size;j++) {
			var mark = "";
			var status =this.board.getGroupStatusAt(i, j);
			var kind = this.board.getBoardFinalKindAt(i, j);
			if(kind == ScoreBoard.BLACK_DEAD || kind == ScoreBoard.WHITE_DEAD) {
				if(showDebugInfo) {
					mark = "D";
				} else {
					mark = "*";
				}
			} else if(kind == ScoreBoard.BLACK_ALIVE || kind == ScoreBoard.WHITE_ALIVE) {
				if(showDebugInfo) {
					mark = "A";
				}
			} else if(status == ScoreBoard.STATUS_GROUP_ALIVE) {
				if(showDebugInfo) {
					mark = "0";
				}
			} else if(status == ScoreBoard.STATUS_GROUP_DEAD) {
				mark = "*";
			} else if(showDebugInfo && this.board.isTerritoryAt(i, j) && this.board.isTerritorySeparator(i, j)) {
				mark = "S";
			} else if(kind == ScoreBoard.TERRITORY_BLACK) {
				mark = ".";
			} else if(kind == ScoreBoard.TERRITORY_WHITE) {
				mark = ",";
			} else if(kind == ScoreBoard.TERRITORY_KO_BLACK) {
				if(showDebugInfo) {
					mark = "K";
				} else {
					mark = ".";
				}
			} else if(kind == ScoreBoard.TERRITORY_KO_WHITE) {
				if(showDebugInfo) {
					mark = "K";
				} else {
					mark = ",";
				}
			} else if(kind == ScoreBoard.TERRITORY_DAME) {
				if(showDebugInfo) {
					mark = "#";
				}
			} else if(status == ScoreBoard.STATUS_GROUP_SEKI || kind == ScoreBoard.TERRITORY_SEKI) {
				if(showDebugInfo) {
					mark = "S";
				}
			} else if(status == ScoreBoard.STATUS_GROUP_UNKNOWN) {
				if(showDebugInfo) {
					mark = "?";
				}
			}
			jgoboard.mark(new JGOCoordinate(i,j), mark);
		}
	}
};

ScoreBoardJGOAdaptor.prototype.getGameResult  = function() {
	return this.board.getGameResult();
};

ScoreBoardJGOAdaptor.prototype.getWScore  = function() {
	return this.board.getWhiteScore();
};

ScoreBoardJGOAdaptor.prototype.getBScore  = function() {
	return this.board.getBlackScore();
};

