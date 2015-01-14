(function(define) {define(function(require) {
    //dependencies

    var Port = require('ut-bus/port');
    var util = require('util');

    function ScriptPort() {
        Port.call(this);
        this.config = {
            id: null,
            logLevel: '',
            type: 'script'
        };
    }

    util.inherits(ScriptPort, Port);

    ScriptPort.prototype.exec = function(msg, callback) {
        callback(null, msg);
    };

    ScriptPort.prototype.start = function() {
        Port.prototype.start.apply(this, arguments);
        this.pipeExec(this.exec, 10);
    };

    return ScriptPort;

});}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
