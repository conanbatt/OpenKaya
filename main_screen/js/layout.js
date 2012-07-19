$(function() {
  setupChat();
  setupUserList();
  setupGameList();

  fixIE();
});

$.transitionEnd = (function() {
  var prefix = {
   'WebKitTransitionEvent': 'webkitTransitionEnd',
   'MozTransitionEvent': 'MozTransitionend',
   'OTransitionEvent': 'OTransitionEnd',
   'msTransitionEvent': 'MsTransitionEnd'};
  for(var eventName in prefix) {
    if( eventName in window )
      return prefix[eventName];
  }
  if( 'transitionEvent' in window )
    return 'transitionend';
  return null;
})();

$.kaya = {
  layout: {
    wideScreen: 'screen and (min-width: 1280px)'
  }
}

// TODO: this should also be applied to new entries
function fixIE() {
  if($('html').is('.ie8')) {
    $('#chat-content li:nth-child(even)').addClass('even');
    $('#user-list-content li:nth-child(even)').addClass('even');
  }
}

function setupChat() {
  var chatContent = $('#chat-content');
  chatContent.tinyscrollbar();
  chatContent.tinyscrollbar_update('bottom');

  $(window).resize(updateChatContent);
  updateChatRooms();

  // for testing
  var addRoom = $('#chat-rooms-add-button');
  addRoom.click(function() {
    // make sure to include a space..
    $('#chat-rooms-content').append(' <a>Foolicious to the Max!</a>');
    updateChatRooms();
  });
  var chatEntry = $('#chat-entry input').keyup(function(e) {
    if(e.keyCode != 13) return true;
    var input = $('#chat-entry input').val();
    $('#chat-entry input').val('');
    $('#chat-content ol').append(
      '<li data-user="conanbatt" data-time="16:27">'+
        '<h4>conanbatt(6d)</h4>'+
          '<h5>16:27</h5>'+
          '<p>'+input+'</p>'+
        '</li>');
    updateChatContent();
    return false;
  });
}

function setupUserList() {
  var userListContent = $('#user-list-content');
  userListContent.tinyscrollbar();
  $(window).resize(updateUserListContent);

  // addListener support in chrome and firefox is pretty buggy, so let's just use resize..
  $(window).resize(updateLayoutWideScreen);
  updateLayoutWideScreen();
  
// user list button
  $('#user-list-toggle-button').click(userListToggleClick);

  $('#user-list li .name, #chat-content h4, #game-list a.black, #game-list a.white').click(userNameClick);

  $('#user-list-toolbar > a').click(userListToolbarClick);
}

function setupGameList() {
  var gameListContent = $('#game-list-content');
  gameListContent.tinyscrollbar();
  $(window).resize(updateGameListContent);

  $('#game-list .status-bar').click(gameListStatusbarClick);

  $('#create-game').click(createGameClick);
}

// call when content in chat rooms changes
function updateChatRooms() {
  var chatRooms = $('#chat-rooms');
  var chatContent = $('#chat-content');
  var height = chatRooms.outerHeight();
  chatContent.css({top: height});
  updateChatContent();
}

// call when content in chat list changes
function updateChatContent() {
  $('#chat-content').tinyscrollbar_update('relative-bottom');
}

// call when content in user list changes
function updateUserListContent() {
  $('#user-list-content').tinyscrollbar_update('relative');
}

// call when content in game list changes
function updateGameListContent() {
  $('#game-list-content').tinyscrollbar_update('relative');
}

function updateLayoutWideScreen(e) {
  var poppedUp = $('html').is('.user-list-popped-up');
  var slidOpen = $('html').is('.user-list-slid-open');
  if( !slidOpen && !poppedUp && window.matchMedia($.kaya.layout.wideScreen).matches ) {
    $('html').addClass('user-list-slid-open');
  } else if( slidOpen && !window.matchMedia($.kaya.layout.wideScreen).matches ) {
    $('html').removeClass('user-list-slid-open');
    $('html').addClass('user-list-slid-close');
  }
}

function userListToggleClick(e) {
  var poppedUp = $('html').is('.user-list-popped-up');
  var slidOpen = $('html').is('.user-list-slid-open');
  var canSlide = window.matchMedia($.kaya.layout.wideScreen).matches;

  // hitting the button can't slide it close, so it's safe to just remove this class now
  $('html').removeClass('user-list-slid-close');

  if( slidOpen ) {
    $('html').removeClass('user-list-slid-open');
    $('html').addClass('user-list-popped-up');
  } else if( poppedUp ) {
    $('html').removeClass('user-list-popped-up');
  } else if( canSlide ) {
    $('html').addClass('user-list-slid-open');
  } else {
    $('html').addClass('user-list-popped-up');
  }

  updateUserListContent();

  return false;
}

function ensureUserListVisible() {
  var open = $('html').is('.user-list-popped-up, .user-list-slid-open');
  if( open ) return true;

  var canSlide = window.matchMedia($.kaya.layout.wideScreen).matches;
  if( canSlide ) {
    $('html').addClass('user-list-slid-open');
  } else {
    $('html').addClass('user-list-popped-up');
  }

  updateUserListContent();

  return false;
}

function userNameClick(e) {
  var username = $(this).closest('[data-user]').attr('data-user');
  var user = $('#user-list li[data-user="'+username+'"]');
  if(!user.length) return;

  var wasVisible = ensureUserListVisible();

  $('#user-list li').not(user).removeClass('selected');
  if( wasVisible ) {
    user.toggleClass('selected');
  } else {
    user.addClass('selected');
  }
  if( user.is('.selected') ) {
    $('#user-list-content').tinyscrollbar_update('relative-visible', user, 80);
  }
  user.one($.transitionEnd, updateUserListContent);
}

function userListToolbarClick(e) {
  var a = $(this);
  a.siblings().removeClass('selected');
  a.toggleClass('selected');
}

function gameListStatusbarClick(e) {
  var status = $(this);
  var details = status.next('.details');
  details.toggleClass('open');
  details.one($.transitionEnd, updateGameListContent);
}

function createGameClick(e) {
  var createGame = $('#game-list-create-game');
  createGame.children('.buttons').hide();
  createGame.children('form').show();
  updateGameListContent();
}




