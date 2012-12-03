var SGFPARSER_ST_ERROR = 1;//"ERROR"; // 1
var SGFPARSER_ST_PARSED = 2;//"PARSED"; // 2
var SGFPARSER_ST_LOADED = 4;//"LOADED"; // 4

function SGFNode() {
	this.prev = null;
	this.next = [];
	this.last_next = null;
	this.props = {};
}

SGFNode.prototype = {
	appendNext: function(node) {
		node.prev = this;
		this.next.push(node);
		if (this.last_next == null) {
			this.last_next = node;
		}
	},

	toString: function() {
		var s = ";";
		for (var prop in this.props) {
			s += prop + "[" + this.props[prop] + "]";
		}
		return s;
	},
}

function SGFParser(sSGF) {
	this.init.apply(this, [sSGF]);
}

SGFParser.prototype = {
	init: function(sSGF) {
		this.sgf = sSGF;
		this.root = null;
		this.pointer = null;
		this.last_node = null;
		this.moves_loaded = "";
		this.parse();
	},

	append_node: function(node) {
		if (this.pointer == this.root && !this.root.loaded) {
			this.root.props = node.props;
			this.root.loaded = true;
		} else {
			node.prev = this.pointer;
			this.pointer.next.push(node);
			this.pointer.last_next = node;
			this.pointer = node;
			this.last_node = node;
		}
	},

	parse: function() {
		this.root = new SGFNode();
		this.root.root = true;
		this.pointer = this.root;
		this.last_node = this.root;
		var new_node;
		var nodes_for_var = [];	// Track the last node where a variation started.

		var chr = '';
		var file_len = this.sgf.length;
		var i = 0;
		var esc_next = false;
		var prop_ident;
		var prop_val;
		var propsFound = [];
		var rex_pos = /^[a-z]{2}$/;
		var tmp;

		while (i < file_len) {
			chr = this.sgf[i];
			switch(chr) {
				case "\\":
					esc_next = true;
				break;
				case "(":
					nodes_for_var.push(this.pointer);
				break;
				case ")":
					this.pointer = nodes_for_var.pop();
				break;
				case ";":
					if (!esc_next) {
						// New node
						tmp = this.sgf_handle_node(this.sgf, i + 1);
						if (tmp === false) {
							return false;
						} else {
							i += tmp;
						}
					}
				break;
				default:
					if (!/\s/.test(chr)) {
						this.status = SGFPARSER_ST_ERROR;
						this.error = "Unexpected character";
						return false;
					}
				break;
			}
			i++;
		}

		// Result
		if (this.root == null) {
			this.status = SGFPARSER_ST_ERROR;
			this.error = "Empty SGF";
			return false;
		} else {
			this.status = SGFPARSER_ST_PARSED;
			return true;
		}
	},

	sgf_handle_node: function(buffer, buf_start) {
		var prop_end = false;
		var buf_end = buf_start;
		var rex_prop = /^[A-Z]$/
		var prop_ident = "";
		var prop_val = "";
		var prop_arr = [];
		var cur_char = '';
		var esc_next = false;

		this.append_node(new SGFNode());

		buf_end += this.sgf_eat_blank(buffer, buf_end);

		// Handle empty node...
		if (buffer[buf_end] == ";") {
			prop_end = true;
		}

		while (!prop_end) {
			while (!prop_end) {
				cur_char = buffer[buf_end];
				if (rex_prop.test(cur_char)) {
					prop_ident += cur_char;
				} else if (cur_char == '[') {
					prop_end = true;
				} else {
					if (!/\s/.test(cur_char)) {
						this.status = SGFPARSER_ST_ERROR;
						this.error = "Error parsing node property name.\nWrong SGF syntax.";
						return false;
					}
				}
				buf_end++;
			}
			prop_end = false;
			while (!prop_end) {
				cur_char = buffer[buf_end];
				if (cur_char == undefined) {
					this.status = SGFPARSER_ST_ERROR;
					this.error = "Error parsing node property value.\nWrong SGF syntax.";
					return false;
				}
				if (cur_char == '\\') {
					esc_next = true;
				} else if (!esc_next && cur_char == ']') {
					prop_arr.push(prop_val);
					prop_val = "";
					buf_end += this.sgf_eat_blank(buffer, buf_end + 1);
					if (buffer[buf_end + 1] != '[') {
						prop_end = true;
					} else {
						buf_end++;
					}
				} else {
					prop_val += cur_char;
					esc_next = false;
				}
				buf_end++;
			}

			if (prop_arr.length == 1) {
				prop_arr = prop_arr[0];
			}

			this.pointer.props[prop_ident] = prop_arr;
			prop_arr = [];
			prop_ident = "";
			prop_val = "";
			buf_end += this.sgf_eat_blank(buffer, buf_end);
			if (rex_prop.test(buffer[buf_end])) {
				prop_end = false;
			}
		}
		return buf_end - buf_start;
	},

	sgf_eat_blank: function(buffer, buf_start) {
		var buf_end = buf_start;
		var cur_char = '';
		var end = false;
		while (!end) {
			cur_char = buffer[buf_end];
			switch (cur_char) {
				case '\r':
				break;
				case '\n':
				break;
				case ' ':
				break;
				case '\\':
					esc_next = true;
				break;
				default:
					end = true;
				break;
			}
			buf_end++;
		}
		return buf_end - buf_start - 1;
	},

	load: function(game) {
		if (this.status == SGFPARSER_ST_PARSED) {
			if (!this.root) {
				return false;
			}

			// Clear the game
			game.clear();

			// Clear moves_loaded
			this.moves_loaded = "";

			// Takes info from the root and configures the game.
			this.process_root_node(game);

			// Fills the tree with the info from the sgf, starting from each node.
			if (!this.sgf_to_tree(game, this.root, game.game_tree.root, NODE_SGF)) {
				return false;
			}

			// Go back to the begining.
			this.rewind_game(game);

			game.render();

			game.render_tree();

		} else {
			//throw new Error("Empty / Wrong SGF");
			return false;
		}

		this.status = SGFPARSER_ST_LOADED;
		return true;
	},

	process_root_node: function(game) {
		// Setup based on root node properties.
		var sgf_node = this.root;
		if (sgf_node.props.RU != undefined) {
			game.change_ruleset(sgf_node.props.RU);
		}
		if (sgf_node.props.KM != undefined) {
			game.change_komi(Number(sgf_node.props.KM));
		}
		if (sgf_node.props.SZ != undefined) {
			game.change_size(Number(sgf_node.props.SZ));
		}
		if (sgf_node.props.C != undefined) {
			if (game.game_tree != undefined && game.game_tree.root != undefined) {
				game.game_tree.root.comments = sgf_node.props.C;
			}
		}

		// Hello polly from the future, here you can place new time systems...
		// Generate timer config
		var time_settings = {};
		if (sgf_node.props.OT != undefined) {
			if (/fischer/i.test(sgf_node.props.OT)) {
				var bonus = sgf_node.props.OT.match(/\d+(\.\d+)?/);
				if (bonus) {
					time_settings.name = "Fischer";
					time_settings.settings = {
						bonus: parseFloat(bonus[0]),
					}
				}
			} else if (/hourglass/i.test(sgf_node.props.OT)) {
				time_settings.name = "Hourglass";
				time_settings.settings = {};
			} else if (/byo-?yomi/i.test(sgf_node.props.OT)) {
				var match = sgf_node.props.OT.match(/(\d+)[x\/](\d+)/i);
				if (match[1] && match[2]) {
					time_settings.name = "Byoyomi";
					time_settings.settings = {
						periods: parseInt(match[1], 10),
						period_time: parseInt(match[2], 10),
					};
				}
			}
		}
		if (time_settings.name == undefined) {
			if (sgf_node.props.TM != undefined) {
				time_settings.name = "Absolute";
				time_settings.settings = {
					main_time: parseFloat(sgf_node.props.TM),
				}
			} else {
				time_settings.name = "Free";
			}
		} else {
			if (sgf_node.props.TM == undefined) {
				time_settings.settings.main_time = 0;
			} else {
				time_settings.settings.main_time = parseFloat(sgf_node.props.TM);
			}
		}

		// Finally apply config
		//game.time = new GoTime(game, time_settings);
		game.time.setup(time_settings);

		if (sgf_node.props.AB != undefined || sgf_node.props.AW != undefined) {
			var free = new FreePlay();
			free.captured = {"B": 0, "W": 0};
			game.game_tree.root.play = free;
			if (sgf_node.props.AB != undefined) {
				sgf_node.props.AB = [].concat(sgf_node.props.AB);
				for (var key in sgf_node.props.AB) {
					free.put.push(new Stone("B", sgf_node.props.AB[key].charCodeAt(1) - 97, sgf_node.props.AB[key].charCodeAt(0) - 97));
				}
			}
			if (sgf_node.props.AW != undefined) {
				sgf_node.props.AW = [].concat(sgf_node.props.AW);
				for (var key in sgf_node.props.AW) {
					free.put.push(new Stone("W", sgf_node.props.AW[key].charCodeAt(1) - 97, sgf_node.props.AW[key].charCodeAt(0) - 97));
				}
			}
			game.board.make_play(free);
			if (game.shower != undefined) {
				game.shower.draw_play(free);
			}
		}
		if (sgf_node.props.HA != undefined) {
			game.game_tree.root.next_move = "W";
		}
		if (sgf_node.props.PL != undefined) {
			game.game_tree.root.next_move = sgf_node.props.PL;
		}
	},

	sgf_to_tree: function(game, sgf_node, tree_node, node_source, no_duplicate_branch) {
		// Push roots to start "recursive-like" iteration.
		var pend_sgf_node = [];
		var pend_game_tree_node = [];
		pend_sgf_node.push(sgf_node);
		pend_game_tree_node.push(tree_node)

		var move;
		var time_left;
		var tmp;
		var tree_node;
		while(sgf_node = pend_sgf_node.pop()) {
			tree_node = pend_game_tree_node.pop();
			tree_node.last_next = tree_node.next[0]; // XXX WTF???
		// do: rewind game until reaches game tree_node.
			var path = tree_node.get_path();
			if (path != game.game_tree.actual_move.get_path()) {
				game.goto_path(path, true);
			}
			/*
			while (game.game_tree.actual_move != tree_node) {
				tmp = game.game_tree.prev();
				game.board.undo_play(tmp.play);
			}
			*/
		// do: play sgf_node contents at game point in game.
			// FIXME: quisiera ver cuál es la mejor manera de validar que el sgf hizo la jugada correcta sin tener que confiar en next_move que podría romperse
			if (sgf_node.props.B != undefined || sgf_node.props.W != undefined) {
				if (game.get_next_move() == "B" && sgf_node.props.B != undefined) {
					move = sgf_node.props.B;
					time_left = this.get_time_from_node(game.time.clock, sgf_node.props.BL, sgf_node.props.OB);
				} else if (game.get_next_move() == "W" && sgf_node.props.W != undefined) {
					move = sgf_node.props.W;
					time_left = this.get_time_from_node(game.time.clock, sgf_node.props.WL, sgf_node.props.OW);
				} else {
					this.status = SGFPARSER_ST_ERROR;
					this.error = "Turn and Play mismatch: " + game.get_next_move() + "'s turn, node: " + sgf_node;
					return false;
				}
				if (move == "" || (game.board.size < 20 && move == "tt")) {
					tmp = new Pass(game.get_next_move())
					game.update_play_captures(tmp);
				} else {
					tmp = game.setup_play(move.charCodeAt(1) - 97, move.charCodeAt(0) - 97);
					if (!tmp) {
						this.status = SGFPARSER_ST_ERROR;
						this.error = "Illegal move or such... sgf_node: " + sgf_node;
						return false;
					}
				}
				tmp.time_left = time_left;

				var index = false;
				if (no_duplicate_branch) {
					index = game.game_tree.actual_move.search_next_play(tmp);
				}

				if (index !== false) {
					game.next(index, true);
				} else {
					game.game_tree.append(new GameNode(tmp, node_source, sgf_node.props.C));
					game.board.make_play(tmp);
					if (time_left != undefined && !isNaN(time_left) && game.time.clock != undefined) {
						var rmn = {};
						rmn[tmp.put.color] = time_left;
						game.time.clock.set_remain(rmn);
					}
				}
			}
		// do: push actual_node to pend_game_tree_node
		// do: push sgf_node.next nodes to pend_sgf_node
			for (var i = sgf_node.next.length - 1; i >= 0; --i) {
				pend_sgf_node.push(sgf_node.next[i]);
				pend_game_tree_node.push(game.game_tree.actual_move);
			}
		}
		return true;
	},

	rewind_game: function(game, limit) {
		var tmp_node;
		while (game.game_tree.actual_move != game.game_tree.root) {
			tmp_node = game.game_tree.prev();
			game.board.undo_play(tmp_node.play);
			if (limit != undefined) {
				limit--;
				if (limit <= 0) {
					break;
				}
			}
		}
	},

	same_move: function(sgf_node, tree_node) {
		var move;
		//if (sgf_node.props.B != undefined || sgf_node.props.W != undefined) {
		if (tree_node.play != undefined && tree_node.play.put != undefined && tree_node.play.put.color != undefined) {
			move = sgf_node.props[tree_node.play.put.color];
			if (tree_node.play instanceof Pass) {
				if (move != "") {
					return false;
				}
			} else if (tree_node.play instanceof Play) {
				if (tree_node.play.put.row != move.charCodeAt(1) - 97 || tree_node.play.put.col != move.charCodeAt(0) - 97) {
					return false;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
		return true;
	},

	new_add_moves: function(game, moves) {
		// Check moves already loaded
		if (this.moves_loaded == moves) {
			return false;
		}
		// Generate and parse sgf from moves.
		var sgf = "(;FF[4]" + moves + ")";
		var tmp_parser = new SGFParser(sgf);

		// Browse
		var sgf_node; // SGF node pointer
		var tree_node; // Tree node pointer
		var sgf_stash = []; // Iterative-recursion stash from sgf
		var tree_stash = []; // Iterative-recursion stash from game_tree

		var tmp_sgf_stash = []; // To make sure the algorithm is DFS
		var tmp_tree_stash = []; // To make sure the algorithm is DFS

		var reconstruct; // Flag to reconstruct branch
		var offline_nodes; // Will temporarily store offline nodes
		var new_moves = false;

		//game.goto_start(true); // Point game to start.

		sgf_stash.push(tmp_parser.root);      // Start with root, please.
		tree_stash.push(game.game_tree.root); // Sure!

		while(sgf_node = sgf_stash.pop()) {
			tree_node = tree_stash.pop();
			//if (!sgf_node.root && !tree_node.root) {
			for (var i = 0, li = sgf_node.next.length; i < li; ++i) {
				reconstruct = false;
				if (tree_node.next[i] != undefined) {
					if (tree_node.next[i].source > NODE_ONLINE) {
						// Temporarily remove offline nodes
						offline_nodes = tree_node.next.splice(i, tree_node.next.length - i);
						// Increment their node position
						for (var j = 0, lj = offline_nodes.length; j < lj; ++j) {
							offline_nodes[j].pos++;
						}
						// Cast reconstruct
						reconstruct = true;
					} else {
						if (!this.same_move(sgf_node.next[i], tree_node.next[i])) {
							var s = "";
							s += "Different moves loaded in the same place...<br /><br />";
							s += "<b>Loaded:</b> " + this.moves_loaded + "<br />";
							s += "<b>New:</b> " + moves + "<br />";
							s += "<b>Conflict:</b><br />";
							s += "&nbsp;&nbsp;&nbsp;&nbsp;<b>loaded:</b> " + tree_node.next[i].play.to_sgf();
							s += " (" + node_source_verbose(tree_node.next[i].source) + ")<br />";
							s += "<b>new:</b> " + sgf_node.next[i];
							throw new Error(s);
						}
						tmp_sgf_stash.unshift(sgf_node.next[i]);
						tmp_tree_stash.unshift(tree_node.next[i]);
					}
				} else {
					// Cast reconstruct
					reconstruct = true;
				}
				if (reconstruct === true) {
					new_moves = true;
					this.sgf_to_tree(game, sgf_node.next[i], tree_node, NODE_ONLINE);
					if (offline_nodes != undefined) {
						tree_node.next = tree_node.next.concat(offline_nodes);
						offline_nodes = undefined;
					}
				}
			}
			sgf_stash = sgf_stash.concat(tmp_sgf_stash);
			tree_stash = tree_stash.concat(tmp_tree_stash);
			tmp_sgf_stash = [];
			tmp_tree_stash = [];
		}
		this.moves_loaded = moves;
		return new_moves;
	},

	parse_only_moves: function(sgf) {
		var tmp = sgf.match(/;(B|W)\[([a-z]{2})?\]/g);
		if (tmp) {
			return tmp.join("");
		} else {
			return "";
		}
	},

	get_time_from_node: function(clock, time_left, overtime_periods) {
		// XXX TODO FIXME Maybe this validation is way too hard.
		if (clock != undefined) {
			switch(clock.system.name) {
				case "Free":
					return undefined;
				break;
				case "Absolute":
				case "Fischer":
				case "Hourglass":
					if (time_left == undefined) {
						time_left = clock.system.main_time;
					}
					return {
						main_time: parseFloat(time_left),
					};
				break;
				case "Byoyomi":
					var tmp_res;
					if (overtime_periods == undefined) {
						overtime_periods = clock.system.periods;
						if (time_left == undefined) {
							time_left = clock.system.main_time;
						}
						tmp_res = {
							'main_time': parseFloat(time_left),
							'periods': parseInt(overtime_periods, 10),
							'period_time': clock.system.period_time,
						};
					} else {
						if (time_left == undefined) {
							time_left = clock.system.period_time;
						}
						tmp_res = {
							'main_time': 0,
							'periods': parseInt(overtime_periods, 10),
							'period_time': parseFloat(time_left),
						};
					}
					return tmp_res;
				break;
			}
		} else {
			// XXX TODO FIXME: is this ok?
			return undefined;
		}
	},
}

function node_source_verbose(src) {
	switch(src) {
		case NODE_SGF:
			return "NODE_SGF";
		break;
		case NODE_ONLINE:
			return "NODE_ONLINE";
		break;
		case NODE_OFFLINE:
			return "NODE_OFFLINE";
		break;
		case NODE_VARIATION:
			return "NODE_VARIATION";
		break;
		default:
			return "NO_SOURCE";
		break;
	}
}
