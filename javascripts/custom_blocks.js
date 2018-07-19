Blockly.Blocks['when_run'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("當運行時");
      this.setNextStatement(true, null);
      this.setColour('#51BE5B');
    }
};
Blockly.JavaScript['when_run'] = function(block) { return ""; };

Blockly.Blocks['step_forward'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("移動-向前");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#5099FC');
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
      this.setColour('#5099FC');
    }
};
Blockly.JavaScript['turn_x'] = function(block) {
    var dropdown_value = block.getFieldValue('value');
    return 'GAME.player.turn("' + dropdown_value + '")\n';
};

Blockly.Blocks['say_hi'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("打招呼");
      this.setPreviousStatement(true, null);
      this.setColour('#986BFC');
    }
};
Blockly.JavaScript['say_hi'] = function(block) {
    return 'GAME.player.sayHi()\n';
};