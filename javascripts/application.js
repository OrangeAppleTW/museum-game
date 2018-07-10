// init blockly
(function () {
    var blocklyArea = document.getElementById('blockly-area');
    var blocklyDiv = document.getElementById('blockly-instance');
    var workspace = Blockly.inject(blocklyDiv, {toolbox: document.getElementById('blockly-toolbox')});
    window.blocklyWorkspace = workspace; // Export to global
    
    var $toolbarBGSvg = $('path.blocklyFlyoutBackground');
    var onresize = function(e) {
        // 動態調整 Blockly 大小
        blocklyDiv.style.width = (blocklyArea.offsetWidth - 5) + 'px'; // border offset + bug: 多 1px
        blocklyDiv.style.height = (blocklyArea.offsetHeight - 2) + 'px'; // border offset + bug: 多 1px
        Blockly.svgResize(workspace);

        // 移除 toolbox 的 border-radius
        // "M", "0,0", "h", "131.49497985839844", "a", "8", "8", "0", "0", "1", "8", "8", "v", "411", "a", "8", "8", "0", "0", "1", "-8", "8", "h", "-131.49497985839844", "z"
        var pathArgs = $toolbarBGSvg.attr('d').split(' ');
        var toolbarWidth = +pathArgs[3]+8;
        var toolbarHeight = +pathArgs[13]+16;
        var newPath = 'M 0 0 h ' + toolbarWidth + ' v ' + toolbarHeight + ' h -' + toolbarWidth + ' z';
        $toolbarBGSvg.attr('d', newPath);
    };
    window.addEventListener('resize', onresize, false);
    onresize();
})();
