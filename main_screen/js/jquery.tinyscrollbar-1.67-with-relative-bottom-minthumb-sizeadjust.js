/*!
 * Tiny Scrollbar 1.67-with-relative-bottom-minthumb-sizeadjust-visible
 * http://www.baijs.nl/tinyscrollbar/
 *
 * Copyright 2012, Maarten Baijs
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Date: 11 / 05 / 2012
 * Depends on library: jQuery
 *
 * Data: 17 / 06 / 2012
 *   -- Added 'relative-bottom' for updates, 
 *      which chooses bottom if we are at the bottom already,
 *      otherwise relative. - Adam Luter.
 *   -- Add 'top' and 'bottom' classes when at top or bottom of scrolling - Adam Luter.
 *   -- Add minthumb to allow auto sizing of thumb but maintain a minimum size - Adam Luter.
 *   -- Add sizeadjust to allow auto sizing of scrollbar but adjusted,
 *      for example -10 would allow for 5px of margin on the top and bottom - Adam Luter.
 */

(function($){
	$.tiny = $.tiny || { };

	$.tiny.scrollbar = {
		options: {
			axis: 'y', // vertical or horizontal scrollbar? ( x || y ).
			wheel: 40,  //how many pixels must the mouswheel scroll at a time.
			scroll: true, //enable or disable the mousewheel.
	        lockscroll: true, //return scrollwheel to browser if there is no more content.
			size: 'auto', //set the size of the scrollbar to auto or a fixed number.
      sizeadjust: -10, // the amount to adjust the auto size (otherwise the same size as the viewport)
			sizethumb: 'auto', //set the size of the thumb to auto or a fixed number.
      minthumb: 30 // the smallest the thumb can be
		}
	};

	$.fn.tinyscrollbar = function(options) {
		var options = $.extend({}, $.tiny.scrollbar.options, options);
		this.each(function(){ $(this).data('tsb', new Scrollbar($(this), options)); });
		return this;
	};
  // target and height are used exclusively for the 'relative-visible' update method
  // they specify an object that should be kept visible,
  // along with an optional height of that object
	$.fn.tinyscrollbar_update = function(sScroll, target, height) { return $(this).data('tsb').update(sScroll, target, height); };

	function Scrollbar(root, options){
		var oSelf = this;
		var oWrapper = root;
		var oViewport = { obj: $('.viewport', root) };
		var oContent = { obj: $('.overview', root) };
		var oScrollbar = { obj: $('.scrollbar', root) };
		var oTrack = { obj: $('.track', oScrollbar.obj) };
		var oThumb = { obj: $('.thumb', oScrollbar.obj) };
		var sAxis = options.axis == 'x', sDirection = sAxis ? 'left' : 'top', sSize = sAxis ? 'Width' : 'Height';
		var iScroll, iPosition = { start: 0, now: 0 }, iMouse = {};

		function initialize() {
			oSelf.update();
			setEvents();
			return oSelf;
		}
		this.update = function(sScroll, target, height){
			oViewport[options.axis] = oViewport.obj[0]['offset'+ sSize];
			oContent[options.axis] = oContent.obj[0]['scroll'+ sSize];
			oContent.ratio = oViewport[options.axis] / oContent[options.axis];
			oScrollbar.obj.toggleClass('disable', oContent.ratio >= 1);
			oTrack[options.axis] = options.size == 'auto' ?
        oViewport[options.axis] + options.sizeadjust :
        options.size;
			oThumb[options.axis] = Math.min(oTrack[options.axis], Math.max(options.minthumb, ( options.sizethumb == 'auto' ? (oTrack[options.axis] * oContent.ratio) : options.sizethumb )));
			oScrollbar.ratio = (oContent[options.axis] - oViewport[options.axis]) / (oTrack[options.axis] - oThumb[options.axis]);
      if( !isNaN(parseInt(sScroll)) ) {
        iScroll = parseInt(sScroll);
      } else if( sScroll == 'top' || oContent.ratio > 1 ) {
        iScroll = 0;
      } else if( sScroll == 'relative' || !oScrollbar.bottom && sScroll == 'relative-bottom' ) {
        iScroll = Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll));
      } else if( sScroll == 'bottom' || oScrollbar.bottom && sScroll == 'relative-bottom' ) {
        iScroll = oContent[options.axis] - oViewport[options.axis];
      } else if( sScroll == 'relative-visible' ) {
        var offset = target.offset().top - oContent.obj.offset().top;
        var force = 0;
        if( typeof(height) === 'undefined') 
          height = target.outerHeight();
        if( offset + height > oViewport['y'] + iScroll ) {
          iScroll = offset + height - oViewport['y'];
          force = height;
        } else if( offset < iScroll ) {
          iScroll = offset;
        }
        iScroll = Math.min((oContent[options.axis] - oViewport[options.axis] + force), Math.max(0, iScroll));
      } else {
        iScroll = 0;
      }
			setSize();
		};
		function setSize(){
      setiScroll();
			iMouse['start'] = oThumb.obj.offset()[sDirection];
			var sCssSize = sSize.toLowerCase();
			oScrollbar.obj.css(sCssSize, oTrack[options.axis]);
			oTrack.obj.css(sCssSize, oTrack[options.axis]);
			oThumb.obj.css(sCssSize, oThumb[options.axis]);
		};
    function setiScroll() {
      oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
      oContent.obj.css(sDirection, -iScroll);
      oScrollbar.top = iScroll <= 0;
      oScrollbar.bottom = iScroll >= oContent[options.axis] - oViewport[options.axis];
      oScrollbar.obj.toggleClass('top', oScrollbar.top );
      oScrollbar.obj.toggleClass('bottom', oScrollbar.bottom );
    }
		function setEvents(){
			oThumb.obj.bind('mousedown', start);
			oTrack.obj.bind('mouseup', drag);
			if(options.scroll && this.addEventListener){
				oWrapper[0].addEventListener('DOMMouseScroll', wheel, false);
				oWrapper[0].addEventListener('mousewheel', wheel, false );
			}
			else if(options.scroll){oWrapper[0].onmousewheel = wheel;}
		};
		function start(oEvent){
			iMouse.start = sAxis ? oEvent.pageX : oEvent.pageY;
			var oThumbDir = parseInt(oThumb.obj.css(sDirection));
			iPosition.start = oThumbDir == 'auto' ? 0 : oThumbDir;
      $(document).bind('mousemove', drag);
      $(document).bind('mouseup', end);
      oThumb.obj.bind('mouseup', end);
			return false;
		};
		function wheel(oEvent){
			if(!(oContent.ratio >= 1 )){
				var oEvent = oEvent || window.event;
				var iDelta = oEvent.wheelDelta ? oEvent.wheelDelta/120 : -oEvent.detail/3;

				iScroll -= iDelta * options.wheel;
				iScroll = Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll));

        setiScroll();

                if( options.lockscroll || ( iScroll !== (oContent[options.axis] - oViewport[options.axis]) && iScroll !== 0 ) )
                {
                    oEvent = $.event.fix(oEvent);
    				oEvent.preventDefault();
                }
			};
		};
		function end(oEvent){
			$(document).unbind('mousemove', drag);
			$(document).unbind('mouseup', end);
			oThumb.obj.unbind('mouseup', end);
			return false;
		};
		function drag(oEvent){
			if(!(oContent.ratio >= 1)){
        var distance = (sAxis ? oEvent.pageX : oEvent.pageY) - iMouse.start;
				iPosition.now = Math.min((oTrack[options.axis] - oThumb[options.axis]), Math.max(0, (iPosition.start + distance)));
				iScroll = iPosition.now * oScrollbar.ratio;

        setiScroll();
			}
			return false;
		};

		return initialize();
	};
})(jQuery);
