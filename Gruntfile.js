module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: ['*.js', 'src/*.js', 'test/unit/*.js', 'test/integration/*.js', 'test/chrome/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        connect: {
            dev: {
                options: {
                    port: 12345,
                    base: '.',
                    keepalive: true
                }
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/integration/*.js']
            }
        },

        mocha_phantomjs: {
            all: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/unit/unit.html']
            }
        },

        watch: {
            js: {
                files: ['src/*.js'],
                tasks: ['deps']
            }
        },

        copy: {
            npm: {
                expand: true,
                flatten: true,
                cwd: 'node_modules/',
                src: [
                    'mocha/mocha.js',
                    'mocha/mocha.css',
                    'chai/chai.js',
                    'sinon/pkg/sinon.js',
                    'requirejs/require.js',
                    'tcp-socket/src/*.js',
                    'node-forge/js/forge.min.js',
                    'wo-stringencoding/dist/stringencoding.js',
                    'wo-utf7/src/utf7.js',
                    'wo-imap-handler/src/*.js',
                    'mimefuncs/src/mimefuncs.js',
                    'axe-logger/axe.js'
                ],
                dest: 'test/lib/'
            },
            app: {
                expand: true,
                flatten: true,
                cwd: 'src/',
                src: [
                    '*.js',
                ],
                dest: 'test/lib/'
            }
        },
        clean: ['test/lib/**/*']
    });

    // Load the plugin(s)
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-test');

    // Tasks
    grunt.registerTask('hoodiecrow', function() {
        var hoodiecrow, server, port, options;

        hoodiecrow = require("hoodiecrow"),
        options = {
            secureConnection: true,
            credentials: {
                key: '-----BEGIN RSA PRIVATE KEY-----\r\nMIICXQIBAAKBgQC9Em0BRVjucpRsqB8Y/GQizRpPwETz2aBXHyhNQAcNHtcbPphd\r\nx65atAMaDiPjYnVte1kwa6KsdizMB4A1O3f5gbH4Bp1zAmZrZKt1XBPy05kM+fjx\r\n64Sx7KJr86jzzBi9TzOYu1DgUcb2WyND+FjPGQUSEhyeCWlAbqb64V2nmQIDAQAB\r\nAoGAdBx3srsatTzKZ7wLdPWyrSiWCvoBnls8u6QXxPEYI3eYFFQpkBYLvgokiYC7\r\ni22wva5thG3lddIRCq9kjcxajWJcobY3WB9l/oSS+6THnBh2K09HXIJOpp53lu93\r\n0svtSesfxUepgwqkIs209TbaFvJW1cZk0qpna2dNze0QmLECQQDd998Qfs9obaMP\r\nAd8JhnVKYhHPpXghAwgLXn6faO5t97C580e1bcN5A61KhDoqfEzQ3/aiS+H5H3/q\r\nA7nM4yz9AkEA2g9k8pOPSXUAa3ufjAoPPzmkL5uJqCN0lSuyTr5EU+TnNGyG/bCD\r\n2E3BaSn9IOEsL8woeYzB2BWOofp4kl91zQJAHOI0VKErvBsILNvBeivU92jriGmv\r\nyBvs4A3bzEKLRCQHCyttGV6/IPApjJjION8T39pE7bmSHijLLFhvxQmKwQJBAIus\r\nNKLUNYF9ugkepDFU+DMtPqdn3yKdoz0xQgMCCE4cXqPLqCOy/qB8HZi41nRLBryO\r\n7pX8vOUl2biS8MwA7TkCQQCpjbncHpTUI+glp/wLcFDwnbIzXCEtEaRUmkg5ED5K\r\n//xLNE+jr8ZZTwoz4RrVkKZ3UwksxQPYypdZPmZFj9ac\r\n-----END RSA PRIVATE KEY-----',
                cert: '-----BEGIN CERTIFICATE-----\r\nMIICKTCCAZICCQDW2h5P+naMbjANBgkqhkiG9w0BAQUFADBZMQswCQYDVQQGEwJB\r\nVTETMBEGA1UECBMKU29tZS1TdGF0ZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0\r\ncyBQdHkgTHRkMRIwEAYDVQQDEwkxMjcuMC4wLjEwHhcNMTQwNzI4MTIzMDAxWhcN\r\nMTUwNzI4MTIzMDAxWjBZMQswCQYDVQQGEwJBVTETMBEGA1UECBMKU29tZS1TdGF0\r\nZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMRIwEAYDVQQDEwkx\r\nMjcuMC4wLjEwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAL0SbQFFWO5ylGyo\r\nHxj8ZCLNGk/ARPPZoFcfKE1ABw0e1xs+mF3Hrlq0AxoOI+NidW17WTBroqx2LMwH\r\ngDU7d/mBsfgGnXMCZmtkq3VcE/LTmQz5+PHrhLHsomvzqPPMGL1PM5i7UOBRxvZb\r\nI0P4WM8ZBRISHJ4JaUBupvrhXaeZAgMBAAEwDQYJKoZIhvcNAQEFBQADgYEApduD\r\nnAGm+VIMkCfLxWNegd41xS6Z89F/szTXjqnT14UnDc9CayOqxhsoWirukmEr7W9d\r\ngOTjGvG5X2k012VT1WTWinMHmyRJ4mM+caGTAJCE6Z314duhzOXrHhJUSHU5F9vs\r\nk9+qfs5ewmYBE3J6adnRCszn2VuoSRuof1MWRsU=\r\n-----END CERTIFICATE-----'
            },
            storage: {
                "INBOX":{
                    messages: [
                        {raw: "Subject: hello 1\r\n\r\nWorld 1!"},
                        {raw: "Subject: hello 2\r\n\r\nWorld 2!", flags: ["\\Seen"]},
                        {raw: "Subject: hello 3\r\n\r\nWorld 3!", uid: 555},
                        {raw: "From: sender name <sender@example.com>\r\nTo: Receiver name <receiver@example.com>\r\nSubject: hello 4\r\nMessage-Id: <abcde>\r\nDate: Fri, 13 Sep 2013 15:01:00 +0300\r\n\r\nWorld 4!"},
                        {raw: "Subject: hello 5\r\n\r\nWorld 5!", flags: ["$MyFlag", "\\Deleted"], uid: 557},
                        {raw: "Subject: hello 6\r\n\r\nWorld 6!"}
                    ]
                },
                "":{
                    "separator": "/",
                    "folders":{
                        "[Gmail]":{
                            "flags": ["\\Noselect"],
                            "folders": {
                                "All Mail":{
                                    "special-use": "\\All"
                                },
                                "Drafts":{
                                    "special-use": "\\Drafts"
                                },
                                "Important":{
                                    "special-use": "\\Important"
                                },
                                "Sent Mail":{
                                    "special-use": "\\Sent"
                                },
                                "Spam":{
                                    "special-use": "\\Junk"
                                },
                                "Starred":{
                                    "special-use": "\\Flagged"
                                },
                                "Trash":{
                                    "special-use": "\\Trash"
                                }
                            }
                        }
                    }
                }
            }
        };
        port = 10000;

        server = hoodiecrow(options),
        grunt.log.writeln('> Starting IMAP server on port ' + port);
        server.listen(port, function() {
            grunt.log.write('> Listening...\n');
        });

        this.async();
    });

    grunt.registerTask('imap', ['deps', 'hoodiecrow']);
    grunt.registerTask('dev', ['jshint', 'deps', 'connect']);
    grunt.registerTask('deps', ['clean', 'copy']);
    grunt.registerTask('test', ['jshint', 'mocha_phantomjs', 'mochaTest']);
    grunt.registerTask('default', ['deps', 'test']);
};
