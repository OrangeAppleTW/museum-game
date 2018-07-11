// Disable ContextMenu
Blockly.ContextMenu.show = function() {};

// JavaScript generator configurations
Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
Blockly.JavaScript.addReservedWords('highlightBlock');

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
    
    // 遞迴 SetDisbled to blocks chain
    var recursivelySetDisabled = function (block, isDisabled) {
        block.setDisabled(isDisabled);
        var children = block.getChildren();
        for(var i = 0; i < children.length; i++) {
            var child = children[i];
            recursivelySetDisabled(child, isDisabled);
        }
    }

    // setDisabled 未連接開始積木
    var disableBlockWithNoTrigger = function () {
        var topBlocks = workspace.getTopBlocks(true);
        for (var i = 0; i < topBlocks.length; i++) {
            var topBlock = topBlocks[i];
            if (topBlock.type == 'when_run') {
                recursivelySetDisabled(topBlock, false);
            } else {
                topBlock.setDisabled(true);
            }
        }
    }
    workspace.addChangeListener(disableBlockWithNoTrigger);
    
      // Export to global
    window.blocklyWorkspace = workspace; 
    
    // 動態調整 Blockly 大小
    var onresize = function() {
        blocklyDiv.style.width = (blocklyArea.offsetWidth - 5) + 'px'; // border offset + bug: 多 1px
        blocklyDiv.style.height = (blocklyArea.offsetHeight - 2) + 'px'; // border offset + bug: 多 1px
        Blockly.svgResize(workspace);
    };
    window.addEventListener('resize', onresize, false);
    onresize();
})();


// Run/Reset Button Event
(function () {
    var $runBtn = $('.js-run-code');
    var status = 'pending';
    var timerId = null;

    function initApi(interpreter, scope) {
        // Add an API function for the alert() block.
        var wrapper = function(text) {
          return alert(arguments.length ? text : '');
        };
        interpreter.setProperty(scope, 'alert',
            interpreter.createNativeFunction(wrapper));
      
        // Add an API function for the prompt() block.
        wrapper = function(text) {
          return prompt(text);
        };
        interpreter.setProperty(scope, 'prompt',
            interpreter.createNativeFunction(wrapper));

        // Add an API function for highlighting blocks.
        var wrapper = function(id) {
            return blocklyWorkspace.highlightBlock(id);
        };
        interpreter.setProperty(scope, 'highlightBlock',
            interpreter.createNativeFunction(wrapper));
    }
    
    $runBtn.click(function () {
        var code = Blockly.JavaScript.workspaceToCode(blocklyWorkspace);
        var interpreter = new Interpreter(code, initApi);

        if (status === 'pending') {
            status = 'running';
            $runBtn.html('<i class="fas fa-sync"></i> 重置');
            function nextStep() {
                if (status === 'running' && interpreter.step()) {
                    timerId = setTimeout(nextStep, 25);
                } else {
                    status = 'pending';
                    $runBtn.html('<i class="fas fa-play"></i> 運行');
                }
            }
            nextStep();
        } else if (status === 'running') {
            status = 'pending';
            $runBtn.html('<i class="fas fa-play"></i> 運行');
            clearTimeout(timerId);
        }
    });
})()


