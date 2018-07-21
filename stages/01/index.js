// Define global variable
window.GAME = {
    player: {}
};

window.GAME.initialize = function() {
    var STEP_TIME = 500; // 每步執行時間 (ms)
    var TILT_SIZE = 100; // 每個 TILE (正方形)的大小

    // 預設玩家位置
    var DEFAULT_PLAYER = { x: 5.5 * TILT_SIZE, y: 7.5 * TILT_SIZE, frame: 6 };

    // 選擇的角色
    var SELECTED_CHARACTER = localStorage.getItem('selectedCharacter') || 'child-a';

    // 動態調整 Phaser 遊戲大小
    // 當 window resize 時，讓 canvas scale 
    // 預設遊戲畫面為 1:1
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

    // create game
    var game = new Phaser.Game(1000, 1000, Phaser.AUTO, 'phaser-area', { preload: preload, create: create, update: update });

    // layers
    var backgroundLayer;
    var middleLayer;
    var frontLayer;

    var player; // 玩家角色
    var npc; // 史前人
    var bounds = []; // 邊界
    var grasses = []; // 草叢
    var resetSignal = new Phaser.Signal(); // 重設遊戲 event

    // 任務條件
    var isGreeting = false;


    // 計算兩個 sprite 間距離（單位 px)
    function calcDistance(sprite1, spirte2) {
        return Math.sqrt(Math.pow(sprite1.x - spirte2.x, 2) + Math.pow(sprite1.y - spirte2.y, 2));
    }

    // 加入地圖限制區域
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
    function addGrass(startRow, startColumn, rowSpan, columnSpan) {
        for(var rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
            for(var columnOffset = 0; columnOffset < columnSpan; columnOffset++) {
                var y = (startRow + rowOffset) * TILT_SIZE;
                var x = (startColumn + columnOffset) * TILT_SIZE;
                var grass = backgroundLayer.create(x, y, 'grass');

                grass.scale.setTo(TILT_SIZE / grass.width);
                grasses.push(grass);
            }
        }
    }

    // 建立玩家角色
    function createPlayer() {
        player = middleLayer.create(DEFAULT_PLAYER.x, DEFAULT_PLAYER.y, 'player');
        player.scale.setTo(TILT_SIZE / player.width);
        player.frame = DEFAULT_PLAYER.frame;
        player.anchor.x = 0.5;
        player.anchor.y = 0.85;
        
        // 動畫
        player.animations.add('walk-down', [0,1,2]);
        player.animations.add('walk-left', [3,4,5]);
        player.animations.add('walk-up', [6,7,8]);
        player.animations.add('walk-right', [9,10,11]);
        
        // 碰撞
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.setSize(TILT_SIZE, TILT_SIZE, 12.5, 132.5);
        player.body.collideWorldBounds = true;
    }

    // 建立 npc 角色
    function createNPC() {
        npc = backgroundLayer.create(5.5*TILT_SIZE, 4.5*TILT_SIZE, 'npc-1')
        npc.scale.setTo(TILT_SIZE / npc.width);
        npc.anchor.x = 0.5;
        npc.anchor.y = 0.85;
        
        // enable 碰撞
        game.physics.enable(npc, Phaser.Physics.ARCADE);
        npc.body.setSize(2.4*TILT_SIZE, 2.4*TILT_SIZE, 15, 340);
        npc.body.immovable = true;
    }

    // 預先載入素材
    function preload() {
        game.load.image('background-image', '../../images/01-bg.jpg');
        game.load.image('grass', '../../images/grass.png');
        
        // 0, 3, 6, 9
        // 下, 左, 上, 右
        game.load.spritesheet('player', '../../images/'+SELECTED_CHARACTER+'-spritesheet.png', 125, 216, 12);
        game.load.image('npc-1', '../../images/npc-1.png');
    }

    // 當遊戲建立時
    function create() {
        addResizeEvent(this.game.width, this.game.canvas);

        // layers
        backgroundLayer = game.add.group();
        middleLayer = game.add.group();
        frontLayer = game.add.group();

        // 遊戲背景
        backgroundLayer.create(0, 0, 'background-image');

        // 建立玩家角色
        createPlayer();

        // 建立 NPC 角色
        createNPC();

        // 設定地圖邊界
        addBound(0, 7, 10, 3);
        addBound(0, 0, 8, 3);
        addBound(5, 6, 1, 1)
        addBound(8, 0, 2, 2);
        addBound(0, 3, 6, 1);
        addBound(1, 4, 2, 1);

        // 加入草叢
        addGrass(6, 3, 4, 4);
    }

    // 當畫面更新時
    function update() { 
        // 限制角色不能超過邊界
        game.physics.arcade.collide(player, bounds);

        // 限制角色不能撞上 npc
        game.physics.arcade.collide(player, npc);

        // 調整草的階層
        for(var i=0; i < grasses.length; i++) {
            var grass = grasses[i];
            var isSameTilt = Math.floor(grass.x/TILT_SIZE) === Math.floor(player.x/TILT_SIZE) && 
                Math.floor(grass.y/TILT_SIZE) === Math.floor(player.y/TILT_SIZE);
            
            if (isSameTilt) { // 把角色底下的草移上來
                grass.parent.remove(grass);
                frontLayer.add(grass);
            } else if (!backgroundLayer.contains(grass)) { // 設定其他地方的草到背景
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

        // game.debug.spriteInfo(player, 32, 32);
        // for(var i=0; i < bounds.length; i++) {
        //     game.debug.body(bounds[i]);
        // }
        // game.debug.body(player);
        // game.debug.body(npc);
    }

    // 重設遊戲狀態
    window.GAME.reset = function () {
        resetSignal.dispatch();
        
        isGreeting = false;

        player.x = DEFAULT_PLAYER.x;
        player.y = DEFAULT_PLAYER.y;
        player.frame = DEFAULT_PLAYER.frame;
    }

    // 驗證關卡是否完成
    window.GAME.validate = function() {
        if(isGreeting) {
            console.log('任務完成！');
        } else {
            console.log('任務失敗。');
        }
    }

    // 定義玩家角色方法
    window.GAME.player.stepForward = function(done) {
        var yOffset = 0;
        var xOffset = 0;
        var animationName = null;

        if(player.frame === 0) {
            animationName = 'walk-down';
            yOffset = 100;
        } else if(player.frame === 3) {
            animationName = 'walk-left';
            xOffset = -100;
        } else if(player.frame === 6) {
            animationName = 'walk-up';
            yOffset = -100;
        } else if(player.frame === 9) {
            animationName = 'walk-right';
            xOffset = 100;
        }
    
        // 將 spirte 用 STEP_TIME 時間移動到 x, y 位置
        // 到定點時需要加個 event 讓他停下來
        game.physics.arcade.moveToXY(player, player.x + xOffset, player.y + yOffset, 1, STEP_TIME);
        game.time.events.add(STEP_TIME, function () {
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            player.animations.stop();
            player.frame = (Math.floor(player.frame / 3) * 3); // 回到該方向第一張圖

            // 調整為最近的格子 x, y
            player.x = Math.floor(player.x / TILT_SIZE) * TILT_SIZE + TILT_SIZE / 2;
            player.y = Math.floor(player.y / TILT_SIZE) * TILT_SIZE + TILT_SIZE / 2;
            
            done();
        }, this);

        // 接收到重設 event 時直接停止
        resetSignal.addOnce(function () {
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            player.animations.stop();
        }, this);

        player.animations.play(animationName, 10, true);
    };
    window.GAME.player.turn = function (direction, done) {
        if(direction === 'left') {
            player.frame = ((player.frame - 3) + 12) % 12;
        } else if (direction === 'right') {
            player.frame = ((player.frame + 3) + 12) % 12;   
        }

        setTimeout(done, STEP_TIME);
    }
    window.GAME.player.sayHi = function (done) {
        if (calcDistance(player, npc) === 100.0) {
            var scenes = [  { actor: '現代人', sentence: '你好，我是阿明！' } ];
            isGreeting = true;

            window.startChat(scenes, done);
        } else {
            $('.hint-content > p').text('請先走到原始人旁邊，再向他打招呼哦！');
        }
    }
};