var media_widget = new MediaWidget();

test("Should tell the sgf drawer what to do when a media event is triggered", function(){

    var last_parser_response;

    //i figure that when the audio/video reaches a certain second, a callback is called
    //that tells a listener (a function) some information
    mock_media_player = { trigger: function() { 
        if(this.listener){ this.listener.parse("second 17");}
    }   
    };

    //The listener is a function created by the mediaWidget which will take media information and do something and give it to the 
    //SGF parser.
    //What to tell him should be detailed in a test, as that will be the basis of any change of GoSpeed's SGFParser change
    //To support this feature
    mock_sgf_parser = {};
    mock_sgf_parser.parse = function(node_direction){ 
        if(node_direction === "second 17"){ 
            last_parser_response = "parsed Ok" 
        }
        return last_parser_response; 
    }

    media_widget.sgf_parser = mock_sgf_parser;
    media_widget.subscribe(mock_media_player);

    mock_media_player.trigger();
    equal(last_parser_response, "parsed Ok");

});

test("Should transform the media information event into something a parser could understand", function(){

    media_widget.media_player = mock_media_player;

    equal(media_widget.process_media_info("minute 3, second 14"), "branch 5, node 3")

});

/* Tips & Tricks

Notice: in the test that the media player contains a function, not the result of one. So its being called from outside.

I have no idea what is available outthere to work with media. I suggest looking at JPlayer, a widely used tool for media that might have just what it takes to perform this.

@author Gabriel Benmergui.
About the design: all donoe here is just to help this get kickstarted. I have no idea what the proper design for this should be, because
i am not so familiar with the problem.
HOWEVER it would be GREATLY practical to have as most funcitonality possible in this component. This will make it possible for other people
to use it in other services they make, and the more abstract it is, the easier we can put it on Gospeed knowing nothing else will be broken.

Last note about SGF format. It is possible to break the format, but its probably still goodd to make a meta-format. One that This media player can handle somehow. Say that you break the specification to easily locate a node: you can locate the node here, and then point it to the SGF parser.
Withotu more information and advancement i cannot really tell what is best.

So my #1 TODO on this matter: prototype. As quick & dirty as possible i suggest getting something up and working. It doesnt have to have a video or even an sgf parser/reader. It can be a set of artifical triggers like above, writing into an artificial reader. With that, the problem will be much easier to grasp and the best solution will be easier to understand, code and put into production.

*/




