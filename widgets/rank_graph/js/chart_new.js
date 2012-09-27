/*

//For Ie
if (!window.console) {
    window.console = {
        log: function(str) {
            //alert(str);
        }
    };
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt){ //, from){
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

*/

$(document).ready(function() {

/*
	$("#user-chart").css({
		position: "absolute",
		top: "300px",
		left: "300px",
		//right: "0px",
		//bottom: "0px",
		width: "480px",
		height: "270px",
	});
*/

	$(window).resize(function() {
		$("#user-chart").rank_graph("update");
	});

	$.widget("main.rank_graph", {
		options: {
			games: [],
		},
		_create: function(){
			this.chart = new Highcharts.StockChart({
				chart: {
					renderTo: this.element[0],
					type: "spline",
				},
				series: [{
					name: "Rating",
					data: null,
				}],
				tooltip: {
					formatter: function() {
						var s = '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y', this.x) +'</b>';

						$.each(this.points, function(i, point) {
							s += '<br/><b>Color: </b>' + (point.point.extras.color == "W" ? "White" : "Black");
							s += '<br/><b>Opponent: </b>' + point.point.extras[(point.point.extras.color == "W" ? "black_player" : "white_player")];
							s += '<br/><b>Result: </b>' + point.point.extras.result;
							s += '<br/><b>Rating: </b>' + point.point.y;
						});

						return s;
					}
				},
				rangeSelector: {
					// Enable this line to remove top navigator
					enabled: false,
				},
				navigator: {
					// Enable this line to remove bottom navigator
					//enabled: false,
				},
				xAxis: {
					// Enable this line to hold x axis scale ratio
					//ordinal: false,
				},
			});
			this._update();
		},
		games: function(games) {
			this.options.games = setupData(games);
			console.log("Updated games");
			console.log(this.options.games);
			this._update();
		},
		get_chart: function() {
			return this.chart;
		},
		_update: function(){
			for (var i = 0, li = this.chart.series.length; i < li; ++i) {
				this.chart.series[i].setData(this.options.games, true);
			}
		},

		destroy: function(){
			$.Widget.prototype.destroy.call( this );
			this.chart.destroy();
			//cleaning up the dom effects of the particular widget
			//$(this.element).children().remove();
		},
	});

});

function setupData(data) {
	var new_data = [];
	var elem;
	for (var i = 0, li = data.length; i < li; ++i) {
		elem = {
			y: parseFloat(data[i].rating),
			x: Date.parse(data[i].datetime_played),
			extras: data[i],
		};
		new_data.unshift(elem);
	}
	return new_data;
}

