
// init App
var App = App || {};

// init Player
App.player = App.player || {};

// init Player
App.player.youtube = function(playerId, events){
  var youtube = document.getElementById(playerId)
    , that = this
    ;

  that.context = {
    loadPercent:0
  , playPercent:0
  , seconds:0
  , duration:0
  };

  var refresh = function(){
    if(that.player && that.player.getDuration) that.context.duration = that.player.getDuration();
    if(that.player && that.player.getCurrentTime) that.context.seconds = that.player.getCurrentTime();
    if(that.player && that.player.getVideoLoadedFraction) that.context.loadPercent = Math.floor(100*that.player.getVideoLoadedFraction());
    that.context.playPercent = Math.floor(100*that.context.seconds/that.context.duration);
    if(events && events.progress) events.progress(that.context);
  };

  that.getPositionInterval = null;

  that.player = new YT.Player(playerId, {
    "videoId": youtube.getAttribute("providerId"),
    "playerVars": {
      "controls":0
    , "iv_load_policy":3
    , "modestbranding":0
    , "rel":0
    , "showinfo":0
    },
    "events": {
      "onReady": function(){
        that.player.playVideo();
      },
      "onStateChange": function(newState){
        refresh();
        if(newState.data==1){
          Meteor.clearInterval(that.getPositionInterval);
          that.getPositionInterval = Meteor.setInterval(refresh, 1000);
        }
        if(newState.data==0){
          if(events && events.end) events.end();
        }
      }
    }
  });
};
App.player.youtube.prototype = {
  pause: function(){
    this.player.pauseVideo();
  }
, play: function(){
    this.player.playVideo();
  }
, seekTo: function(percent){
    this.player.seekTo(Math.floor(this.player.getDuration()*percent/100), true);
  }
, destroy: function(){
    if(this.player && this.player.stopVideo) this.player.stopVideo();
    this.player.destroy();
    delete this.player;
    Meteor.clearInterval(this.getPositionInterval);
  }
};
