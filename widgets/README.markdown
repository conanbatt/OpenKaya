Widgets are small plug-ins that are easily configurable, added or removed, from the users screen.

Kaya Widgets are used on the main page, in a sliding menu on the right side of the screen. 

Widgets are self-contained(they dont know about anything else than themselves) and small. They must fit in a fix space(yet to be determined).

We use the Jquery Widget Factory to configure them.

Example:

    $(document).ready(function(){
        $.widget( "main.widget_name", {
            options: {
                //some functions you would use to operate the widget while its live.,
                function example(){ alert("i got called");  }
            },

            _create: function() {
                //The DOM effect of the widget
                (new MyWidget()).html.appendTo("#my-widget");
            },

            destroy: function() {
                $.Widget.prototype.destroy.call( this );
                //cleaning up the dom effects of the particular widget
                $(this.element).children().remove();
            },
        });
    });

This way you can build your own Javascript Class, and inserting into this system makes it easy for us to add it to the server.

## How can i get my widget into Kaya?

First of all, the widget must have some basic tests. Check out the skeleton of the news widget to learn how to set them up. That way both you and I can see the widget running in a page before putting it anywhere else.

If it depends of outside information, you can just mock it (provide false information) then we will worry about patching it up with server information.

If the widget is practical, tested and working, adding it to the server can happen within a single release.

## Widget ideas

Widget ideas:

* Google/Microsoft translate
* News feed 
* Problem solving
* User Stats/graphs
* Server Stats (Karma givent oday, games played, users connected , etc)
* Streaming snapshots/thumbnails
* Fan history
* Event Calendar
* Achievement/Progress(Badge Master)  on goals
* Announcements
* Mini-TV/Streaming
* Tweaki
* News

Some require server collaboration, others like news feed, translation, thumbnails, calendar,etc, dont. Feel free to contact us to talk aobut a server collaboration widget at info@kaya.gs
