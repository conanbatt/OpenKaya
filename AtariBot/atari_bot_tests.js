/** Note
(i, j) coords are relative to a double array board[i][j] so (i, 1) corresponds to the black group in the following example:
	var clear_territory_board = [
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ]
            ];
*/

function are_equal_boards(board1, board2){
  
	for(var i=0;i<board1.length;i++){
		for(var j=0;j<board1[i].length;j++){
			if(board1[i][j] != board2[i][j]){ 
				return false;
			}
		}
	}
	return true;
}

var E = "E";
var B = "B";
var W = "W";

function empty_grid(){ 

    return [ 
        [E,E,E,E,E,E,E],
        [E,E,E,E,E,E,E],
        [E,E,E,E,E,E,E],
        [E,E,E,E,E,E,E],
        [E,E,E,E,E,E,E],
        [E,E,E,E,E,E,E],
        [E,E,E,E,E,E,E],
    ]
}
var test_bot;

module("basic bot api", {setup:function(){
        test_bot = new SillyBot();
    }

    ,teardown: function() {
    }
 
});

test("Should be able to get a play position from a grid", function(){

    var grid = empty_grid();

    var response = test_bot.play("B",grid); 
   
    ok(are_equal_boards(response, [0,0]));

    grid[0,0] = "B";
    response = test_bot.play("W", grid);

    ok(are_equal_boards(response, [1,0]));
});

module("advanced bot api", {setup:function(){
        test_bot = new SillyBot();
    }

    ,teardown: function() {
    }
 
});

//test("

