var Port = require('ut-bus/port');
var util = require('util');
var when = require('when');

function ScriptPort() {
    Port.call(this);
    this.config = {
        id: null,
        logLevel: '',
        type: 'script'
    };
}

util.inherits(ScriptPort, Port);

// skip creating unnecessary decoding stream, as same message is looped back by exec
ScriptPort.prototype.decode = function decode() {
    return null;
};

//loop back the converted message
ScriptPort.prototype.exec = function(msg, callback) {
    var methodName = (msg && msg.$$ && msg.$$.opcode);
    var fallBack = (methodName && !(this.config[methodName] instanceof Function)) ? 'exec' : methodName
    if (fallBack && this.config[fallBack] instanceof Function) {
        when.lift(this.config[fallBack]).apply(this, [msg])
            .then(function(res){

                callback(null,res);
            },function(err){

                callback(err);
            });

    } else {
        msg || (msg = {});
        msg.$$ || (msg.$$ = {});
        msg.$$.mtid = 'error';
        msg.$$.errorCode = '2002';
        msg.$$.errorMessage = 'Unknown method ' + methodName;
        callback(msg);
    }
};

ScriptPort.prototype.start = function() {
    this.bus.importMethods(this.config, this.config.imports, {request: true, response: true}, this);
    Port.prototype.start.apply(this, arguments);
    this.pipeExec(this.exec, 10);
    this.config.imports && this.config.imports.forEach(function(moduleName){
        var fn = this.config[moduleName+'.start'];
        fn && fn();
    }.bind(this))
};

module.exports = ScriptPort;
