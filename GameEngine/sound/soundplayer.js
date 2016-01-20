/**
 * A music and sound effect player
 * @namespace GameEngine
 * @class SoundPlayer
 */
GameEngine.SoundPlayer = GameEngine.Object.extend({
  _audioContext: null,
  _audioInfo: null,
  _currentAudioInfo: null,
  
  init: function() {
    // Create an audio context if possible
    this._audioContext = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
    this._audioInfo = {};
    this._currentAudioInfo = [];
  },
   
   // MOVE FROM HERE NOW!!!
   /**
    * @method playEmptySound
    * @param completion Send after playing, with a boolean as param that indicates the sound did play
    */
    playEmptySound: function(completion) {
      // Create empty buffer and play it
      var myContext = this._audioContext;
      var buffer = myContext.createBuffer(1, 1, 22050);
      var source = myContext.createBufferSource();
      source.buffer = buffer;
      source.connect(myContext.destination);
      source.start(0);
      setTimeout(function() {
        if (completion) {
          completion((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE));
        }
      }.bind(this), 0);
    },
    
    playEffect: function(soundURL, completion) {
      this._playSound(soundURL, "_effect", false, completion);
    },
    
    stopAllEffects: function() {
      this._stopSound("_effect");
    },
    
    playSound: function(soundURL, repeat, completion) {
      this._playSound(soundURL, null, repeat, completion);
    },
    
    _playSound: function(soundURL, key, repeat, completion) {
      var audioContext = this._audioContext;
      if (audioContext) {
        var source = audioContext.createBufferSource();
        if (key) {
          if (!this._audioInfo[key]) {
            this._audioInfo[key] = [];
          }
          
          this._audioInfo[key].push(source);
        }
        else {
          this._currentAudioInfo.push(source);
        }
        
        var request = new XMLHttpRequest();
        request.open('GET', soundURL, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            audioContext.decodeAudioData(request.response,
            function(buffer) {
              source.buffer = buffer;
              source.connect(audioContext.destination);
              source.start(0);
              source.loop = repeat;
              
              if (!repeat && completion) {
                setTimeout(completion, buffer.duration * 1000.0);
              }
            },
            function () {
              console.error('decodeAudioData failed.');
            }
          );
        };
        request.send();
        this.audioContext = audioContext;
      }
      else {
        var audio = new Audio();
        audio.src = soundURL;
        audio.loop = repeat;
        audio.play();
        
        if (key) {
          this._audioInfo[key] = audio;
        }
        else {
          this._currentAudioInfo.push(audio);
        }
        
        audio.addEventListener('loadedmetadata', function() {
          if (completion) {
            setTimeout(completion, audio.duration * 1000.0);
          }
        });
      }
    },
    
    stopSound: function() {
      this._stopSound(null);
    },
    
    _stopSound: function(key) {
      if (this._audioContext) {
        var audioSources;
        if (key) {
          audioSources = this._audioInfo[key];
          this._audioInfo[key] = null;
        }
        else {
          audioSources = this._currentAudioInfo;
          this._currentAudioInfo = null;
        }
        
        if (audioSources) {
          for (var i = 0; i < audioSources.length; i ++) {
            var audioSource = audioSources[i];
//          audioSources.forEach(function(audioSource) {
            if (audioSource) {
              audioSource.stop(0);
            }
//          });
          }
        }
      }
      else {
        var audioElements;
        if (key) {
          audioElements = this._audioInfo[key];
          this._audioInfo[key] = null;
        }
        else {
          audioElements = this._currentAudioInfo;
          this._currentAudioInfo = null;
        }
        
        if (audioElements) {
          for (var i = 0; i < audioElements.length; i ++) {
            var audio = audioElements[i];
//          audioElements.forEach(function(audio) {
            audio.pause();
//          });
          }
        }
      }
    }
});
GameEngine.sharedSoundPlayer = new GameEngine.SoundPlayer();