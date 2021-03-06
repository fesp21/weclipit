(function(){
  var $window = $(window);
  var resizeWindow = function(){
    var $shUsers = $('.shared-users')
      , shUsersPos = $shUsers.position()
      ;
    if($shUsers && shUsersPos){
      var h = $shUsers.height()
        , t = shUsersPos.top
        ;
      $('img', $shUsers).each(function(pos, el){
        var $el = $(el)
          , pos = $el.position()
          ;
        if(pos.top-t < h){
          $el.attr('src', $el.attr('data-src'));
        }
      });
    }
  };
  var resizeTO;
  var onResize = function(){
    clearTimeout(resizeTO);
    resizeTO = setTimeout(resizeWindow, 100);
  };
  Template.videosSharingTemplate.rendered = function() {
    $window.bind('resize', onResize);
    resizeWindow();
  };
  
  Template.videosSharingTemplate.destroyed = function() {
    $window.unbind('resize', onResize);
  }
})();

// Set Template Helpers
Template.videosSharingTemplate.helpers({
  rightTo: function(right, playlist, myUser, video){
    if(right === "isOwner") return playlists.isOwner(playlist, myUser);
    if(right === "canAccess") return playlists.canAccess(playlist, myUser);
    if(right === "canAddVideo") return playlists.canAddVideo(playlist, myUser);
    if(right === "canRemoveVideo") return playlists.canRemoveVideo(playlist, video, myUser);
    return false;
  }
, privateTo: function(type){
    return type === this.privacy;
  }
});
Template.videosSharingTemplate.previewVideos = function() {
  if(!Session.get('playlist')) return [];
  var pl = Session.get('playlist');
  if (!pl) return [];
  return videos.find({playlist:pl}, {limit:4});
};
Template.videosSharingTemplate.playlist = function() {
  if(!Session.get('playlist')) return {};
  var pl = playlists.findOne({_id:Session.get('playlist')});
  if(pl) pl.followers = _.shuffle(pl.followers || []);
  return pl || {};
};
Template.videosSharingTemplate.playlistUrl = function() {
  if(!Session.get('playlist')) return {};
  var pl = playlists.findOne({_id:Session.get('playlist')})
    , url = ''
    ;
  if(pl && pl._id) url = Meteor.absoluteUrl('playlist/'+pl._id);
  return url;
};
Template.videosSharingTemplate.playlistEmbedUrl = function() {
  if(!Session.get('playlist')) return {};
  var pl = playlists.findOne({_id:Session.get('playlist')})
    , url = ''
    ;
  if(pl && pl._id) url = Meteor.absoluteUrl('embed/playlist/'+pl._id);
  return url;
};
Template.videosSharingTemplate.myUser = function() {
  var u = Meteor.users.findOne({_id:Meteor.userId()});
  return u || {};
};

Template.videosSharingTemplate.ownerObj = function(uId) {
  return Meteor.users.findOne({_id:uId});
};

Template.videosSharingTemplate.events({
  'click .playlist-remove': function (event, template) {
    $('#remove-playlist-modal')
      .on('shown', function(){
        $('#remove-playlist-submit').focus();
      })
      .modal();
    $('#remove-playlist-submit').attr('playlist', event.currentTarget.getAttribute('playlist'));
    _gaq.push(['_trackEvent', 'playlist', 'remove']);
    return false;
  }
, 'click .set-privacy': function(ev){
    var privacy = event.currentTarget.getAttribute('data-privacy');
    Meteor.call('setPrivacy', Session.get('playlist'), privacy);
    _gaq.push(['_trackEvent', 'playlist', 'privacy', privacy]);
    ev.preventDefault();
  }
, 'click .set-public': function(ev){
    var public = event.currentTarget.getAttribute('data-public') === 'public';
    Meteor.call('setPublic', Session.get('playlist'), public);
    _gaq.push(['_trackEvent', 'playlist', 'public', public]);
    ev.preventDefault();
  }
, 'click .sharing-button': function(event){
    var $target=$(event.currentTarget)
      , typeSharing = $target.attr('data-type-sharing')
      , width=$target.attr('data-width')
      , height=$target.attr('data-height')
      , u=$target.attr('data-url')
      , t=$target.attr('data-title')
      , leftPosition = (window.screen.width / 2) - ((width / 2) + 10)   //Allow for borders.
      , topPosition = (window.screen.height / 2) - ((height / 2) + 50)  //Allow for title and status bars.
      , url
      ;
    switch(typeSharing){
      case 'facebook':
        url = 'http://www.facebook.com/sharer.php?u='+encodeURIComponent(u)+'&t='+encodeURIComponent(t);
        break;
      case 'twitter':
        url = 'https://twitter.com/intent/tweet?original_referer='+encodeURIComponent(u)+'&text='+encodeURIComponent(t)+'&tw_p=tweetbutton&url='+encodeURIComponent(u)+'&via=26plays';
        break;
      case 'google':
        url = 'https://plus.google.com/share?url='+encodeURIComponent(u);
        break;
      case 'email':
        url = 'mailto:?subject='+encodeURIComponent(t)+'&body='+encodeURIComponent(u);
        break;
      case 'embed':
        $('#embed-url-modal')
          .on('shown', function(){
            $('#embed-content').val('<iframe '
                  +'width="560" '
                  +'height="315" '
                  +'src="'+u+'" '
                  +'frameborder="0" '
                  +'webkitallowfullscreen="webkitallowfullscreen" '
                  +'mozallowfullscreen="mozallowfullscreen"'
                  +'msallowfullscreen="msallowfullscreen"'
                  +'oallowfullscreen="oallowfullscreen"'
                  +'allowfullscreen="allowFullscreen" '
                +'></iframe>');
          })
          .modal();
        break;
    }
    if(url){
      window.open(
        url
      , 'sharer'
      , "status=no,height=" + height + ",width=" + width + ",resizable=yes,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no"
      );
      event.preventDefault();
    }
    _gaq.push(['_trackEvent', 'playlist', 'share', typeSharing]);
  }
, 'click .open-user': function (event, template) {
    var $target=$(event.currentTarget);
    usersRouter.openUser($target.attr('data-user-id'));
    return false;
  }
});
