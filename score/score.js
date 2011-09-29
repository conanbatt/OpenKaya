function Score(ruleset) {
  var _deadStonesMultiplier;



  //TODO HDP. Hay una diferencia mas en las reglas chinas, que es que las piedras *no capturadas* cuentan como puntos. New tests included.
  if(ruleset == "Japanese"){
    _deadStonesMultiplier = 2
  }

  if(ruleset == "Chinese"){
    _deadStonesMultiplier = 1
  }

  //TODO always put var when you declare a variable(or function, which is the same for JS). 
  //without var, objects are initialized in the global scope. 
  //If you open up the test results, and go to the browser console, you will be able to see connectedComponent.
  //With var, it is enclosed in this scope , and it is private.
  connectedComponent = function(board, x,y) {
    var size = board.length; // Localize length for better performance
    var stack_coord = [[x,y]];

    var conexa = {
      owner: null,
      score: 0,
      deads: 0,
      coords: []
    };

    while(current_coord = stack_coord.shift()){
      x = current_coord[0]; y = current_coord[1];

      // Out of bounds
      if( x < 0 || x >= size || y < 0 || y >= size)
        continue;

      switch(board[x][y]) {
        case (EMPTY): {
          conexa.score++;
          conexa.coords.push({row: x, col: y});
          board[x][y] = null;

          stack_coord = stack_coord.concat([[x-1, y], [x+1, y], [x, y-1], [x, y+1]]);
          break;
        }
        case (BLACK_DEAD): {
          conexa.deads++;
          conexa.coords.push({row: x, col: y});
          board[x][y] = null;

          stack_coord = stack_coord.concat([[x-1, y], [x+1, y], [x, y-1], [x, y+1]]);

          conexa.owner = (conexa.owner != BLACK)? WHITE : NO_OWNER;
          break;
        }
        case (WHITE_DEAD): {
          conexa.deads++;
          conexa.coords.push({row: x, col: y});
          board[x][y] = null;

          stack_coord = stack_coord.concat([[x-1, y], [x+1, y], [x, y-1], [x, y+1]]);

          conexa.owner = (conexa.owner != WHITE)? BLACK : NO_OWNER;
          break;
        }
        case(BLACK): {
          if(!conexa.owner)
            conexa.owner = BLACK;
          else
            if(conexa.owner == WHITE)
              conexa.owner = NO_OWNER;

          break;
        }
        case(WHITE): {
          if(!conexa.owner)
            conexa.owner = WHITE;
          else
            if(conexa.owner == BLACK)
              conexa.owner = NO_OWNER;
          break;
        }
      }
    }

    return conexa;
  }


  /* Score function
   * Iterates over empty coordenates and count CC
   */
  this.score = function(board){
    //FIXME: I should clone board, but I need a clone function (jQuery)
    // var board = board_original; //.clone()
    var size = board.length; // Localize length for better performance
    var result = {
      white_points: 0,
      black_points: 0,
      groups: []
    };

    for(var row=0; row < size; ++row)
      for(var col=0; col < size; ++col)
        if(board[row][col] == EMPTY)
          result.groups = result.groups.concat(connectedComponent(board, row, col))

    // Post process
    for(var index in result.groups) {
      item = result.groups[index];
      if(item.owner == BLACK)
        result.black_points += item.score + (item.deads * _deadStonesMultiplier);
      else if(item.owner == WHITE)
        result.white_points += item.score + (item.deads * _deadStonesMultiplier);
    }

    return result;
  };

};

