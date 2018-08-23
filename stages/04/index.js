// Define global variable
window.GAME = {
    player: {}
};

window.GAME.initialize = function() {
    var STEP_TIME = 500; // 每步執行時間 (ms)
    var TILT_SIZE = 100; // 每個 TILE (正方形)的大小

    // 預設玩家位置
    var DEFAULT_PLAYER = { x: 5.5 * TILT_SIZE, y: 1.5 * TILT_SIZE, faceTo: 'down' };

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
    var bounds = []; // 邊界
    var resetSignal = new Phaser.Signal(); // 重設遊戲 event

    // 計算兩個 sprite 間距離（單位 px)
    function calcDistance(sprite1, spirte2) {
        return Math.sqrt(Math.pow(sprite1.x - spirte2.x, 2) + Math.pow(sprite1.y - spirte2.y, 2));
    }

    // 變更角色面朝方向
    // 0, 3, 6, 9
    // 下, 左, 上, 右
    function changePlayerFaceTo(direction) {
        if (direction === 'down') {
            player.frame = 0;
            player.faceTo = 'down';
        } else if (direction === 'left') {
            player.frame = 3;
            player.faceTo = 'left';
        } else if (direction === 'up') {
            player.frame = 6;
            player.faceTo = 'up';
        } else if (direction === 'right') {
            player.frame = 9;
            player.faceTo = 'right';
        }
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

    // 建立玩家角色
    function createPlayer() {
        player = middleLayer.create(DEFAULT_PLAYER.x, DEFAULT_PLAYER.y, 'player');
        player.scale.setTo(TILT_SIZE / player.width);
        player.frame = DEFAULT_PLAYER.frame;
        player.anchor.x = 0.5;
        player.anchor.y = 0.85;
        player.faceTo = DEFAULT_PLAYER.faceTo;
        
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
    // 預先載入素材
    function preload() {
        game.load.image('map', '../../images/stages/04/map.jpg');
        
        // 0, 3, 6, 9, 12, 13, 14, 15
        // 下, 左, 上, 右, 蹲下(下), 蹲下(左), 蹲下(上), 蹲下(右)
        game.load.spritesheet('player', '../../images/'+SELECTED_CHARACTER+'-spritesheet.png', 125, 216, 16);
    }

    // 當遊戲建立時
    function create() {
        addResizeEvent(this.game.width, this.game.canvas);

        // layers
        backgroundLayer = game.add.group();
        middleLayer = game.add.group();
        frontLayer = game.add.group();

        // 遊戲背景
        backgroundLayer.create(0, 0, 'map');

        // 建立玩家角色
        createPlayer();

        // 設定地圖邊界
        addBound(0, 2, 1, 1);
        addBound(2, 0, 1, 1);
        addBound(9, 0, 1, 3);
        addBound(0, 3, 2, 2);
        addBound(0, 5, 1, 1);
        addBound(0, 6, 2, 2);
        addBound(0, 9, 1, 1);
        addBound(4, 4, 1, 2);
        addBound(4, 9, 1, 1);
        addBound(6, 6, 1, 2);
        addBound(8, 8, 1, 2);
        // addBound(0, 0, 8, 3);
        // addBound(5, 6, 1, 1)
        // addBound(8, 0, 2, 2);
        // addBound(0, 3, 6, 1);
        // addBound(1, 4, 2, 1);
    }

    // 當畫面更新時
    function update() { 
        // 限制角色不能超過邊界
        game.physics.arcade.collide(player, bounds);

        // game.debug.spriteInfo(player, 32, 32);
        // for(var i=0; i < bounds.length; i++) {
        //     game.debug.body(bounds[i]);
        // }
        // game.debug.body(player);
    }

    // 重設遊戲狀態
    window.GAME.reset = function () {
        resetSignal.dispatch();
        
        player.x = DEFAULT_PLAYER.x;
        player.y = DEFAULT_PLAYER.y;
        changePlayerFaceTo(DEFAULT_PLAYER.faceTo);
    }

    // 驗證關卡是否完成
    window.GAME.validate = function() {
        var $alertModal = $('#alert-modal');
        if(true) {
            $alertModal.find('.content').text('完成第四關，恭喜！');
            $alertModal.find('.next-stage').show();
            $alertModal.modal('show');
        } else {
            $alertModal.find('.content').text('任務失敗');
            $alertModal.modal('show');
        }
    }

    // 定義玩家角色方法
    window.GAME.player.stepForward = function(done) {
        var yOffset = 0;
        var xOffset = 0;
        var animationName = null;

        if(player.faceTo === 'down') {
            animationName = 'walk-down';
            yOffset = 100;
        } else if(player.faceTo === 'left') {
            animationName = 'walk-left';
            xOffset = -100;
        } else if(player.faceTo === 'up') {
            animationName = 'walk-up';
            yOffset = -100;
        } else if(player.faceTo === 'right') {
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

            // 移動至距離最近的的格子中心座標
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
    window.GAME.player.turn = function (side, done) {
        var directions = ['left', 'up', 'right', 'down'];
        var currentIdx = directions.indexOf(player.faceTo);
        if(side === 'left') {
            var newDirectionIdx = (4 + currentIdx - 1) % directions.length;
            changePlayerFaceTo(directions[newDirectionIdx]);
        } else if (side === 'right') {
            var newDirectionIdx = (4 + currentIdx + 1) % directions.length;
            changePlayerFaceTo(directions[newDirectionIdx]);  
        }

        setTimeout(done, STEP_TIME);
    }
};