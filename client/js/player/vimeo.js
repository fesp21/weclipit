
// init Player
Meteor.player = Meteor.player || {};

// init Player
Meteor.player.vimeo = function(playerContainer, video, events){
  var playerId = 'vimeo-player'
  $('#'+playerContainer).html('<iframe id="'+playerId+'" src="http://player.vimeo.com/video/'+video.providerId+'?api=1&title=0&byline=0&portrait=0&player_id=vimeo-player" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
  var vimeo = document.getElementById(playerId)
    , that = this
    ;
  that.player = $f(vimeo);
  that.player.addEvent('ready', function() {
    that.context = {
      loadPercent:0
    , playPercent:0
    , seconds:0
    , duration:0
    };
    
    // attach events
    // end of video
    if(events && events.end) {
      that.player.addEvent('finish', function(){
        events.end();
      });
    }
    if(events && events.pause) {
      that.player.addEvent('pause', function(){
        events.pause();
      });
    }
    if(events && events.play) {
      that.player.addEvent('play', function(){
        events.play();
      });
    }
    that.player.addEvent('loadProgress', function(obj){
      that.context.loadPercent = Math.floor(100*obj.percent)
      if(events && events.progress) events.progress(that.context);
    });
    that.player.addEvent('playProgress', function(obj){
      that.context.playPercent = Math.floor(100*obj.percent)
      that.context.seconds = obj.seconds;
      that.context.duration = obj.duration;
      if(events && events.progress) events.progress(that.context);
    });

    if(events && events.ready) events.ready();
  });
};
Meteor.player.vimeo.prototype = {
  pause: function(){
    if(this && this.player && this.player.api) this.player.api("pause");
  }
, play: function(){
    if(this && this.player && this.player.api) this.player.api("play");
  }
, seekTo: function(percent){
    if(this && this.player && this.player.api) this.player.api('seekTo', this.context.duration*percent/100);
  }
, destroy: function(){
    delete this.player;
  }
};

