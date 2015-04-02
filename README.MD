
UT Port Script
============

Overview
-------------
UT Port Script is a destination port which is not aimed for establishing a direct communication with external systems or a services (e.g. mssql, hsm, atm, etc.) but rather for performing logical operations over the messages it receives.  Therefore, unlike the other UT Ports, it can't implement hooks for outbound and inbound conversions (send, receive) but instead it can expose a set of methods which get automatically called depending on the operation codes of the messages it receives.

Basics
-------------
Defining a script port for a given implementation. 

------------------------------------------------------------------------------------------
For the purpose of this example we'll create a ut-script-port named 'rpc'.  The folder structure should be as follows:

``` html
impl-test/
    ports/
        rpc/
            index.js
    index.js
    server.js
```

Registering the rpc port in the bus happens with the follwoing code inside server.js :

```js
module.exports = {
    ports: [
        require('./ports/rpc')
    ]
};
```

For the purpose of this tutorial the ut-template module will also be registered in the bus along with the rpc port. That can be done again through server.js and it's content becomes: 
```js
module.exports = {
    ports: [
        require('./ports/rpc')
    ],
    modules: {
        template : require('ut-template')
    }
};

```
Now the script port and the ut-template module are bundled together inside server.js and are ready to be used.

----------------------------------------------------

The next step is describing the methods of the rpc port itself. In order for the script port to be initialized some basic settings are required, such as defining it's **id**, **type**, **logLevel** and **namespace**. 
The minimum definition of the ut-script port (in this case: *impl-test/ports/rpc/index.js*) looks like this:

```js
module.exports = {
    id: 'script',
    type: 'script',
    logLevel: 'trace',
    namespace: ['rpc']
};

```
This way the port gets registered to the bus but is useless as it does nothing.
The next step is defining a start method which acts like a hook which gets automatically called by the bus upon the port initialization:

```js
var loadTemplate = null;
module.exports = {
    id: 'script',
    type: 'script',
    logLevel: 'trace',
    namespace: ['rpc'],
    start: function() {
        loadTemplate = this.bus.importMethod('template.load');
    }
};

```
The start function's scope has access to the port itself through **this** .  Having access to the bus it is possible to import methods for it. In the example above the **load** method gets imported from the **template** module that was defined earlier in server.js. This way the access to template.load method was ensured via the port definition's closure scope.

----------------------------------------------------

This is some sample code for defining methods for the port:

```js
var loadTemplate = null;
module.exports = {
    id: 'script',
    type: 'script',
    logLevel: 'trace',
    namespace: ['customer', 'agent'],
    start: function() {
        loadTemplate = this.bus.importMethod('template.load');
    },
    exec: function(msg){
        return loadTemplate(require.resolve('./templates/' + msg.$$.opcode + '.json.marko')).render(msg)
            .then(function(result) {
                result = JSON.parse(result);
                result.$$ = {mtid: 'response'};
                return result;
            })
    },
    test: function(msg){
        return loadTemplate(require.resolve('./templates/test.json.marko')).render(msg)
            .then(function(result) {
                result = JSON.parse(result);
                result.$$ = {mtid: 'response'};
                return result;
            })
    }
};
```

The ut-script port has the option for defining a default method called **exec** which acts as a fallback in case no method is specified for a given operation code. So in the code above the **exec** method will be called for all messages except for the ones with opcode **test** for which the respective method named test will be triggered.

-----

The ut-script-port also provides the functionality for auto-importing methods from custom modules.
```
module.exports = {
    id: 'script',
    type: 'script',
    logLevel: 'trace',
    namespace: ['rpc', 'moduleName'],
    imports:['moduleName']
    start: function() {
        loadTemplate = this.bus.importMethod('template.load');
    },
    ...
};

```
The code above will merge all methods from a module called **moduleName** into port's  custom methods list. This way all requests to **rpc.methodName** and **moduleName.methodName** will be handled by the above defined script port.