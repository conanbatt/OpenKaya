var news_widget = new NewsWidget();

test("Should be able to read the sources RSS feed", function(){
    var gogameguru = {link : "gogameguru.com", rss: "gogameguru.com/rss"};
    news_widget.add_source(gogameguru);

    var mock_fetch = function(rss_link){ 
        if(rss_link=="gogameguru.com/rss"){
            return "Kaya alpha is released!"; 
        }
    }

    news_widget.fetch_news = mock_fetch;

    news_widget.publish_news();

    ok($("#news_widget").text().indexOf("Kaya alpha is released!") != -1)

});


