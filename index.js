var Port = require('ut-bus/port');
var util = require('util');
var when = require('when');
var errors = require('./errors.js');

function ScriptPort() {
    Port.call(this);
    this.config = {
        id: null,
        logLevel: '',
        type: 'script'
    };
}

util.inherits(ScriptPort, Port);

ScriptPort.prototype.init = function init() {
    Port.prototype.init.apply(this, arguments);
    this.latency = this.counter && this.counter('average', 'lt', 'Latency');
};

// skip creating unnecessary decoding stream, as same message is looped back by exec
ScriptPort.prototype.decode = function decode() {
    return null;
};

// loop back the converted message
ScriptPort.prototype.exec = function() {
    var $meta = (arguments.length > 1 && arguments[arguments.length - 1]);
    var methodName = ($meta && $meta.method) || 'exec';
    var method = this.config[methodName] || this.config.exec;
    if (method instanceof Function) {
        return when.lift(method).apply(this, Array.prototype.slice.call(arguments));
    } else {
        return when.reject(errors.script(methodName));
    }
};

ScriptPort.prototype.start = function() {
    this.bus.importMethods(this.config, this.config.imports, {request: true, response: true}, this);
    return Port.prototype.start.apply(this, Array.prototype.slice.call(arguments))
        .then(function(result) {
            this.pipeExec(this.exec.bind(this), this.config.concurrency);
            return result;
        }.bind(this));
};

module.exports = ScriptPort;
