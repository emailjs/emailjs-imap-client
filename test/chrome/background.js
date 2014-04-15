chrome.app.runtime.onLaunched.addListener(function() {
    'use strict';

    chrome.app.window.create('chrome/integration.html', {
        'bounds': {
            'width': 1024,
            'height': 650
        }
    });
});