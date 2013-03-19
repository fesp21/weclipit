
// init App
var App = App || {};

// init Player
App.player = App.player || {};

// init Player
App.player.vimeo = function(playerId, events){
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
    that.player.addEvent('finish', function(){
      if(events && events.end) {
        events.end();
      }
    });
    that.player.addEvent('pause', function(){
      if(events && events.pause) {
        events.pause();
      }
    });
    that.player.addEvent('play', function(){
      if(events && events.play) {
        events.play();
      }
    });
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
App.player.vimeo.prototype = {
  pause: function(){
    this.player.api("pause");
  }
, play: function(){
    this.player.api("play");
  }
, seekTo: function(percent){
    this.player.api('seekTo', this.context.duration*percent/100);
  }
, destroy: function(){
    delete this.player;
  }
};

