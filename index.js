(function(define) {define(function(require) {
    //dependencies

    var Port = require('ut-bus/port');
    var util = require('util');

    function ScriptPort() {
        Port.call(this);
        this.config = {
            id: null,
            logLevel: '',
            type: 'script',
            host: '127.0.0.1',
            port: null,
            listen: false
        };
    }

    util.inherits(ScriptPort, Port);

    ScriptPort.prototype.init = function init() {
        Port.prototype.init.apply(this, arguments);
    };

    ScriptPort.prototype.receive = function(msg) {
        this.level.debug && this.log.debug(msg);
    };

    return ScriptPort;

});}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
