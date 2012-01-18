function MediaWidget() {
    
    var that = this;

    this.media_player; 

    this.sgf_parser;

    this.subscribe = function(media){ 
        this.media_player = media;
        this.media_player.listener = this.sgf_parser;
    }    

    this.process_media_info = function(data){ throw "Not yet implemented" };
    

};

