var Port = require('ut-bus/port');
var util = require('util');
var when = require('when');
var errors = require('./errors.js');

function ScriptPort() {
    Port.call(this);
    this.config = {
        id: null,
        logLevel: '',
        type: 'script',
        findMethod: false
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

function findMethod(where, methodName) {
    var result = where[methodName];
    if (!result) {
        var names = methodName.split('.');
        while (names.length) {
            result = where[names.join('.')];
            if (result) {
                where[methodName] = result;
                break;
            }
            names.pop();
        }
    }
    return result;
}

// loop back the converted message
ScriptPort.prototype.exec = function() {
    var $meta = (arguments.length > 1 && arguments[arguments.length - 1]);
    var methodName = ($meta && $meta.method) || 'exec';
    var method = this.config.findMethod ? findMethod(this.config, methodName) : this.config[methodName];

    if (!method) {
        methodName = methodName.split('/', 2);
        method = (methodName.length === 2 && this.config[methodName[1]]) || this.config.exec;
    }

    if (method instanceof Function) {
        return when.lift(method).apply(this, Array.prototype.slice.call(arguments));
    } else {
        return when.reject(errors.unknownMethod($meta && $meta.method));
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
