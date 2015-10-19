var create = require('errno').custom.createError;

var PortScript = create('PortScript');
var UnknownMethod = create('UnknownMethod', PortScript);

module.exports = {
    script: function(cause) {
        return new PortScript('Script error', cause);
    },
    unknownMethod: function(cause) {
        return new UnknownMethod('Unknown method', cause);
    }
};
