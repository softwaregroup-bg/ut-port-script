'use strict';

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

module.exports = function({parent, utPort = parent}) {
    return class ScriptPort extends utPort {
        get defaults() {
            return {
                type: 'script',
                findMethod: false
            };
        }
        async exec(...params) {
            let $meta = params && params.length > 1 && params[params.length - 1];
            let methodName = ($meta && $meta.method) || 'exec';
            let method = this.config.findMethod ? findMethod(this.methods, methodName) : this.findHandler(methodName);
            method = method || this.methods.exec;
            if (method instanceof Function) {
                return method.apply(this, params);
            } else {
                throw this.bus.errors['bus.methodNotFound']({ params: { method: $meta && $meta.method } });
            }
        }
        async start() {
            this.bus.attachHandlers(this.methods, this.config.imports);
            const result = await super.start(...arguments);
            this.pull(this.exec, this.config.context);
            return result;
        }
    };
};
