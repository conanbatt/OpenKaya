/*!
 * jGoBoard v1.0
 * http://www.jgoboard.com/
 *
 * This software is licensed under a Creative Commons Attribution-NonCommercial 3.0 Unported License:
 * http://creativecommons.org/licenses/by-nc/3.0/
 * If you want to negotiate on a commercial license, please contact the author.
 *
 * Date: 2011-02-17
 */
 
/* jGoBoard relies on jQuery, so make sure it is included before this file. */

// fixed intersection types - DO NOT CHANGE VALUES, they are used as indices in arrays!
var JGO_CLEAR = 0, // no stone
	JGO_BLACK = 1, // black stone
	JGO_WHITE = 2; // white stone
	
// additional types used internally by the library - should not be set directly using set() method
var JGO_DEAD_BLACK = 3, // dead black stone (translucent)
	JGO_DEAD_WHITE = 4, // dead white stone (translucent)
	JGO_FILL = 5; // board color fill to occlude the board intersection lines (used for labels)

// CSS classes used for different types of intersections	
var jgo_classes = [
	'jgo_c',
	'jgo_b',
	'jgo_w',
	'jgo_d jgo_b', // order is important because last one will
	'jgo_d jgo_w', // be prefixed for _s and other board sizes
	'jgo_f'
];

var jgo_shadow = [false, true, true, false, false, false]; // whether the type casts a shadow

// Marker code to CSS class mapping
// some values have a default and reverse color options (for displaying marker on black stone)
var jgo_markers = {
	'_': ['black', 'white'], // labels such as "2", "A", etc.
	'#': ['square_b', 'square_w'], // square
	'*': ['cross_b', 'cross_w'], // cross ("X")
	'/': ['triangle_b', 'triangle_w'], // triangle
	'0': ['circle_b', 'circle_w'], // circle
	'<': ['hover_b', 'hover_b'], // black stone hover
	'>': ['hover_w', 'hover_w'], // white stone hover
	'.': 'territory_b', // black territory - will cause underlying stones to appear dead
	',': 'territory_w', // white territory - will cause underlying stones to appear dead
	';': 'eye_b', // black eye - will cause underlying stones to appear dead
	':': 'eye_w' // white eye - will cause underlying stones to appear dead
}

var jgo_coord = "ABCDEFGHJKLMNOPQRST".split(''); // "J18" style of coordinates
var jgo_sgf = "abcdefghijklmnopqrstuvwxyz".split(''); // "ai" style of coordinates

var jgo_errorStr = false;

/**
 * Return last error.
 *
 * @returns Error string or false if no error yet
 */
function jgo_error() {
	return jgo_errorStr;
}

/**
 * Create a helper class to create coordinates from (1,2) (zero-based), "ah" and "J18" types of input.
 * You can create a coordinate with no arguments, in which case it defaults to (0,0), or with one argument,
 * in which case it tries to parse "J18" or "ai" type of string coordinate, or with two arguments, (i,j).
 */
function JGOCoordinate(i, j) {
	if(i != undefined) {
		if(j != undefined) {
			this.i = i;
			this.j = j;
		} else { // try to parse coordinates from first parameter
			this.i = 0;
			this.j = 0;
		
			if(typeof i != "string")
				return;
		
			if(i.substr(0,1).toUpperCase() == i.substr(0,1)) { // capital letter, assume "J18" type
				this.i = $.inArray(i.substr(0,1), jgo_coord); // now also works for IE
				this.j = 19-parseInt(i.substr(1));
			} else { // assume SGF-type coordinate
				this.i = $.inArray(i.substr(0,1), jgo_sgf);
				this.j = $.inArray(i.substr(1), jgo_sgf);
			}
		}
	} else { // called without both parameters
		this.i = 0;
		this.j = 0;
	}
}

/**
 * Make a human readable "J18" type string representation of the coordinate.
 *
 * @returns String representation
 */
JGOCoordinate.prototype.toString = function() {
	return jgo_coord[this.i] + (19-this.j);
}

/**
 * Make an SGF-type "ai" string representation of the coordinate.
 *
 * @returns String representation
 */
JGOCoordinate.prototype.sgf = function() {
	return jgo_sgf[this.i] + jgo_sgf[this.j];
};

/**
 * Make a copy of this coordinate.
 *
 * @returns {JGOCoordinate} A copy of this coordinate
 */
JGOCoordinate.prototype.copy = function() {
	return new JGOCoordinate(this.i, this.j);
};

/**
 * Go board class which has several helper methods to deal with common tasks such
 * as adjacent stones/liberties to a coordinate, or searching connected stones.
 * All changes to board contents need to go through the set(c,s) method!
 *
 * @param {int} width The width of the board
 * @param {int} height The height of the board - if not set, a square board is created
 */
function JGOBoard(width, height) {
	this.width = width;
	
	if(height != undefined)
		this.height = height;
	else
		this.height = this.width;
		
	this.board = new Array();
	
	for(var i=0; i<width; ++i) {
		var column = new Array();
		
		for(var j=0; j<height; ++j)
			column.push(JGO_CLEAR);
		
		this.board.push(column);
	}	
}

/**
 * Get the contents of the board at given coordinate.
 *
 * @param {JGOCoordinate} c The coordinate.
 * @returns {int} Either JGO_CLEAR, JGO_BLACK, or JGO_WHITE
 */
JGOBoard.prototype.get = function(c) {
	return this.board[c.i][c.j];
};
	
/**
 * Get the contents of the board at given coordinate(s).
 *
 * @param c The coordinate as JGOCoordinate object, or an array of JGOCoordinates
 */
JGOBoard.prototype.set = function(c, s) {
	if(c instanceof JGOCoordinate) {
		this.board[c.i][c.j] = s;
	} else if(c instanceof Array) {
		for(var i=0, len=c.length; i<len; ++i)
			this.board[c[i].i][c[i].j] = s;
	}
};
	
/**
 * Get neighboring stones of given type as coordinate array.
 *
 * @param {JGOCoordinate} c The coordinate
 * @param {int} s The type of stones to look for (JGO_CLEAR / JGO_BLACK / JGO_WHITE)
 * @returns {Array} The array of adjacent coordinates of given type (may be an empty array)
 */
JGOBoard.prototype.getAdjacent = function(c, s) {
	var coordinates = [], i = c.i, j = c.j;
				
	if(i>0 && this.board[i-1][j] == s)
		coordinates.push(new JGOCoordinate(i-1, j));
	if(i+1<this.width && this.board[i+1][j] == s)
		coordinates.push(new JGOCoordinate(i+1, j));
	if(j>0 && this.board[i][j-1] == s)
		coordinates.push(new JGOCoordinate(i, j-1));
	if(j+1<this.height && this.board[i][j+1] == s)
		coordinates.push(new JGOCoordinate(i, j+1));

	return coordinates;
};
	
/**
 * Search all stones belonging to the group at the given coordinate - can also be used to find clear areas.
 *
 * @param {JGOCoordinate} cood The coordinate from which to start search - defines also the type of neighbors to search
 * @retuns {Array} A list of connected coordinates of the same type
 */
JGOBoard.prototype.getGroup = function(coord) {
	var color = this.get(coord), // color which we are searching
		added = {}, // hash to check if a coordinate has been added
		queue = [coord.copy()], // queue of coordinates to check
		coordinates = [], // group stone coordinates
		board = this; // needs to be saved so it can be accessed inside $.each() iterator
			
	while(queue.length > 0) { // continue until new stones are exhausted
		newQueue = [];
		$.each(queue, function(i,c) {
			if(!(c.toString() in added)) { // a new coordinate found
				coordinates.push(c);
				added[c.toString()] = c;
				newQueue = newQueue.concat(board.getAdjacent(c, color)); // add connected stones to queue
			}
		});
		queue = newQueue;
	}
	
	return coordinates;
};
	
/**
 * Check if an array of coordinates have any liberties.
 *
 * @param {Array} group An array of JGOCoordinate instances comprising the group.
 */
JGOBoard.prototype.hasLiberties = function(group) {
	for(var i=0, len=group.length; i<len; ++i)
		if(this.getAdjacent(group[i], JGO_CLEAR).length > 0)
			return true;
			
	return false;
}

/**
 * Clear the board. 
 */
JGOBoard.prototype.clear = function() {
	var c = new JGOCoordinate(0,0);
	
	for(c.i=0; c.i<this.width; c.i++)
		for(c.j=0; c.j<this.height; c.j++)
			this.set(c, JGO_CLEAR);
}

/**
 * Get the difference between another board setup - i.e. the minimal amount of clear intersections, 
 * black and white stones to add to this board to make it identical to another board.
 *
 * @param {JGOBoard} aBoard The target board
 * @retuns {Array} Array with three lists of coordinates: coordinates to clear, coordinates to fill with black, coordinates to fill with white
 */
JGOBoard.prototype.getDiff = function(aBoard) {
	var c = new JGOCoordinate(0,0), diff = [[],[],[]], a;
	
	for(c.i=0; c.i<19; c.i++)
		for(c.j=0; c.j<19; c.j++)
			if(this.get(c) != (a = aBoard.get(c)))
				diff[a].push(c.copy());
	
	return diff;
}

/**
 * Simple iteration over all coordinates. Rather slow.
 *
 * @param {func} func The iterator method, which is called in the context of board object and passed coordinate as parameter.
 */
JGOBoard.prototype.each = function(func) {
	var c = new JGOCoordinate(0,0);
	
	for(c.j=0; c.j<19; c.j++)
		for(c.i=0; c.i<19; c.i++)
			func.call(this, c.copy());
}

/**
 * Update the contents of the board using a diff element (create one with getDiff()).
 *
 * @param {Array} diff The diff to execute
 */
JGOBoard.prototype.setDiff = function(diff) {
	this.set(diff[JGO_CLEAR], JGO_CLEAR);
	this.set(diff[JGO_BLACK], JGO_BLACK);
	this.set(diff[JGO_WHITE], JGO_WHITE);
};

/**
 * Update the board to match another board.
 *
 * @param {JGOBoard} b The another board
 */
JGOBoard.prototype.setBoard = function(b) {
	var c = new JGOCoordinate(0,0);
	
	for(c.i=0; c.i<19; c.i++) {
		for(c.j=0; c.j<19; c.j++) {
			stone = b.board[c.i][c.j];
			
			if(this.board[c.i][c.j] != stone)
				this.set(c, stone);
		}
	}
}

/**
 * Make a copy of this board.
 *
 * @retuns {JGOBoard} A copy of this board (no shared objects)
 */
JGOBoard.prototype.copy = function() {
	var b = new JGOBoard(this.width, this.height);
	
	b.setBoard(this);
	
	return b;
}

/**
 * Make a string representation of this board
 *
 * @retuns {string} A simple string representation
 */
JGOBoard.prototype.toString = function() {
	var c = new JGOCoordinate(0,0), arr = [], repr = ['.', '#', 'O'];
	
	for(c.j=0; c.j<19; c.j++) {
		for(c.i=0; c.i<19; c.i++)
			arr.push(repr[this.board[c.i][c.j]]);
		arr.push("\n");
	}
	
	return arr.join('');
}

/**
 * Construct a board out of string representation
 *
 * @param {string} str A simple string representation of board
 */
JGOBoard.prototype.fromString = function(str) {	
	var pos = 0, c = new JGOCoordinate(0,0), map = {'.': JGO_CLEAR, '#': JGO_BLACK, 'O': JGO_WHITE};
	
	str = str.replace(/\n/g, ""); // works with or without newlines
	
	for(c.j=0; c.j<19; c.j++) {
		for(c.i=0; c.i<19; c.i++, pos++) {
			var stone = map[str.charAt(pos)];
			
			if(this.get(c) != stone)
				this.set(c, stone);
		}
	}
}

/**
 * Make a move on the board and capture stones if necessary.
 *
 * @param {JGOCoordinate} coord Coordinate to play
 * @param {int} stone Stone to play - JGO_BLACK or JGO_WHITE
 * @retuns {int} Number of opponent stones captured, or -1 if move not allowed (on top of another stone or suicide)
 */
JGOBoard.prototype.play = function(coord, stone) {
	var enemy = (stone == JGO_BLACK ? JGO_WHITE : JGO_BLACK), enemies, captures = 0, me = this;
	
	if(this.get(coord) != JGO_CLEAR)
		return -1;
		
	this.set(coord, stone); // put own stone on board
		
	enemies = this.getAdjacent(coord, enemy);
	
	$.each(enemies, function(i, c) {
		if(me.get(c) != JGO_CLEAR) { // check that we have not already removed these enemy stones
			var group = me.getGroup(c);
			
			if(!me.hasLiberties(group)) {
				me.set(group, JGO_CLEAR);
				captures += group.length;
			}
		}
	});
	
	if(captures == 0 && !this.hasLiberties(this.getGroup(coord))) { // suicide
		this.set(coord, JGO_CLEAR); // revert changes
		return -1;
	}
		
	return captures;
}

function jgo_renderDiv(html, props) {
	html.push('<div ');
	if("className" in props) {
		html.push('class="');
		html.push(props.className);
		html.push('" ');
	}
	if("id" in props) {
		html.push('id="');
		html.push(props.id);
		html.push('" ');
	}
	html.push('style="left: ');
	html.push(props.left);
	html.push('px; top: ');
	html.push(props.top);
	html.push('px;');
	if("width" in props) {
		html.push(' width: ');
		html.push(props.width);
		html.push('px;');
	}
	if("height" in props) {
		html.push(' height: ');
		html.push(props.height);
		html.push('px;');
	}
	if("position" in props) {
		html.push(' background-position: ');
		html.push(props.position);
		html.push(';');
	}
	html.push('">');
	if("content" in props)
		html.push(props.content);
	html.push('</div>');
}

var jgo_setups = {
	'normal': {
		classPrefix: '', // prefix to add to any size-related classes
		topLeft: [28, 28], // top left coordinate of the board in board.jpg
		bottomRight: [619, 657], // bottom right coordinate of the board
		squareSize: [31, 33], // size of board square (inside intersection lines)
		aaPosition: [45, 47], // coordinates of top left intersection (aa / A19)
		
		stoneSize: [30, 30], // size of stone image
		shadowSize: [57, 50], // size of shadow image
		stoneOffset: [13, 5], // how stone is positioned inside the shadow
		
		coordSize: [24, 24] // size of coordinate - they are positioned just outside board
	},
	
	'small': {
		classPrefix: '_s', // prefix to add to any size-related classes
		topLeft: [19, 19],
		bottomRight: [418, 437],
		squareSize: [21, 22], 
		aaPosition: [30, 31],
		
		stoneSize: [20, 20],
		shadowSize: [38, 33],
		stoneOffset: [8, 3],
		
		coordSize: [16, 16] 
	}
};

/**
 * Generate a 19x19 go board inside a table element. Basically makes a 21x21 table with inner cells as 
 * intersections - these cells have their coordinates (like "K12", "A4", etc.) as their ids. The 
 * resulting structure is very straightforward and you can inspect it using FireBug if you want, but
 * you don't need to because the method returns a JGOBoard which is tied to the table element and will
 * update all changes to the board in the table.
 *
 * @param {JQuery} board The board table element as jQuery object - created via statement such as $('#board')
 * @param {string} prefix (optional) A unique prefix to separate several boards on one page
 */
function jgo_generateBoard(boardElement, prefix, setupName) {
	var html = [], top, left, sgf, black=true, i, j, setup;
			
	if(setupName)
		setup = jgo_setups[setupName];
	else
		setup = jgo_setups["normal"];
	
	var board = new JGOBoard(19,19), oldSet = board.set;
	
	board.markers = {}; // lookup table for markers with SGF coordinate as the key
	board.click = undefined; // this will be called on clicks if it is set
	board.setup = setup; // save in case we need it later
	
	if(!prefix)
		prefix = '';
	
	board.shadowPrefix = "jgo_sh"+prefix;
	board.stonePrefix = "jgo_st"+prefix;
	board.markerPrefix = "jgo_m"+prefix;
	
	// coordinate markers
	var topX = setup.aaPosition[0] - setup.coordSize[0]/2,
		topY = setup.topLeft[1] - setup.coordSize[1],
		bottomY = setup.bottomRight[1]+1,
		leftX = setup.topLeft[0] - setup.coordSize[0],
		leftY = setup.aaPosition[1] - setup.coordSize[1]/2,
		rightX = setup.bottomRight[0]+1, n;
		
	for(i=0; i<19; i++) {
		var coordClass = 'jgo_coord'+setup.classPrefix;
		n = ''+(19-i);
		jgo_renderDiv(html, {left: topX, top: topY, className: coordClass, content: jgo_coord[i]});
		jgo_renderDiv(html, {left: topX, top: bottomY, className: coordClass, content: jgo_coord[i]});
		jgo_renderDiv(html, {left: leftX, top: leftY, className: coordClass, content: n});
		jgo_renderDiv(html, {left: rightX, top: leftY, className: coordClass, content: n});
		topX += setup.squareSize[0];
		leftY += setup.squareSize[1];
	}
	
	// background-position: top right;
	
	var stoneX = setup.aaPosition[0] - setup.stoneSize[0]/2, stoneX2,
		stoneY = setup.aaPosition[1] - setup.stoneSize[1]/2,
		shadowX = stoneX - setup.stoneOffset[0], shadowX2,
		shadowY = stoneY - setup.stoneOffset[1];
	
	// precalculate shadow clippings on top, bottom, left, right
	var widthRight = setup.bottomRight[0]+1 - shadowX - setup.squareSize[0]*18,
		heightBottom = setup.bottomRight[1]+1 - shadowY - setup.squareSize[1]*18,
		clipTop = 0, clipLeft = 0;
		
	if(widthRight > setup.shadowSize[0])
		widthRight = 0; // clear if it is unnecessary to clip
	if(heightBottom > setup.shadowSize[1])
		heightBottom = 0; // clear if it is unnecessary to clip
	if(shadowX < setup.topLeft[0])
		clipLeft = setup.topLeft[0] - shadowX; // only set if shadow goes over board
	
	/* clipping shadow top is currently not implemented, as it is not very often necessary
	if(shadowY < setup.topLeft[1])
		clipTop = setup.topLeft[1] - shadowY; // only set if shadow goes over board*/
	
	for(j=0; j<19; j++) {		
		stoneX2 = stoneX;
		shadowX2 = shadowX;
		
		for(i=0; i<19; i++) {
			sgf = jgo_sgf[i] + jgo_sgf[j];
						
			var shadowProps = {left: shadowX2, top: shadowY, className: 'jgo_sh'+setup.classPrefix, id: board.shadowPrefix + sgf};
			
			if(i==18 && widthRight)
				shadowProps["width"] = widthRight;
			if(j==18 && heightBottom)
				shadowProps["height"] = heightBottom;
				
			if(i==0 && clipLeft) {
				shadowProps.left += clipLeft;
				shadowProps["width"] = setup.shadowSize[0] - clipLeft;
				shadowProps["position"] = "top right";
			}
			// clipping shadow top is not currently implemented, as it is unnecessary with current shadow
			// and would require extra logic for cases when both left and top clip occur
			
			jgo_renderDiv(html, shadowProps);
			jgo_renderDiv(html, {left: stoneX2, top: stoneY, className: 'jgo_c'+setup.classPrefix, id: board.stonePrefix + sgf});
			jgo_renderDiv(html, {left: stoneX2, top: stoneY, className: 'jgo_m'+setup.classPrefix, id: board.markerPrefix + sgf});
			
			stoneX2 += setup.squareSize[0];
			shadowX2 += setup.squareSize[0];
		}
		
		stoneY += setup.squareSize[1];
		shadowY += setup.squareSize[1];
	}
	
	boardElement.html(html.join(''));
		
	// logic for updating visual board with given stone/marker combo
	// needs to use setup.classPrefix for necessary CSS classes added
	var setBoard = function(sgfCoord,stone,marker) {
		var clearMarker = true; // by default, clear text inside marker
		
		if(marker == '') { // clear marker
			$('#'+this.markerPrefix+sgfCoord).removeClass()
				.addClass('jgo_m'+setup.classPrefix);
		} else if(marker != undefined) {
			var markerClass = jgo_markers[marker];
			
			if(markerClass == undefined) { // label
				if(stone == JGO_BLACK)
					$('#'+this.markerPrefix+sgfCoord).removeClass()
						.addClass('jgo_m'+setup.classPrefix)
						.addClass(jgo_markers['_'][1]).html(marker);
				else
					$('#'+this.markerPrefix+sgfCoord).removeClass()
						.addClass('jgo_m'+setup.classPrefix)
						.addClass(jgo_markers['_'][0]).html(marker);
					
				if(stone == JGO_CLEAR) // have a little background
					stone = JGO_FILL;
				
				clearMarker = false; // this is the only case when we don't want to clear text
			} else if(marker == '.' || marker == ',') { // territory
				$('#'+this.markerPrefix+sgfCoord).removeClass()
					.addClass('jgo_m'+setup.classPrefix)
					.addClass(markerClass);
					
				if(stone == JGO_BLACK) // mark stones inside territory dead
					stone = JGO_DEAD_BLACK;
				else if(stone == JGO_WHITE)
					stone = JGO_DEAD_WHITE;
					
			} else if(marker == ';' || marker == ':') { // eye
				$('#'+this.markerPrefix+sgfCoord).removeClass()
					.addClass('jgo_m'+setup.classPrefix)
					.addClass(markerClass);
					
				if(stone == JGO_BLACK) // mark stones inside territory dead
					stone = JGO_DEAD_BLACK;
				else if(stone == JGO_WHITE)
					stone = JGO_DEAD_WHITE;
					
			} else { // other type of marker
				if(stone == JGO_BLACK)
					$('#'+this.markerPrefix+sgfCoord).removeClass()
						.addClass('jgo_m'+setup.classPrefix)
						.addClass(markerClass[1]);
				else
					$('#'+this.markerPrefix+sgfCoord).removeClass()
						.addClass('jgo_m'+setup.classPrefix)
						.addClass(markerClass[0]);
			}
		}
		
		if(clearMarker)
			$('#'+this.markerPrefix+sgfCoord).html('');
			
		$('#'+this.stonePrefix+sgfCoord).removeClass().addClass(jgo_classes[stone]+setup.classPrefix);
		if(jgo_shadow[stone])
			$('#'+this.shadowPrefix+sgfCoord).show();
		else
			$('#'+this.shadowPrefix+sgfCoord).hide();
	};
	
	// override the JGOBoard.set method to update also visual display
	board.set = function(c, s) {
		oldSet.call(this, c, s); 
		
		if(c instanceof Array) {
			var me = this; // thank you jQuery for screwing /this/ in $.each
			$.each(c, function(i, coord) { 
				var sgf = coord.sgf();
				setBoard.call(me, sgf, s, me.markers[sgf]);
			});
		} else {
			var sgf = c.sgf();
			setBoard.call(this, sgf, s, this.markers[sgf]);
		}
	}
	
	// Add a function to place markers. Marker value '' clears a marker if it exists.
	// Special marker codes can be found from top of this file (jgo_markers).
	board.mark = function(coord,marker) {
		if(coord instanceof Array) { // handle arrays by calling ourselves
			var me = this;
			$.each(coord, function(i, c) { me.mark(c, marker); });
			return;
		}
		
		var sgf = coord.sgf();
		
		if(marker == '')
			delete this.markers[sgf];
		else
			this.markers[sgf] = marker;
		
		setBoard.call(this, sgf, this.get(coord), marker); // update visual display
	}
	
	// Additional function to clear current markers
	board.clearMarkers = function() {
		var me = this;
		$.each(this.markers, function(sgf, marker) {
			me.mark(new JGOCoordinate(sgf), '');
		});
	}
	
	boardElement.find('.jgo_m').click(function(event) {
		if(board.click == undefined) // do nothing if no click listener
			return;

		var id = event.target.id.substring(board.markerPrefix.length); 
		
		board.click(new JGOCoordinate(id));  // TD id is a pure coordinate such as "ab"
	});
	
	return board; // return the spiced-up board object
}
