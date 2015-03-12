'use strict';

// run like this:
//   GMAIL_USER="my.user@gmail.com" GMAIL_PASS="my-pass" node compression-example.js

var BrowserBox = require('../src/browserbox.js');

var connection = new BrowserBox('imap.gmail.com', 993, {
    useSecureTransport: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    enableCompression: true
});

connection.onerror = function(err) {
    console.log(err);
};

connection.onauth = function() {
    setTimeout(function() {
        connection.listMailboxes(function(err, mailboxes) {
            setTimeout(function() {
                connection.close();
            }, 3000);
        });
    }, 3000);
};

connection.connect();