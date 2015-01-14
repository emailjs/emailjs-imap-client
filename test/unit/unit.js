'use strict';

require.config({
    baseUrl: '../lib',
    paths: {
        'test': '..',
        'forge': 'forge.min'
    }
});

// add function.bind polyfill
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            FNOP = function() {},
            fBound = function() {
                return fToBind.apply(this instanceof FNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        FNOP.prototype = this.prototype;
        fBound.prototype = new FNOP();

        return fBound;
    };
}

if (typeof Promise === 'undefined') {
    // load ES6 Promises polyfill
    ES6Promise.polyfill();
}


mocha.setup('bdd');
require(['test/unit/browserbox-test', 'test/unit/browserbox-imap-test'], function() {
    (window.mochaPhantomJS || window.mocha).run();
});