'use strict';
const create = require('ut-error').define;
const PortScript = create('portScript', undefined, 'Script error');

module.exports = {
    script: PortScript,
    unknownMethod: create('unknownMethod', PortScript, 'Unknown method "{method}"')
};
