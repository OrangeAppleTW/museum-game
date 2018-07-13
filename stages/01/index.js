// init phaser game
(function() {
    // 每一步執行時間 (ms)
    var STEP_TIME = 500;
    // 每個 TILE (正方形)的大小
    var TILT_SIZE = 100;
    // 預設玩家位置
    var DEFAULT_PLAYER = { x: 5.5 * TILT_SIZE, y: 1.5 * TILT_SIZE };

    // 動態調整 Phaser 遊戲大小
    // 當 window resize 時，讓 canvas scale 
    // 預設遊戲畫面為 1:1
    //
    function addResizeEvent (width, canvas) {
        var $phaserArea = $('#phaser-area');
        var $phaserCanvas = $(canvas);

        var onresize = function() {
            var containerWidth = $phaserArea.width();
            var ratio = containerWidth / width;

            $phaserCanvas.css('transform', 'scale('+ratio+')');
            $phaserCanvas.show();
        };
        window.addEventListener('resize', onresize, false);
        onresize();
        $phaserCanvas.addClass('show');
    }

    // Export phaser to global
    window.GAME = {
        player: {}, // 玩家角色方法
    };

    var game = new Phaser.Game(1000, 1000, Phaser.AUTO, 'phaser-area', { preload: preload, create: create, update: update, render: render });

    // 玩家角色
    var player;
    
    // 邊界區塊
    var bounds = [];

    var resetSignal = new Phaser.Signal();

    function preload() {
        game.load.image('background-image', '../../images/01-bg.jpg');
        game.load.spritesheet('player-1', '../../images/player-1.png', 125, 216, 12);

    }

    // 加入地圖限制
    function addBound(startColumn, startRow, columnSpan, rowSpan) {
        var x = startColumn * TILT_SIZE;
        var y = startRow * TILT_SIZE;
        var width = columnSpan * TILT_SIZE;
        var height = rowSpan * TILT_SIZE;

        var bound = game.add.sprite(x, y, null);
        game.physics.enable(bound, Phaser.Physics.ARCADE);
        bound.body.setSize(width, height, 0, 0); // set the size of the rectangle
        bound.body.immovable = true;
        bounds.push(bound);
    }
    
    function create() {
        // 加入 resize event
        addResizeEvent(this.game.width, this.game.canvas);
        
        // 避免 lost focus 自動暫停遊戲
        game.stage.disableVisibilityChange = true;
        
        // 背景
        tileSprite = game.add.tileSprite(0, 0, 1000, 1000, 'background-image');

        // 建立玩家角色
        player = game.add.sprite(DEFAULT_PLAYER.x, DEFAULT_PLAYER.y, 'player-1');

        // 建立角色動畫
        player.animations.add('walk-down', [0,1,2]);
        player.animations.add('walk-left', [3,4,5]);
        player.animations.add('walk-up', [6,7,8]);
        player.animations.add('walk-right', [9,10,11]);


        player.scale.setTo(TILT_SIZE / player.width);
        player.anchor.x = 0.5;
        player.anchor.y = 0.85;

        // 設定碰撞
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.setSize(TILT_SIZE, TILT_SIZE, 12.5, 132.5);
        player.body.collideWorldBounds = true;

        // 設定地圖邊界
        addBound(7, 0 , 3, 10);
        addBound(0, 0, 3, 8);
        addBound(0, 8, 2, 1);
        addBound(3, 0, 1, 3);
        addBound(4, 1, 1, 2);
        addBound(3, 4, 1, 2);
        addBound(4, 4, 1, 1);
        addBound(6, 5, 1, 1);
    }

    function update() { 
        // 限制角色不能超過邊界
        game.physics.arcade.collide(player, bounds);
    }

    function render() {

        // Sprite debug info
        game.debug.spriteInfo(player, 32, 32);

        for(var i =0 ; i<bounds.length;i++) {
            game.debug.body(bounds[i]);
        }
        game.debug.body(player);
    }

    window.GAME.reset = function () {
        resetSignal.dispatch();

        player.x = DEFAULT_PLAYER.x;
        player.y = DEFAULT_PLAYER.y;
        player.frame = 0;
    }

    window.GAME.highlightBlock = function(blockId) {
        return new Promise(function(resolve, reject){            
            var timerId = null;
            resetSignal.addOnce(function () {
                reject(false);
                clearTimeout(timerId);
            }, this);
            
            timerId = setTimeout(function() {
                BLOCKLY_WORKSPACE.highlightBlock(blockId);
                resolve(true);
            }, 200);
        });
    }

    window.GAME.player.stepForward = function() {
        return new Promise(function(resolve, reject){   
            var yOffset = 0;
            var xOffset = 0;
            var animationName = null;

            // 0, 3, 6, 9
            // 下, 左, 上, 右
            if(player.frame === 0) {
                animationName = 'walk-down';
                yOffset = 100
            } else if(player.frame === 3) {
                animationName = 'walk-left';
                xOffset = -100
            } else if(player.frame === 6) {
                animationName = 'walk-up';
                yOffset = -100
            } else if(player.frame === 9) {
                animationName = 'walk-right';
                xOffset = 100
            }
        
            game.physics.arcade.moveToXY(player, player.x + xOffset, player.y + yOffset, 1, STEP_TIME);
            game.time.events.add(STEP_TIME, function () {
                player.body.velocity.x = 0;
                player.body.velocity.y = 0;
                
                // 調整為最近的格子 x, y
                player.x = Math.floor(player.x / TILT_SIZE) * TILT_SIZE + TILT_SIZE / 2;
                player.y = Math.floor(player.y / TILT_SIZE) * TILT_SIZE + TILT_SIZE / 2;

                player.animations.stop();
                player.frame = (Math.floor(player.frame / 3) * 3); // 回到該方向第一張圖
                resolve(true);
             }, this);

            resetSignal.addOnce(function () {
                player.body.velocity.x = 0;
                player.body.velocity.y = 0;
                player.animations.stop();

                reject(false);
            }, this);

            player.animations.play(animationName, 10, true);
        });
    };

    window.GAME.player.turn = function (direction) {
        return new Promise(function(resolve, reject){    
            // 0, 3, 6, 9
            // 下, 左, 上, 右
            if(direction === 'left') {
                player.frame = ((player.frame - 3) + 12) % 12;
            } else if (direction === 'right') {
                player.frame = ((player.frame + 3) + 12) % 12;   
            }

            resolve(true);
        });
    }
})();
