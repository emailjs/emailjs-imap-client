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
                    'wo-addressparser/src/addressparser.js',
                    'axe-logger/axe.js',
                    'es6-promise/dist/es6-promise.js'
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
            secureConnection: false,
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
