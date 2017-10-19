'use strict';
const create = require('ut-error').define;
const PortScript = create('PortScript', undefined, 'Script error');

module.exports = {
    script: PortScript,
    unknownMethod: create('UnknownMethod', PortScript, 'Unknown method "{method}"')
};
