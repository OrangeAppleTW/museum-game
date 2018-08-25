Blockly.Blocks['when_run'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldImage("../../images/green-flag.svg", 15, 15, "*"))
          .appendField("當運行時");
      this.setNextStatement(true, null);
      this.setColour('#FDBE2D');
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
    return 'stepForward();\n';
};
function initInterpreterStepForwards(interpreter, scope) {
    var wrapper = interpreter.createAsyncFunction(function(callback) {
        window.GAME.player.stepForward(callback)
    });
    interpreter.setProperty(scope, 'stepForward', wrapper);
}

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
    return 'turn("' + dropdown_value + '");\n';
};
function initInterpreterTurn(interpreter, scope) {
    var wrapper = interpreter.createAsyncFunction(function(direction, callback) {
        window.GAME.player.turn(direction, callback)
    });
    interpreter.setProperty(scope, 'turn', wrapper);
}

Blockly.Blocks['say_hi'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("打招呼");
      this.setPreviousStatement(true, null);
      this.setColour('#986BFC');
    }
};
Blockly.JavaScript['say_hi'] = function(block) {
    return 'sayHi();\n';
};
function initInterpreterSayHi(interpreter, scope) {
    var wrapper = interpreter.createAsyncFunction(function(callback) {
        window.GAME.player.sayHi(callback)
    });
    interpreter.setProperty(scope, 'sayHi', wrapper);
}


Blockly.Blocks['repeat_n_times'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("重複執行")
          .appendField(new Blockly.FieldDropdown([["1","1"], ["2","2"], ["3","3"], ["4","4"], ["5","5"], ["6","6"], ["7","7"], ["8","8"], ["9","9"], ["10","10"]]), "n_times")
          .appendField("次");
      this.appendStatementInput("do")
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FDAA32');
    }
};
Blockly.JavaScript['repeat_n_times'] = function(block) {
    var branch = Blockly.JavaScript.statementToCode(block, 'do');
    branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
    var code = '';
    var loopVar = Blockly.JavaScript.variableDB_.getDistinctName(
        'count', Blockly.Variables.NAME_TYPE);
    var endVar = +block.getFieldValue('n_times');

    code += 'for (var ' + loopVar + ' = 0; ' +
        loopVar + ' < ' + endVar + '; ' +
        loopVar + '++) {\n' +
        branch + '}\n';

    return code;
};

Blockly.Blocks['pick_up_jade'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("撿起玉石");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
    }
};
Blockly.JavaScript['pick_up_jade'] = function(block) {
    return "pickUpJade();\n";
};
function initInterpreterPickUpJade(interpreter, scope) {
    var wrapper = interpreter.createAsyncFunction(function(callback) {
        window.GAME.player.pickUpJade(callback)
    });
    interpreter.setProperty(scope, 'pickUpJade', wrapper);
}

Blockly.Blocks['put_down_jade'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("放下玉石");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
    }
};
Blockly.JavaScript['put_down_jade'] = function(block) {
    return "putDownJade();\n";
};
function initInterpreterPutDownJade(interpreter, scope) {
    var wrapper = interpreter.createAsyncFunction(function(callback) {
        window.GAME.player.putDownJade(callback)
    });
    interpreter.setProperty(scope, 'putDownJade', wrapper);
}

Blockly.Blocks['pick_up_tool'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("撿起工具");
      this.setColour('#986BFC');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
    }
};
Blockly.JavaScript['pick_up_tool'] = function(block) {
    return 'pickUpTool();\n';
};
function initInterpreterPickUpTool(interpreter, scope) {
    var wrapper = interpreter.createAsyncFunction(function(callback) {
        window.GAME.player.pickUpTool(callback)
    });
    interpreter.setProperty(scope, 'pickUpTool', wrapper);
}

Blockly.Blocks['mill'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("磨鋸");
      this.setColour('#986BFC');
      this.setPreviousStatement(true, null);
    }
};
Blockly.JavaScript['mill'] = function(block) {
    return 'mill();\n';
};
function initInterpreterMill(interpreter, scope) {
    var wrapper = interpreter.createAsyncFunction(function(callback) {
        window.GAME.player.mill(callback)
    });
    interpreter.setProperty(scope, 'mill', wrapper);
}

Blockly.Blocks['hit_break'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("打剝");
      this.setColour('#986BFC');
      this.setPreviousStatement(true, null);
    }
};
Blockly.JavaScript['hit_break'] = function(block) {
    return 'hitBreak();\n';
};
function initInterpreterhitBreak(interpreter, scope) {
    var wrapper = interpreter.createAsyncFunction(function(callback) {
        window.GAME.player.hitBreak(callback)
    });
    interpreter.setProperty(scope, 'hitBreak', wrapper);
}