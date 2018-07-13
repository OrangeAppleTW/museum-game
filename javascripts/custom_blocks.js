Blockly.Blocks['when_run'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("當運行時");
      this.setNextStatement(true, null);
      this.setColour(120);
    }
};
Blockly.JavaScript['when_run'] = function(block) { return ""; };

Blockly.Blocks['step_forward'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("移動-向前");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
};
Blockly.JavaScript['step_forward'] = function(block) {
    return 'GAME.player.stepForward()\n';
};

Blockly.Blocks['turn_x'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([["轉向-右方 ↻","right"], ["轉向-左方 ↺","left"]]), "value");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
};

Blockly.JavaScript['turn_x'] = function(block) {
    var dropdown_value = block.getFieldValue('value');
    return 'GAME.player.turn("' + dropdown_value + '")\n';
};