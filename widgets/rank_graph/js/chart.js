//For Ie
if (!window.console) {
    window.console = {
        log: function(str) {
            //alert(str);
        }
    };
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/){
    var len = this.length;
    
    var from = Number(arguments[1]) || 0;
    from = (from < 0)
        ? Math.ceil(from)
        : Math.floor(from);
    if (from < 0)
     from += len;
    
    for (; from < len; from++){
     if (from in this &&
         this[from] === elt)
       return from;
    }
    return -1;
    };
}


$(document).ready(function() {


   $.widget("main.rank_graph", {
     options:{
         games: [] 
     },
     _create: function(){
         this.options.rank_graph = new RankGraph();
         window.graph = this.options.rank_graph;
         $(this.element).append(this.options.rank_graph.html);
         this._update();
     },
     games: function(games){
         this.options.games = games;
         this._update();
     },
     _update: function(){
         this.options.rank_graph.draw(this.options.games);
     },

     destroy: function(){
         $.Widget.prototype.destroy.call( this );
         //cleaning up the dom effects of the particular widget
         $(this.element).children().remove();
     }
   });


    $("#gamecount").keydown(function(event) {
        if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
        // Allow: Ctrl+A
        (event.keyCode == 65 && event.ctrlKey === true) ||
        // Allow: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
            return;
        } else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                event.preventDefault();
                $('#gamecountwarn').fadeIn();
                setTimeout(function() {
                    $('#gamecountwarn').fadeOut('slow');
                }, 3000);
            }
        }
    });
});

function RankGraph(){

    this.html = function(){
        return $("<div id='rank_graph_container'></div>")[0];
    }();
    var that = this;

    var maxDataPointsForDots = 50,
        transitionDuration = 1000;
 
    var svg = null,
        yAxisGroup = null,
        xAxisGroup = null,
        dataCirclesGroup = null,
        dataLinesGroup = null;

    

//TODO space this properly
function draw(data) {

    // Use container of graph as size for graph
    var w = $(that.html).parent().width() || 500; //Sometimes this is 0, dont know why.
    var h = $(that.html).parent().height() || 500;

    // Padding for graph Axes
    var margin = 40;

    xAxisValues = arrayRankMaxMin(data);
    // Determin min and max height of the yAxis
    if((xAxisValues.biggest + 3) > 9) {
        var max = 9;
    } else {
        var max = (xAxisValues.biggest + 3);
    }
    if((xAxisValues.smallest - 3) < -30) {
        var min = -30;
    } else {
        var min = (xAxisValues.smallest - 3);
    }

    var pointRadius = 4;
    var x = d3.time.scale().range([0, w - margin * 2]).domain([data[0].date, data[data.length - 1].date]);
    var y = d3.scale.linear().range([h - margin * 2, 0]).domain([min, max]);

    var xAxis = d3.svg.axis().scale(x).tickSize(h - margin * 2).tickPadding(10).ticks(7);
    var yAxis = d3.svg.axis().scale(y).orient('left').tickSize(-w + margin * 2).tickPadding(10).ticks(4);
    var t = null;

    svg = d3.select(that.html).select('svg').select('g');
    if (svg.empty()) {
        svg = d3.select(that.html)
            .append('svg:svg')
                .attr('width', w)
                .attr('height', h)
                .attr('class', 'viz')
            .append('svg:g')
                .attr('transform', 'translate(' + margin + ',' + margin + ')');
    }

    t = svg.transition().duration(transitionDuration);

    // y ticks and labels
    if (!yAxisGroup) {
        yAxisGroup = svg.append('svg:g')
            .attr('class', 'yTick')
            .call(yAxis);
    }
    else {
        t.select('.yTick').call(yAxis);
    }

    // x ticks and labels
    if (!xAxisGroup) {
        xAxisGroup = svg.append('svg:g')
            .attr('class', 'xTick')
            .call(xAxis);
    }
    else {
        t.select('.xTick').call(xAxis);
    }

    // Draw the lines
    if (!dataLinesGroup) {
        dataLinesGroup = svg.append('svg:g');
    }

    var dataLines = dataLinesGroup.selectAll('.data-line')
            .data([data]);

    var line = d3.svg.line()
        // assign the X function to plot our line as we wish
        .x(function(d,i) { 
            // verbose logging to show what's actually being done
            //console.log('Plotting X value for date: ' + d.date + ' using index: ' + i + ' to be at: ' + x(d.date) + ' using our xScale.');
            // return the X coordinate where we want to plot this datapoint
            //return x(i); 
            return x(d.date); 
        })
        .y(function(d) { 
            // verbose logging to show what's actually being done
            //console.log('Plotting Y value for data value: ' + d.value + ' to be at: ' + y(d.value) + " using our yScale.");
            // return the Y coordinate where we want to plot this datapoint
            //return y(d); 
            return y(d.value); 
        })
        .interpolate("linear");


    var garea = d3.svg.area()
        .interpolate("linear")
        .x(function(d) { 
            // verbose logging to show what's actually being done
            return x(d.date); 
        })
                .y0(h - margin * 2)
        .y1(function(d) { 
            // verbose logging to show what's actually being done
            return y(d.value); 
        });

    dataLines
        .enter()
        .append('svg:path')
                .attr("class", "area")
                .attr("d", garea(data));

    dataLines.enter().append('path')
         .attr('class', 'data-line')
         .style('opacity', 0.3)
         .attr("d", line(data));


    dataLines.transition()
        .attr("d", line)
        .duration(transitionDuration)
            .style('opacity', 1)
                        .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(d.value) + ")"; });

    dataLines.exit()
        .transition()
        .attr("d", line)
        .duration(transitionDuration)
                        .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(0) + ")"; })
            .style('opacity', 1e-6)
            .remove();

    d3.selectAll(".area").transition()
        .duration(transitionDuration)
        .attr("d", garea(data));

    // Draw the points
    if (!dataCirclesGroup) {
        dataCirclesGroup = svg.append('svg:g');
    }

    var circles = dataCirclesGroup.selectAll('.data-point')
        .data(data);

    circles
        .enter()
            .append('svg:circle')
                .attr('class', 'data-point')
                .style('opacity', 1e-6)
                .attr('cx', function(d) { return x(d.date) })
                .attr('cy', function() { return y(0) })
                .attr('r', function() { return (data.length <= maxDataPointsForDots) ? pointRadius : 0 })
            .transition()
            .duration(transitionDuration)
                .style('opacity', 1)
                .attr('cx', function(d) { return x(d.date) })
                .attr('cy', function(d) { return y(d.value) });

    circles
        .transition()
        .duration(transitionDuration)
            .attr('cx', function(d) { return x(d.date) })
            .attr('cy', function(d) { return y(d.value) })
            .attr('r', function() { return (data.length <= maxDataPointsForDots) ? pointRadius : 0 })
            .style('opacity', 1);

    circles
        .exit()
            .transition()
            .duration(transitionDuration)
                // Leave the cx transition off. Allowing the points to fall where they lie is best.
                //.attr('cx', function(d, i) { return xScale(i) })
                .attr('cy', function() { return y(0) })
                .style("opacity", 1e-6)
                .remove();

      $('svg circle').tipsy({ 
        gravity: 'w', 
        opacity: 1,
        html: true, 
        title: function() {
          var d = this.__data__;
      var pDate = d.date;
          return gamelink(d.game_id) + '<br />Date: ' + pDate + '<br />Rank: ' + d.value + '<br />Result:' + d.result + '<br />Opponent: ' + d.opponent;
        }
      });
}

function convertRank(value){
    if(value.indexOf('k') > 0) {
        return Number("-" + value.substring(0,value.indexOf('k')));
    }
    if(value.indexOf('d') > 0) {
        return Number(value.substring(0,value.indexOf('d')));
    }
}

function arrayRankMaxMin(data) {
    var rankrange = [];
    for (var key in data) {
        var obj = data[key];
        for (var prop in obj) {
            if (prop == 'value') {
                // Loop through to find the biggest, smallest and current rank for Axes.
                var rank = obj[prop];

                if (biggest == undefined) {
                    var biggest = rank;
                }
                if (smallest == undefined) {
                    var smallest = rank;
                }

                if (rank > biggest) {
                    var biggest = rank;
                }
                if (rank < smallest) {
                    smallest = rank;
                }
            }
        }
    }
    rankrange = {"smallest": smallest, "biggest": biggest, "current": rank};
    return rankrange;
}

function gamelink(id){ 
    return '<a href="http://beta.kaya.gs/gospeed/' + id + '" target="_blank">View Game</a>';
}
function fixRanks() {
    $('#user-chart').find('.yTick text').each( function(index) {
        val = $(this).text();
        if(val < 0) {
            var origVal = $(this).text();
            $(this).text(origVal.substring(1) + "k");
        } else {
            $(this).append("d");
        }
    });
}

    this.draw = draw;

}

RankGraph.prototype.load_from_kaya = function(target,username, game_count) {
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: 'data/' + username + '.json',
        success: function(data) {
            if(data.length > 0) {
                //We have data in JSON format
                var resultsArray = [];
                for(key in data){
                    var date = new Date(data[key]['datetime_played']);    
                    if (data[key]['white_player'].toLowerCase() == username.toLowerCase()) {
                        newrank = convertRank(data[key]['white_rank']);
                        opponent = data[key]['black_player'];
                    } else {
                        newrank = convertRank(data[key]['black_rank'])
                        opponent = data[key]['white_player'];
                    }
                    result = data[key]['result'];  
                    // Create array of useable data        
                    resultsArray.push({
                        'gamelink': gamelink(data[key]['id']),
                        'value': newrank,
                        'date': date,
                        'result': result,
                        'opponent': opponent
                    });
                }   
                target.rank_graph({games : resultsArray.reverse()});
                fixRanks();
            } else {
                console.log("No data found");
            }
        },
        error: function(response){
            alert("Error: " + response.responseText);
        }    
    });
}

