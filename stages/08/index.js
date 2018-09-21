// Define global variable
window.GAME = {
    player: {}
};

window.GAME.initialize = function () {
    var STEP_TIME = 500; // 每步執行時間 (ms)
    var TILT_SIZE = 100; // 每個 TILE (正方形)的大小

    // 預設玩家位置
    var DEFAULT_PLAYER = { x: 3.5 * TILT_SIZE, y: 3.5 * TILT_SIZE, facing: 'down' };

    // 選擇的角色
    var SELECTED_CHARACTER = localStorage.getItem('selectedCharacter') || 'child-a';

    // 動態調整 Phaser 遊戲大小
    // 當 window resize 時，讓 canvas scale 
    // 預設遊戲畫面為 1:1
    function addResizeEvent(width, canvas) {
        var $phaserArea = $('#phaser-area');
        var $phaserCanvas = $(canvas);

        var onresize = function () {
            var containerWidth = $phaserArea.width();
            var ratio = containerWidth / width;

            $phaserCanvas.css('transform', 'scale(' + ratio + ')');
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
    var hammer; // 石鎚
    var schist; // 片岩
    var drill; //鑽孔器
    var bounds = []; // 邊界
    var resetSignal = new Phaser.Signal(); // 重設遊戲 event

    // 是否執行磨製成功
    var isHitBreak = false;
    var isMilled = false;
    var isDrilled = false;
    var isPolished = false;

    // 計算兩個 sprite 間距離（單位 px)
    function calcDistance(sprite1, spirte2) {
        return Math.sqrt(Math.pow(sprite1.x - spirte2.x, 2) + Math.pow(sprite1.y - spirte2.y, 2));
    }

    // 加入地圖限制區域
    function addBound(startRow, startColumn, rowSpan, columnSpan) {
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

    // Add tile highlight
    // 標示出目標區塊
    function addTileHighlight(startRow, startColumn, rowSpan, columnSpan) {
        for(var rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
            for(var columnOffset = 0; columnOffset < columnSpan; columnOffset++) {
                var y = (startRow + rowOffset + 0.5) * TILT_SIZE;
                var x = (startColumn + columnOffset + 0.5) * TILT_SIZE;

                var tileHighlight = backgroundLayer.create(x, y, 'tile-highlight');
                tileHighlight.scale.setTo(TILT_SIZE / tileHighlight.width);
                tileHighlight.anchor.x = 0.5;
                tileHighlight.anchor.y = 0.5;
            }
        }
    }
    
    // Add tile highlight
    // 標示出目標區塊
    function addTileHighlightYellow(startRow, startColumn, rowSpan, columnSpan) {
        for(var rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
            for(var columnOffset = 0; columnOffset < columnSpan; columnOffset++) {
                var y = (startRow + rowOffset + 0.5) * TILT_SIZE;
                var x = (startColumn + columnOffset + 0.5) * TILT_SIZE;

                var tileHighlight = backgroundLayer.create(x, y, 'tile-highlight-yellow');
                tileHighlight.scale.setTo(TILT_SIZE / tileHighlight.width);
                tileHighlight.anchor.x = 0.5;
                tileHighlight.anchor.y = 0.5;
            }
        }
    }

    // 建立玩家角色
    function createPlayer() {
        player = middleLayer.create(DEFAULT_PLAYER.x, DEFAULT_PLAYER.y, 'player');
        player.scale.setTo(TILT_SIZE / player.width);
        player.anchor.x = 0.5;
        player.anchor.y = 0.85;
        player.facing = DEFAULT_PLAYER.facing;
        player.hodingTool = null;

        // 動畫
        player.animations.add('walk-down', [0, 1, 2]);
        player.animations.add('walk-left', [3, 4, 5]);
        player.animations.add('walk-up', [6, 7, 8]);
        player.animations.add('walk-right', [9, 10, 11]);

        // 碰撞
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.setSize(TILT_SIZE, TILT_SIZE, 12.5, 132.5);
        player.body.collideWorldBounds = true;

        // 設定角色方法

        // 變更角色面朝方向
        // 0, 3, 6, 9
        // 下, 左, 上, 右
        player.faceTo = function (direction) {
            if (direction === 'down') {
                this.frame = 0;
                this.facing = 'down';
            } else if (direction === 'left') {
                this.frame = 3;
                this.facing = 'left';
            } else if (direction === 'up') {
                this.frame = 6;
                this.facing = 'up';
            } else if (direction === 'right') {
                this.frame = 9;
                this.facing = 'right';
            }
        }
        player.faceTo(DEFAULT_PLAYER.facing);

        // 蹲下功能
        // 根據角色面朝方向決定切換到該方向的 frame
        player.squat = function() {
            if (this.facing == 'down') {
                this.frame = 12;
            } else if (this.facing == 'left') {
                this.frame = 13;
            } else if (this.facing == 'up') {
                this.frame = 14;
            } else if (this.facing == 'right') {
                this.frame = 15;
            }
        }
    }

    function createTools() {
        // 石鎚
        hammer = middleLayer.create(2.5*TILT_SIZE, 4.5*TILT_SIZE, 'hammer')
        hammer.anchor.x = 0.5;
        hammer.anchor.y = 0.5;
        hammer.scale.setTo(TILT_SIZE / hammer.width);
        
        // 片岩
        schist = middleLayer.create(3.5*TILT_SIZE, 7.5*TILT_SIZE, 'schist')
        schist.anchor.x = 0.5;
        schist.anchor.y = 0.5;
        schist.scale.setTo(TILT_SIZE / schist.width);

        // 鑽孔器
        drill = middleLayer.create(6.5*TILT_SIZE, 7.5*TILT_SIZE, 'drill')
        drill.anchor.x = 0.5;
        drill.anchor.y = 0.25;
        drill.scale.setTo(TILT_SIZE / drill.width);
    }

    // 預先載入素材
    function preload() {
        game.load.image('map', '../../images/stages/08/map.jpg');

        //Preload Tool Image
        game.load.image('hammer', '../../images/tools/hammer.png');
        game.load.image('schist', '../../images/tools/schist.png');
        game.load.image('drill', '../../images/tools/drill.png');
        game.load.image('tile-highlight', '../../images/tile-highlight.png');
        game.load.image('tile-highlight-yellow', '../../images/tile-highlight-yellow.png');

        // 0, 3, 6, 9, 12, 13, 14, 15
        // 下, 左, 上, 右, 蹲下(下), 蹲下(左), 蹲下(上), 蹲下(右)
        game.load.spritesheet('player', '../../images/' + SELECTED_CHARACTER + '-spritesheet.png', 125, 216, 16);
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

        // 建立工具
        createTools();

        // 設定地圖邊界
        addBound(0, 2, 1, 1);
        addBound(2, 0, 1, 1);
        addBound(9, 0, 1, 3);
        addBound(0, 3, 2, 2);
        addBound(0, 5, 1, 1);
        addBound(0, 6, 2, 2);
        addBound(0, 9, 1, 1);
        addBound(5, 4, 1, 3);
        addBound(4, 2, 1, 1);
        addBound(7, 3, 1, 1);
        addBound(7, 6, 2, 1);

        addTileHighlight(4,3,1,1);
        addTileHighlightYellow(5,3,1,1);
        addTileHighlight(6,3,1,1);
        addTileHighlightYellow(6,4,1,1);
        addTileHighlight(6,5,1,3);
        addTileHighlightYellow(5,7,1,1);
        addTileHighlight(4,6,1,2);
        addTileHighlightYellow(4,5,1,1);
    }

    // 當畫面更新時
    function update() {
        // 限制角色不能超過邊界
        game.physics.arcade.collide(player, bounds);

        // game.debug.spriteInfo(player, 32, 32);
        // for (var i = 0; i < bounds.length; i++) {
        //     game.debug.body(bounds[i]);
        // }
        // game.debug.body(player);
    }

    // 重設遊戲狀態
    window.GAME.reset = function () {
        resetSignal.dispatch();

        player.x = DEFAULT_PLAYER.x;
        player.y = DEFAULT_PLAYER.y;
        player.faceTo(DEFAULT_PLAYER.facing);
        
        hammer.visible = true;
        schist.visible = true;
        drill.visible = true;

        isHitBreak = false;
        isMilled = false;
        isDrilled = false;
        isPolished = false;
    };

    // 驗證關卡是否完成
    window.GAME.validate = function () {
        var $alertModal = $('#alert-modal');
        if (isHitBreak && isMilled && isDrilled && isPolished) {

            var scenes = [
                { actor: '史前人', sentence: '恭喜你，你已經是個非常優秀的工匠了，帶著我們的故事回到未來吧，也請你幫我看看這些我們精心製作的寶物是否好好的留存著…' }
            ];

            window.startChat(scenes, function() {
                $alertModal.find('.content').text('完成第八關，恭喜！');
                // $alertModal.find('.next-stage').show();
                $alertModal.modal('show');
            });
        } else {
            $alertModal.find('.content').text("任務失敗\n\n要依序在黃色區塊執行打剝、鋸崩、鑽孔及磨製 4 項技術才能過關喔！");
            $alertModal.modal('show');
        }
    };

    // 定義玩家角色方法
    window.GAME.player.stepForward = function (done) {
        var yOffset = 0;
        var xOffset = 0;
        var animationName = null;

        if (player.facing === 'down') {
            animationName = 'walk-down';
            yOffset = 100;
        } else if (player.facing === 'left') {
            animationName = 'walk-left';
            xOffset = -100;
        } else if (player.facing === 'up') {
            animationName = 'walk-up';
            yOffset = -100;
        } else if (player.facing === 'right') {
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
        var facings = ['left', 'up', 'right', 'down'];
        var currentIdx = facings.indexOf(player.facing);
        if (side === 'left') {
            var newfacingIdx = (4 + currentIdx - 1) % facings.length;
            player.faceTo(facings[newfacingIdx]);
        } else if (side === 'right') {
            var newfacingIdx = (4 + currentIdx + 1) % facings.length;
            player.faceTo(facings[newfacingIdx]);
        }

        setTimeout(done, STEP_TIME);
    };

    window.GAME.player.pickUpTool = function (done) {
        player.squat();

        if (calcDistance(player, hammer) === 100.0 && hammer.visible) {
            hammer.visible = false;
        } else if (calcDistance(player, schist) === 100.0 && schist.visible) {
            schist.visible = false;
        } else if (calcDistance(player, drill) === 100.0 && drill.visible) {
            drill.visible = false;
        } else {
            $('.hint-content p').text('請先走到工具旁邊，才能撿取哦！');
        }
        
        setTimeout(function() {
            player.faceTo(player.facing); // 站起來
            done();
        }, STEP_TIME);
    }

    window.GAME.player.hitBreak = function (done) {
        if (hammer.visible) {
            $('.hint-content p').text('要先拿到石鎚後，才能進行打剝哦！');
        } else {
            if (calcDistance(player, { x: 4.5*TILT_SIZE, y: 5.5*TILT_SIZE }) == 100.0) {
                player.squat();
                isHitBreak = true;
            } else {
                $('.hint-content p').text('要先走到玉石所在的位置，才能進行打剝哦！');
            }
        }

        setTimeout(function() {
            player.faceTo(player.facing); // 站起來
            done();
        }, STEP_TIME);
    }

    window.GAME.player.mill = function (done) {
        if (!isHitBreak) {
            $('.hint-content p').text('請先拿取石鎚打剝原石，再執行其他製玉動作哦！');
            return done();
        }

        if (schist.visible) {
            $('.hint-content p').text('要先拿到片岩後，才能進行磨鋸哦！');
        } else {
            if (calcDistance(player, { x: 4.5*TILT_SIZE, y: 5.5*TILT_SIZE }) == 100.0) {
                isMilled = true;
            } else {
                $('.hint-content p').text('要先走到玉石所在的位置，才能進行磨鋸哦！');
            }
        }

        setTimeout(function() {
            player.faceTo(player.facing); // 站起來
            done();
        }, STEP_TIME);
    }

    window.GAME.player.drill = function (done) {
        if (!isHitBreak) {
            $('.hint-content p').text('請先拿取石鎚打剝原石，再執行其他製玉動作哦！');
            return done();
        }

        if (drill.visible) {
            $('.hint-content p').text('要先拿到鑽孔器後，才能進行鑽孔哦！');
        } else {
            if (calcDistance(player, { x: 6.5*TILT_SIZE, y: 5.5*TILT_SIZE }) == 100.0) {
                player.squat();
                isDrilled = true;
            } else {
                $('.hint-content p').text('要先走到玉石所在的位置，才能進行鑽孔哦！');
            }
        }

        setTimeout(function() {
            player.faceTo(player.facing); // 站起來
            done();
        }, STEP_TIME);
    }

    window.GAME.player.polish = function (done) {
        if (!isHitBreak) {
            $('.hint-content p').text('請先拿取石鎚打剝原石，再執行其他製玉動作哦！');
            return done();
        }

        if (calcDistance(player, { x: 5.5*TILT_SIZE, y: 5.5*TILT_SIZE }) == 100.0) {
            player.squat();
            isPolished = true;
        } else {
            $('.hint-content p').text('要先走到玉石和砥石所在的位置，才能進行磨製哦！');
        }

        setTimeout(function() {
            player.faceTo(player.facing); // 站起來
            done();
        }, STEP_TIME);
    }
};