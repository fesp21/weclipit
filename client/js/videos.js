/*
 * videos.js
 *
 * Responsible for the fetching of the selected playlist's videos
 *     + the rendering of the videosTemplate
 */

// Set Template Variables
Template.videosTemplate.filterFriends = function(text){
  function replaceDiacritics(s){
    var s;
    var diacritics =[
      /[\300-\306]/g, /[\340-\346]/g,  // A, a
      /[\310-\313]/g, /[\350-\353]/g,  // E, e
      /[\314-\317]/g, /[\354-\357]/g,  // I, i
      /[\322-\330]/g, /[\362-\370]/g,  // O, o
      /[\331-\334]/g, /[\371-\374]/g,  // U, u
      /[\321]/g, /[\361]/g, // N, n
      /[\307]/g, /[\347]/g, // C, c
    ];
    var chars = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];
    for (var i = 0; i < diacritics.length; i++){
      s = s.replace(diacritics[i],chars[i]);
    }
    return s;
  }
  text = replaceDiacritics(text).toLowerCase();
  _.each(Template.videosTemplate.friends, function(friend, index){
    if(text === '' || replaceDiacritics(friend.name).toLowerCase().indexOf(text)!==-1){
      $('#friend-'+index).show();
    } else {
      $('#friend-'+index).hide();
    }
  });
}

// Set Template Events
Template.videosTemplate.events({
  'click #remove-playlist-submit': function (event, template) {
    Meteor.call('removePlaylist', event.currentTarget.getAttribute('playlist'));
    $('#remove-playlist-modal').modal('hide');
    homeRouter.openHome();
  }
, 'keyup #filter-share-users-list': function (event, template) {
    Template.videosTemplate.filterFriends($('#filter-share-users-list').val());
  }
, 'click #share-playlist-select-all': function (event, template) {
    $('.friend-canAccess').prop('checked', true);
    return false;
  }
, 'click #share-playlist-select-none': function (event, template) {
    $('.friend-canAccess').prop('checked', false);
    return false;
  }
, 'click #share-playlist-submit': function (event, template) {
    var changes = [];
    _.each(Template.videosTemplate.friends, function(friend, index){
      if($('#friend-'+index+'-canAccess').is(':checked')!=friend.canAccess){
        changes.push({id:friend.id,status:!friend.canAccess});
      }
    });
    if(changes.length>0) {
      Meteor.call('sharePlaylist', $('#share-playlist-modal').attr('playlist'), changes);
    }
    $('#share-playlist-modal').modal('hide');
  }
, 'click .friendToogle': function (event, template) {
    var index = $(event.currentTarget).attr('data-index')
      , $checkbox = $('#friend-'+index+'-canAccess')
      ;
    $checkbox.prop('checked', !$checkbox.is(':checked'));
    return false;
  }
, 'submit #search-video-modal form': function (event, template) {
    var query = $('#search-video-query').val();
    $('#search-video-result').html('Loading');
    Meteor.call('searchYoutubeVideos', query, function(err, videosYoutube){
      var result = '';
      for(var i=0,l=videosYoutube.length;i<l;i++){
        var url = videosYoutube[i].link[0].href.replace('&feature=youtube_gdata', '')
          , id = url.replace('https://www.youtube.com/watch?v=', '')
          , inPlaylist = !!videos.findOne({'provider':'youtube','providerId':id})
          ;
        result += '<tr class="video not-playing '+(inPlaylist?'video-added':'video-to-add')+'" data-url="'+url+'">'
                + '  <td class="videos-preview"><div class="img-container"><img src="'+videosYoutube[i].media$group.media$thumbnail[0].url+'" /></div></td>'
                + '  <td class="videos-description">'
                + '    <div class="video-description-title">'+videosYoutube[i].title.$t+'</div>'
                + '  </td>'
                + '</tr>'
                ;
      }
      result = '<table class="table table-condensed videos-list"><tbody>'+result+'</tbody></table>';
      $('#search-video-result').html(result);
    });
    $('#search-video-query').focus();
    return false;
  }
, 'click .video-to-add': function(event, template){
    var $el = $(event.currentTarget);
    $el
      .removeClass('video-to-add')
      .addClass('video-added')
      ;
    Meteor.call('addVideo', Session.get('playlist'), $el.attr('data-url'));
  }
, 'submit #add-video-modal form': function (event, template) {
    Meteor.call('addVideo', Session.get('playlist'), $('#add-video-url').val(), function(){
      $('#add-video-modal').modal('hide');
    });
    return false;
  }
, 'click #remove-video-submit': function (event, template) {
    Meteor.call('removeVideo', event.currentTarget.getAttribute('video'));
    $('#remove-video-modal').modal('hide');
  }
});

// Create a router for playlists
var VideosRouter = Backbone.Router.extend({
  routes: {
    "playlist/:playlist/video/:video": "openVideo"
  },
  openVideo: function (playlist, video) {
    this.setVideo(playlist, video);
    Session.set('page', 'playlist');
    Session.set("playing", {video:video,playlist:playlist,date:(new Date()).getTime()});
    if(!Session.set("playlist")){
      Session.set("playlist", playlist);
    }
  },
  setVideo: function (playlist, video) {
    this.navigate('playlist/'+playlist+'/video/'+video, true);
  }
});

// instantiate router
var videosRouter = new VideosRouter;
