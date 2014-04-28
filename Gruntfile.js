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
                flatten: false,
                cwd: 'node_modules/',
                src: [
                    'mocha/mocha.js',
                    'mocha/mocha.css',
                    'chai/chai.js',
                    'sinon/pkg/sinon.js',
                    'requirejs/require.js',
                    'tcp-socket/src/tcp-socket.js',
                    'node-forge/js/forge.min.js',
                    'stringencoding/dist/stringencoding.js',
                    'utf7/src/utf7.js',
                    'imap-handler/src/*.js',
                    'mimefuncs/src/mimefuncs.js'
                ],
                dest: 'test/lib/',
                rename: function(dest, src) {
                    return dest + '/' + src.split('/').pop();
                }
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
                key: '-----BEGIN RSA PRIVATE KEY-----\r\nMIICWwIBAAKBgQDA9jfkw2yzUyfc15vECzGMZT2wfM4O5lyobFH/Z3rGNerxPIwm\r\nDyxlOCq5cE8/K8FNuaNm9NkbECSX9WR7yyUTG8kX7cG6Hhw1ICsE5RKWa/7uIJIa\r\nu517Q5N6A2zBM4YLCAewQZhdv4fYNCz3vsTuyGznD5pAR7bIfCHR6lblBQIDAQAB\r\nAoGAY0hMSfAjJcFLaV2mT6BSxiHxM7WDcDcmxaG2LutXSFTFpYm5sntsJEhZ8z/O\r\nBnrE4vD5Gigw7LPJoEYqhWdokx+neXzrpMcQGToNxn8aQO5WbYcAuIx5j893spwz\r\nG0cPfYVLsCb9epxWTmsxpN8P+W7MeyLX6YbIktJJn0LGBgECQQDgSZ7DSdzori5f\r\n8c/5Yse5lqZT8Gaot004AcVF371apfiQxbI9OQihkKB/zJkg9DHddFCIQV6Z++1o\r\nWKknFn01AkEA3D64eshD1MM8bLhC2k+Km6Lr7RPjtjNnIPOoE+8bVdkNgouffgsk\r\nFvliFij6dVQqbueBs5mnM0VxIgZea2NSkQJAAlBAFvuYD75cNBkmcAgYz01CgfMk\r\n2/CoFz/NbR8VsO2tVrDzWbZQ5Hm9bhQKMFDUgthETGOAOk5i8ISZmhGdUQJAXvfA\r\njlj6Pqzsyiht0zrHFrMargCMiM0DZAcMa4QHsm3EUI0p+ayOJEXmUI3c6WigX2/9\r\n0lan7Qi9bqF2ZzHNsQJAeyiq21084T9XNoqInoiBSCfWpqYqNK45qwBbktqJEz22\r\nshQluCz31kX0gGgE54hprJGkY/Ryq2g8Sk2XyREwcA==\r\n-----END RSA PRIVATE KEY-----\r\n',
                cert: '-----BEGIN CERTIFICATE-----\r\nMIICKTCCAZICCQDpQ20Tsi+iMDANBgkqhkiG9w0BAQUFADBZMQswCQYDVQQGEwJB\r\nVTETMBEGA1UECBMKU29tZS1TdGF0ZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0\r\ncyBQdHkgTHRkMRIwEAYDVQQDEwlsb2NhbGhvc3QwHhcNMTQwMzE3MTM1MzMxWhcN\r\nMTQwNDE2MTM1MzMxWjBZMQswCQYDVQQGEwJBVTETMBEGA1UECBMKU29tZS1TdGF0\r\nZTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMRIwEAYDVQQDEwls\r\nb2NhbGhvc3QwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAMD2N+TDbLNTJ9zX\r\nm8QLMYxlPbB8zg7mXKhsUf9nesY16vE8jCYPLGU4KrlwTz8rwU25o2b02RsQJJf1\r\nZHvLJRMbyRftwboeHDUgKwTlEpZr/u4gkhq7nXtDk3oDbMEzhgsIB7BBmF2/h9g0\r\nLPe+xO7IbOcPmkBHtsh8IdHqVuUFAgMBAAEwDQYJKoZIhvcNAQEFBQADgYEAbs6+\r\nswTx03uGJfihujLC7sUiTmv9rFOTiqgElhK0R3Pft4nbWL1Jhn4twUwCa+csCDEA\r\nroItaeKZAC5zUGA4uXn1R0dZdOdLOff7998zSY3V5/cMAUYFztqSJjvqllDXxAmF\r\n30HHOMhiXQI1Wm0pqKlgzGCBt0fObgSaob9Zqbs=\r\n-----END CERTIFICATE-----\r\n'
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