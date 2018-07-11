Blockly.Blocks['when_run'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("當運行時");
      this.setNextStatement(true, null);
      this.setColour(120);
    }
};
Blockly.JavaScript['when_run'] = function(block) { return ""; };