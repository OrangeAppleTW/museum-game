// 對話功能
// scenes =>
//   [{ actor: '玩家', sentence: '你好', beforeScene: function() { $('#player').show(); } } ]
// 
window.startChat = function(scenes, callback) {
    callback = (typeof callback !== 'undefined') ?  callback : function() {};
    var $chatContent = $('.chat-content');
    var timerId = null;
    var sceneIdx = 0;
    var isFinished = false;

    var next = function() {
        // 當對話結束
        if(!timerId && sceneIdx >= scenes.length) {
            if (isFinished) return;
            isFinished = true;
            $('#chat-modal').modal('hide');
            $('body').unbind('keyup');
            $('body').unbind('mouseup');
            callback();
        }
        
        // 當對話進行中，則直接完成文字顯示
        if (timerId !== null) {
            clearTimeout(timerId);
            var scene = scenes[sceneIdx-1];
            if (!scene) {
                timerId = null;
                return;
            }
            var text = scene.actor + "：" + scene.sentence;
            $chatContent.text(text);
            $chatContent.append('&nbsp;<i class="fas fa-caret-down fa-blink"></i>');
            timerId = null;
            return;
        }

        // 開始對話，用 fillWord 營造打字感
        var scene = scenes[sceneIdx];
        if (!scene) return;
        
        // 執行 scene 中 beforeScene function
        var beforeScene = (typeof scene['beforeScene'] !== 'undefined') ?  scene['beforeScene'] : function() {};
        beforeScene();
        
        // 開始 scene
        if (scene.actor) {
            var actor = scene.actor + "：";
            $chatContent.text(actor);
        }
        var wordIdx = 0;
        function fillWord() {
            var word = scene.sentence[wordIdx];
            var currentText = $chatContent.text();
            
            $chatContent.text(currentText + word);
            wordIdx++;
            if (wordIdx < scene.sentence.length) {
                timerId = setTimeout(fillWord, 80 + 50*Math.random());
            } else {
                $chatContent.append('&nbsp;<i class="fas fa-caret-down fa-blink"></i>');
                timerId = null;
            }
        }
        timerId = setTimeout(fillWord, 80+50*Math.random());
        sceneIdx++;
    }

    // 事件綁定
    $('body').keyup(next);
    $('body').mouseup(next);
    $('#chat-modal').modal('show');
    next();
};