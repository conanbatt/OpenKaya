function make2dArray(size) {
    var a = new Array(size);
    for(var i = 0; i < a.length; i++) {
	a[i] = new Array(a.length);
    }
    return a;
}

var emptyTriangle = [["B","B"],["B","E"]];

var a = make2dArray(9);
fill2dArray(a);
play(a,3,3,"W");
play(a,3,4,"W");
play(a,4,4,"W");
printOut2dArray(a);
print();


print(testShape(emptyTriangle,a,4,4));

function testShape(shape,board,x,y) {
    var max_X;
    var max_Y;
    var min_X;
    var min_Y;

    var shapesize = shape.length;
    var limit = board.length;
    
    max_X = x+shapesize;
    if(max_X > limit) 
	max_X = limit;
    max_Y = y+shapesize;
    if(max_Y > limit)
	max_Y = limit;
    min_X = x-shapesize+1;
    if(min_X < 0)
	mix_X = 0;
    min_Y = y-shapesize+1;
    if(min_Y < 0)
	min_Y = 0;

    if((max_X - min_X) < shape || (max_Y - min_Y) < shape)
	return false; // we can't check a pattern like this.

    var out = "";
    for(var i = min_Y;i < max_Y;++i) {
	for(var j = min_X;j < max_X;++j) {
	    out += board[i][j];
	    if( j != (max_X - 1)) {
		out += ",";
	    }
	}
	print(out);
	out = "";
    }

    // If the last move played if black, we check for a pattern made by
    // black.
    var black = (board[x][y] == "B");
    
    for(var rotate = 0;rotate < 4;rotate++) {
    	for(var set_i = 0; set_i <= (max_Y - min_Y) - shapesize;++set_i) {
    	    for(var set_j = 0; set_j <= (max_X - min_X) - shapesize;++set_j) {
    		var match = true;
    		for(var i = set_i;i < shapesize+set_i && match;++i) {
    		    for(var j = set_j;j < shapesize+set_j && match;++j) {
    			match = checkMatch(shape[i-set_i][j-set_j],
    					   board[min_Y+i][min_X+j],
    					   black);
    			print("Shape: ");
    			printOut2dArray(shape);
    			print("Board: ");
    			var toPrint = make2dArray(shapesize);
    			for(var q = set_i;q < shapesize+set_i;++q) {
    			    for(var q2 = set_j;q2 < shapesize+set_j;++q2) {
    				toPrint[q-set_i][q2-set_j] = board[min_Y+q][min_X+q2]
    			    }
    			}
    			printOut2dArray(toPrint);
    			print(match);
    		    }
    		}
    		if(match)
    		    return true;
    	    }
    	}
    	shape = rotateArray(shape);
    }
    
    return false;
}
// true is black false is white
// checks one char
function checkMatch(pattern,board,black_or_white) {
    if(pattern == "B") { // B is friendly stone
	if(black_or_white) 
	    return board == "B";
	else
	    return board == "W";
    }
    if(pattern == "W") { // W is opponent stone
	if(black_or_white)
	    return board == "W";
	else
	    return board == "B";
    }
    if(pattern == "E") { // E is empty only
	return board == "E";
    }
    if(pattern == "A") { // A is "any"
	return true;
    }
    if(pattern == "O") { // O is opponent or empty
	if(board == "E") {
	    return true;
	}
	if(black_or_white)
	    return board == "W";
	else
	    return board == "B";
    }
    if(pattern == "F") { // F is friendly or empty
	if(board == "E") {
	    return true;
	}
	if(black_or_white)
	    return board == "B";
	else
	    return board == "W";
    }
    if(pattern == "S") { // S means there just has to be a
	                 // stone there. Color doesn't matter.
	if(board == "B" || board == "W") {
	    return true;
	}
    }

    // Error, this should not happen.
    // Throw an error later or something
    return false;
}
function rotateArray(array) {
    var n = array.length;
    var ret = make2dArray(n);
    
    for( var i = 0; i < n; ++i) {
	for( var j = 0; j < n; ++j) {
	    ret[i][j] = array[n - j - 1][i];
	}
    }
    return ret;
    
}
function play(array,x,y,move) {
    
    array[x][y] = move;

}

function printOut2dArray(array) {
    var out;
    out = "";
    for(var i = 0; i < array.length;++i) {
	for(var x = 0; x < array.length;++x) {
	    
	    out += array[i][x];
	    if(x != (array.length - 1)) {
		out += ",";
	    }
	}
	print(out);
	out = "";
    }
}

function fill2dArray(array) {
    var out;
    for(var i = 0; i < array.length;++i) {
	for(var x = 0; x < array.length;++x) {

	    array[i][x] = "E";
	}
    }
}