// Disable ContextMenu
Blockly.ContextMenu.show = function() {};

// JavaScript generator configurations
Blockly.JavaScript.STATEMENT_PREFIX = 'GAME.highlightBlock(%1)\n';

// Initialize blockly
(function () {
    var blocklyArea = document.getElementById('blockly-area');
    var blocklyDiv = document.getElementById('blockly-instance');
    var xmlDOM = document.getElementById('blockly-workspace');
    
    // Inject blockly to DOM
    var workspace = Blockly.inject(blocklyDiv, {
        toolbox: document.getElementById('blockly-toolbox'),
        trashcan: true
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

    // Export to global
    BLOCKLY_WORKSPACE = workspace;
})();

// Run/Reset Button Event
(function () {
    var $runBtn = $('.js-run-code');
    var isRunning = false;
    
    $runBtn.click(function () {
        var code = Blockly.JavaScript.workspaceToCode(BLOCKLY_WORKSPACE);
        
        if (!isRunning) {
            isRunning = true;
            $runBtn.html('<i class="fas fa-sync"></i> 重置');
            
            // 組成 Promises chain
            var funcs = code.split("\n")
            var initCode = funcs[0];
            for(var i = 1; i < funcs.length; i++) {
                if (!!funcs[i]) {
                    initCode += ".then(function() {\n" +
                                      '    return ' + funcs[i] + ";\n" +
                                      "})";
                }
            }
            initCode += ".catch(function() {\n"+
                        '    console.log("Stop running.");'+
                        '});';

            try {
                eval(initCode);
            } catch (e) {
                console.error(e);
            }
        } else {
            isRunning = false;
            $runBtn.html('<i class="fas fa-play"></i> 運行');
            window.GAME.reset();
        }
    });
})()