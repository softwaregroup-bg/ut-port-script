'use strict';
module.exports = create => {
    const PortScript = create('portScript', undefined, 'Script error');

    return {
        script: PortScript,
        unknownMethod: create('unknownMethod', PortScript, 'Unknown method "{method}"')
    };
};
