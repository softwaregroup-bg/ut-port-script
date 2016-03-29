var create = require('ut-error').define;

var PortScript = create('PortScript', undefined, 'Script error');
var UnknownMethod = create('UnknownMethod', PortScript, 'Unknown method');

module.exports = {
    script: function(cause) {
        return new PortScript(cause);
    },
    unknownMethod: function(cause) {
        return new UnknownMethod(cause);
    }
};
