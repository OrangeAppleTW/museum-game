// init phaser game
(function() {
    // 每一步執行時間 (ms)
    var STEP_TIME = 500;
    
    // 每個 TILE (正方形)的大小
    var TILT_SIZE = 100;

    // 預設玩家位置
    var DEFAULT_PLAYER = { x: 4.5 * TILT_SIZE, y: 8.5 * TILT_SIZE, frame: 6 };

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

    // 利用 group 產生 layer 效果
    var backgroundLayer;
    var middleLayer;
    var frontLayer;

    // 玩家角色
    var player;

    // 史前人
    var npc;
    
    // 邊界區塊
    var bounds = [];

    // 草叢
    var grasses = [];

    // 重設遊戲 event
    var resetSignal = new Phaser.Signal();

    // 加入地圖限制
    function addBound(startRow, startColumn,rowSpan, columnSpan) {
        var y = startRow * TILT_SIZE;
        var x = startColumn * TILT_SIZE;
        var height = rowSpan * TILT_SIZE;
        var width = columnSpan * TILT_SIZE;

        var bound = game.add.sprite(x, y, null);
        game.physics.enable(bound, Phaser.Physics.ARCADE);
        bound.body.setSize(width, height, 0, 0); // set the size of the rectangle
        bound.body.immovable = true;
        bounds.push(bound);
    }

    // 加入草叢
    function addGrass(layer, startRow, startColumn, rowSpan, columnSpan) {
        for(var rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
            for(var columnOffset = 0; columnOffset < columnSpan; columnOffset++) {
                var y = (startRow + rowOffset) * TILT_SIZE;
                var x = (startColumn + columnOffset) * TILT_SIZE;
                var grass = layer.create(x, y, 'grass');

                grass.scale.setTo(TILT_SIZE / grass.width);
                grasses.push(grass);
            }
        }
    }

    // 兩個 sprite 是否在同一格
    function isSameTilt(sprite1, sprite2) {
        return Math.floor(sprite1.x/TILT_SIZE) === Math.floor(sprite2.x/TILT_SIZE) && 
                Math.floor(sprite1.y/TILT_SIZE) === Math.floor(sprite2.y/TILT_SIZE);
    }

    function preload() {
        game.load.image('background-image', '../../images/01-bg.jpg');
        game.load.image('grass', '../../images/grass.png');
        
        // 0, 3, 6, 9
        // 下, 左, 上, 右
        game.load.spritesheet('player-1', '../../images/player-1.png', 125, 216, 12);
        game.load.image('npc-1', '../../images/npc-1.png');
    }

    function create() {
        // 加入 resize event
        addResizeEvent(this.game.width, this.game.canvas);

        // 利用 group 產生 layer 效果
        backgroundLayer = game.add.group();
        middleLayer = game.add.group();
        frontLayer = game.add.group();

        // 避免 lost focus 自動暫停遊戲
        game.stage.disableVisibilityChange = true;
        
        // 背景
        tileSprite = backgroundLayer.create(0, 0, 'background-image');

        // 建立玩家角色
        player = middleLayer.create(DEFAULT_PLAYER.x, DEFAULT_PLAYER.y, 'player-1');
        player.scale.setTo(TILT_SIZE / player.width);
        player.frame = DEFAULT_PLAYER.frame;
        player.anchor.x = 0.5;
        player.anchor.y = 0.85;
        // 建立角色動畫
        player.animations.add('walk-down', [0,1,2]);
        player.animations.add('walk-left', [3,4,5]);
        player.animations.add('walk-up', [6,7,8]);
        player.animations.add('walk-right', [9,10,11]);
        // 設定碰撞
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.setSize(TILT_SIZE, TILT_SIZE, 12.5, 132.5);
        player.body.collideWorldBounds = true;

        npc = backgroundLayer.create(5.5*TILT_SIZE, 4.5*TILT_SIZE, 'npc-1')
        npc.scale.setTo(TILT_SIZE / npc.width);
        npc.anchor.x = 0.5;
        npc.anchor.y = 0.85;

        // 設定碰撞
        game.physics.enable(npc, Phaser.Physics.ARCADE);
        npc.body.setSize(2.4*TILT_SIZE, 2.4*TILT_SIZE, 15, 340);
        npc.body.immovable = true;

        // 設定地圖邊界
        addBound(0, 7, 10, 3);
        addBound(0, 0, 8, 3);
        addBound(5, 6, 1, 1)
        addBound(8, 0, 2, 2);
        addBound(0, 3, 6, 1);
        addBound(1, 4, 2, 1);

        addGrass(backgroundLayer, 6, 3, 4, 4);
    }

    function update() { 
        // 限制角色不能超過邊界
        game.physics.arcade.collide(player, bounds);
        // 限制角色不能撞上 npc
        game.physics.arcade.collide(player, npc);

        // 調整草的階層
        for(var i=0; i < grasses.length; i++) {
            var grass = grasses[i];
            if (isSameTilt(player, grass)) { // 把角色底下的草移上來
                grass.parent.remove(grass);
                frontLayer.add(grass);
            } else if (!backgroundLayer.contains(grass)) { // 設定其他地方的草為背景
                grass.parent.remove(grass);
                backgroundLayer.add(grass);
            }
        }

        // 調整npc的階層
        if (player.y < npc.y) {
            npc.parent.remove(npc);
            frontLayer.add(npc);
        } else {
            npc.parent.remove(npc);
            backgroundLayer.add(npc);
        }
    }

    function render() {

        // Sprite debug info
        game.debug.spriteInfo(player, 32, 32);

        for(var i =0 ; i<bounds.length;i++) {
            game.debug.body(bounds[i]);
        }
        game.debug.body(player);
        game.debug.body(npc);

    }

    window.GAME.reset = function () {
        resetSignal.dispatch();

        player.x = DEFAULT_PLAYER.x;
        player.y = DEFAULT_PLAYER.y;
        player.frame = DEFAULT_PLAYER.frame;
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
            if(direction === 'left') {
                player.frame = ((player.frame - 3) + 12) % 12;
            } else if (direction === 'right') {
                player.frame = ((player.frame + 3) + 12) % 12;   
            }

            resolve(true);
        });
    }
})();
