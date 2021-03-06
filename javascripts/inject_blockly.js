// Disable ContextMenu
Blockly.ContextMenu.show = function() {};

// JavaScript generator configurations
Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
Blockly.JavaScript.addReservedWords('highlightBlock');

// 開始積木的 hat
Blockly.BlockSvg.START_HAT = true;

// Initialize blockly
(function () {
    var blocklyArea = document.getElementById('blockly-area');
    var blocklyDiv = document.getElementById('blockly-instance');
    var xmlDOM = document.getElementById('blockly-workspace');
    
    // Inject blockly to DOM
    var workspace = Blockly.inject(blocklyDiv, {
        toolbox: document.getElementById('blockly-toolbox'),
        trashcan: true,
        scrollbars: true
    });

    // 載入預設積木
    Blockly.Xml.appendDomToWorkspace(xmlDOM, workspace);

    // disable 未連接到開始的積木
    workspace.addChangeListener(Blockly.Events.disableOrphans);


    var $toolboxHeader = $('.toolbox-header');
    var $blocklyFlyoutBackground = $('svg.blocklyFlyout');

    // 動態調整 Blockly 大小
    var onresize = function() {
        blocklyDiv.style.width = (blocklyArea.offsetWidth - 5) + 'px'; // border offset + bug: 多 1px
        blocklyDiv.style.height = (blocklyArea.offsetHeight - 2) + 'px'; // border offset + bug: 多 1px
        Blockly.svgResize(workspace);

        // resize toolbox-header
        var width = $blocklyFlyoutBackground.width();
        if(width > 0) $toolboxHeader.width(width);
    };
    window.addEventListener('resize', onresize, false);
    onresize();

    // 初始化 header 寬度（用 setTimeout 等待 blockly 載入）
    var _resizeToolboxHeader = function() {
        var width = $blocklyFlyoutBackground.width();
        if(width > 0) {
            $toolboxHeader.width(width);
        } else {
            setTimeout(_resizeToolboxHeader, 100);
        }
    }
    setTimeout(_resizeToolboxHeader, 100);

    // move green flag block to left top of workspace
    var initBlock = workspace.getTopBlocks()[0];
    var metrics = workspace.getMetrics();
    workspace.centerOnBlock(initBlock.id);
    initBlock.moveBy(
        metrics.flyoutWidth + (initBlock.width / 2) + 25 - (metrics.viewWidth / 2),
        55 - (metrics.viewHeight / 2)
    );
    
    // Export to global
    BLOCKLY_WORKSPACE = workspace;
})();

// Run / Reset
(function () {
    var interpreter = null;
    var runnerId;

    function highlightBlock(id) {
        BLOCKLY_WORKSPACE.highlightBlock(id);
    }

    function initApi(interpreter, scope) {
        // Add an API function for highlighting blocks.
        var wrapper = interpreter.createAsyncFunction(function(id, callback) {
            id = id ? id.toString() : '';
            highlightBlock(id);
            setTimeout(callback, 150);
        });
        interpreter.setProperty(scope, 'highlightBlock', wrapper);

        // defined in custom_blocks.js
        initInterpreterStepForwards(interpreter, scope);
        initInterpreterTurn(interpreter, scope);
        initInterpreterSayHi(interpreter, scope);
        initInterpreterPickUpJade(interpreter, scope);
        initInterpreterPutDownJade(interpreter, scope);
        initInterpreterPickUpTool(interpreter, scope);
        initInterpreterhitBreak(interpreter, scope);
        initInterpreterMill(interpreter, scope);
        initInterpreterDrill(interpreter, scope);
        initInterpreterPolish(interpreter, scope);


    }

    function resetInterpreter() {
        interpreter = null;
        if (runnerId) {
            clearTimeout(runnerId);
            runnerId = null;
        }
    }

    function runCode () {
        var code = Blockly.JavaScript.workspaceToCode(BLOCKLY_WORKSPACE);
        if (!interpreter) {
            setTimeout(function() {
                // Begin execution
                interpreter = new Interpreter(code, initApi);
                var runner = function() {
                    if (interpreter) {
                        var hasMore = interpreter.run();
                        if (hasMore) {
                            // Execution is currently blocked by some async call.
                            // Try again later.
                            runnerId = setTimeout(runner, 10);
                        } else {
                            // 結束時執行驗證關卡是否完成。
                            window.GAME.validate();
                        }
                    }
                };
                runner();
            }, 1);
            return;
        }
    }

    BLOCKLY_WORKSPACE.addChangeListener(function(event) {
        if (!(event instanceof Blockly.Events.Ui)) clearTimeout(runnerId);
    });

    var $runBtn = $('.js-run-code');    
    $runBtn.click(function () {        
        if (!interpreter) {
            $runBtn.html('<i class="fas fa-sync"></i> 重置');
            runCode();
        } else {
            $runBtn.html('<i class="fas fa-play"></i> 運行');
            resetInterpreter();
            window.GAME.reset();
        }
    });
})()