var create = require('ut-error').define;

var PortScript = create('PortScript', undefined, 'Script error');
var UnknownMethod = create('UnknownMethod', PortScript, 'Unknown method {methodName}');

module.exports = {
    script: function(cause) {
        return new PortScript(cause);
    },
    unknownMethod: function(methodName) {
        return new UnknownMethod({params: {methodName}});
    }
};
