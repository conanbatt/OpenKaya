
function NewsWidget() {

    var sources =[];
    var that = this;

    this.add_source = function(source){ sources.push(source);};

    this.fetch_news = function(source){ 
        throw "unimplemented"; 
        //fetch the rss feed from it and parse it if needed
    }
    this.publish_news = function(){
        for(var i=0;i<sources.length; i++){
            var widget = $("#news_widget");
            widget.text(widget.text() + that.fetch_news(sources[i].rss)); 
        }
    }
};

