function Bot() {

    function play(grid){ throw new Error("Child must implement play function"); }

}

function SillyBot(){

  function play(color,grid){
      for(var i=0;i < grid.length;i++){
          for(var j=0; j<grid.length;i++){
              if(grid[i][j] == "E"){
                  return [i,j];
              }
          }
      }
  }

  function resign_callback(){
      alert("I resign");
  }


  return {play : play}

}
