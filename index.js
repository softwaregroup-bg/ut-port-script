'use strict';
const merge = require('lodash.merge');
const util = require('util');
const errors = require('./errors.js');

module.exports = function({parent}) {
    function ScriptPort({config}) {
        parent && parent.apply(this, arguments);
        this.config = merge({
            id: null,
            logLevel: 'info',
            type: 'script',
            findMethod: false
        }, config);
    }

    if (parent) {
        util.inherits(ScriptPort, parent);
    }

    function findMethod(where, methodName) {
        let result = where[methodName];
        if (!result) {
            let names = methodName.split('.');
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

    ScriptPort.prototype.exec = function(...params) {
        let $meta = params && params.length > 1 && params[params.length - 1];
        let methodName = ($meta && $meta.method) || 'exec';
        let method = this.config.findMethod ? findMethod(this.config, methodName) : this.config[methodName];

        if (!method) {
            methodName = methodName.split('/', 2);
            method = (methodName.length === 2 && this.config[methodName[1]]) || this.config.exec;
        }

        if (method instanceof Function) {
            return Promise.resolve().then(() => method.apply(this, params));
        } else {
            return Promise.reject(errors.unknownMethod({params: {method: $meta && $meta.method}}));
        }
    };

    ScriptPort.prototype.start = function(...params) {
        this.bus.importMethods(this.config, this.config.imports, {request: true, response: true}, this);
        return Promise.resolve()
            .then(() => parent && parent.prototype.start.apply(this, params))
            .then(result => {
                this.pull(this.exec);
                return result;
            });
    };

    return ScriptPort;
};
