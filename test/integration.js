require.config({
    baseUrl: 'lib',
    paths: {
        'test': '..',
        'punycode': 'punycode.min'
    }
});

mocha.setup('bdd');
require(['test/browserbox-integration'], function() {
    'use strict';
    
    window.mocha.run();
});