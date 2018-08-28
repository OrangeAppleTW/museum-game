(function(){
    var paths = ['../../audios/Accralate.mp3', '../../audios/SlowHeat.mp3', '../../audios/WhimsyGroove.mp3'];
    var sound      = document.createElement('audio');
    sound.src      = paths[Math.floor(Math.random()*paths.length)];
    sound.type     = 'audio/mp3';
    sound.autoplay = true;
    sound.loop = true;
    sound.style.display = 'none';
    document.body.appendChild(sound);
})();