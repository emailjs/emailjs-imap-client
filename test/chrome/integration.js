require.config({
    baseUrl: '../lib',
    paths: {
        'test': '..',
        'punycode': 'punycode.min',
        'forge': 'forge.min'
    },
    shim: {
        forge: {
            exports: 'forge'
        }
    }
});

mocha.setup('bdd');
require(['test/chrome/browserbox-test'], function() {
    'use strict';

    window.mocha.run();
});