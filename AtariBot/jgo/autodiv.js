$(document).ready(function() {
	var counter = 0;
	
	$('.jgo_auto').each(function(i, el) {
		var board, player, container = $(el), uid = "jgo_auto"+i, html = '\
<div class="@CLASS@" id="@UID@"></div>\
<div class="jgo_controls">\
<div class="jgo_moves"><p class="jgo_mini">\
<a href="#" class="jgo_auto" id="first@UID@">&lt;&lt; first</a> \
<a href="#" class="jgo_auto" id="prev@UID@">&lt; prev</a> \
<span id="move@UID@">0</span> \
<a href="#" class="jgo_auto" id="next@UID@">next &gt;</a> \
<a href="#" class="jgo_auto" id="last@UID@">last &gt;&gt;</a></p></div>\
\
<div class="jgo_variations"><p class="jgo_mini">\
<a href="#" class="jgo_auto" id="up@UID@">var. up</a> \
<span id="variation@UID@">1/1</span> \
<a href="#" class="jgo_auto" id="down@UID@">var. down</a></p></div>\
\
<div class="jgo_captures">\
<p class="jgo_mini"><strong>B</strong> captures: <span id="black@UID@">0</span>, \
<strong>W</strong> captures: <span id="white@UID@">0</span></p></div>\
<div style="clear: both;"></div></div>';
		
		if(container.hasClass("small")) {
			container.html(html.replace(/@UID@/g, uid).replace("@CLASS@", "jgo_board small"));
			board = jgo_generateBoard($('#'+uid), "a"+i, 'small');
		} else {
			container.html(html.replace(/@UID@/g, uid).replace("@CLASS@", "jgo_board"));
			board = jgo_generateBoard($('#'+uid), "a"+i);
		}
		
		
		if(container.attr("sgf")) {
			var gotoMove = 0;
			
			if(container.attr("move"))
				gotoMove = parseInt(container.attr("move"));
				
			jgo_autoLoadSGF(container.attr("sgf"), function(gameTree) {
				player = new JGOPlayer(gameTree);
				
				if(gotoMove)
					while(player.navigator.getPosition() < gotoMove)
						if(!player.next())
							break;
							
				jgo_autoUpdater(board, player, uid); // initial update
			});
		}
		
		$('#first'+uid).click(function() {
			if(!player) return;
			if(player.reset()) jgo_autoUpdater(board, player, uid);
			return false;
		});
		
		$('#next'+uid).click(function() {
			if(!player) return;
			if(player.next()) jgo_autoUpdater(board, player, uid);
			return false;
		});
		
		$('#prev'+uid).click(function() {
			if(!player) return;
			if(player.previous()) jgo_autoUpdater(board, player, uid);
			return false;
		});
		
		$('#last'+uid).click(function() {
			if(!player) return;
			while(player.next()) {}
			jgo_autoUpdater(board, player, uid);
			return false;
		});
		
		$('#up'+uid).click(function() {
			if(!player) return;
			var variation = player.navigator.getVariation();
			if(variation == 0) return;
			player.previous();
			player.next(variation-1);
			jgo_autoUpdater(board, player, uid);
			return false;
		});
		
		$('#down'+uid).click(function() {
			if(!player) return;
			var variation = player.navigator.getVariation();
			if(variation >= player.navigator.getVariations()) return;
			player.previous();
			player.next(variation+1);
			jgo_autoUpdater(board, player, uid);
			return false;
		});		
	});
});

function jgo_autoUpdater(board, player, uid) {
	board.clearMarkers();
	board.setBoard(player.board);
		
	if("markers" in player.state)
		$.each(player.state["markers"], function(marker, coords) { board.mark(coords, marker); });
	
	if("moveCoordinate" in player.state) {
		var coord = player.state["moveCoordinate"];
		
		// only show last move if no markers on that position
		if(!board.markers[coord.sgf()]) 
			board.mark(coord, '0');
	}
		
	$('#move'+uid).html(player.navigator.getPosition());
	$('#black'+uid).html(player.captures[0]);
	$('#white'+uid).html(player.captures[1]);

	var variations = player.navigator.getVariations();
	if(player.navigator.getVariations() > 0) {
		$('#variation'+uid).html((player.navigator.getVariation()+1) + "/" + (variations+1)).removeClass("disabled");
		$('#up'+uid).removeClass("disabled");
		$('#down'+uid).removeClass("disabled");
	} else {
		$('#variation'+uid).html("1/1").addClass("disabled");
		$('#up'+uid).addClass("disabled");
		$('#down'+uid).addClass("disabled");
	}
	
	if(player.navigator.isAtBeginning()) {
		$("#first"+uid).addClass("disabled");
		$("#prev"+uid).addClass("disabled");
	} else {
		$("#first"+uid).removeClass("disabled");
		$("#prev"+uid).removeClass("disabled");
	}
	
	if(player.navigator.isAtEnd()) {
		$("#next"+uid).addClass("disabled");
		$("#last"+uid).addClass("disabled");
	} else {
		$("#next"+uid).removeClass("disabled");
		$("#last"+uid).removeClass("disabled");
	}
}

function jgo_autoLoadSGF(url, handler) {
	if(url.indexOf("http:") == 0) { // use JGOSGF service to fetch remote urls
		url = encodeURIComponent(url);

		$.ajax({
			type: 'GET',
			url: 'http://jgosgf.appspot.com/?url='+url, 
			dataType: 'jsonp',
			success: function(gameTree, textStatus) {
				if(gameTree.error)
					alert(gameTree.error);
				else
					handler(gameTree);				
			}
		});
	} else { // local urls can be fetched directly
		$.ajax({
			url: url, type: 'GET',
			success: function(sgf) {
				var gameTree = jgo_parseSGF(sgf); // parse SGF file string into game tree
	
				if(!gameTree) {
					alert(jgo_error());
					return;
				}
				
				handler(gameTree);
			},
			error: function(data) { alert("Could not find the SGF file in " + url); }
		});
	}
	
	return false;
}
