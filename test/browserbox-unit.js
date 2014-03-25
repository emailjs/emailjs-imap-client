define(['chai', 'sinon', 'browserbox', './fixtures/mime-torture-bodystructure'], function(chai, sinon, BrowserBox, mimeTorture) {
    'use strict';

    var expect = chai.expect;
    chai.Assertion.includeStack = true;

    describe('browserbox unit tests', function() {
        var br;

        beforeEach(function() {
            br = new BrowserBox();
        });

        afterEach(function() {});

        /* jshint indent:false */

        describe('#_checkSpecialUse', function() {
            it('should exist', function() {
                br.capability = ["SPECIAL-USE"];

                expect(br._checkSpecialUse({
                    flags: ["test", "\\All"]
                })).to.equal("\\All");

            });

            it('should fail for non-existent flag', function() {
                br.capability = ["SPECIAL-USE"];

                expect(false, br._checkSpecialUse({}));
            });

            it('should fail for invalid flag', function() {
                br.capability = ["SPECIAL-USE"];

                expect(br._checkSpecialUse({
                    flags: ["test"]
                })).to.be.false;
            });

            it('should fail when no extension is present', function() {
                expect(br._checkSpecialUse({
                    name: "test"
                })).to.be.false;
                expect(br._checkSpecialUse({
                    name: "Praht"
                })).to.equal("\\Trash");
            });
        });

        describe('#_parseNAMESPACE', function() {
            it('should not succeed for no namespace response', function() {
                expect(br._parseNAMESPACE({
                    payload: {
                        NAMESPACE: []
                    }
                })).to.be.false;
            });

            it('should return single personal namespace', function() {
                expect(br._parseNAMESPACE({
                    payload: {
                        NAMESPACE: [{
                            attributes: [
                                [
                                    [{
                                        type: "STRING",
                                        value: "INBOX."
                                    }, {
                                        type: "STRING",
                                        value: "."
                                    }]
                                ], null, null
                            ]
                        }]
                    }
                })).to.deep.equal({
                    personal: [{
                        prefix: "INBOX.",
                        delimiter: "."
                    }],
                    users: false,
                    shared: false
                });
            });

            it('should return single personal, single users, multiple shared', function() {
                expect(br._parseNAMESPACE({
                    payload: {
                        NAMESPACE: [{
                            attributes: [
                                // personal
                                [
                                    [{
                                        type: "STRING",
                                        value: ""
                                    }, {
                                        type: "STRING",
                                        value: "/"
                                    }]
                                ],
                                // users
                                [
                                    [{
                                        type: "STRING",
                                        value: "~"
                                    }, {
                                        type: "STRING",
                                        value: "/"
                                    }]
                                ],
                                // shared
                                [
                                    [{
                                        type: "STRING",
                                        value: "#shared/"
                                    }, {
                                        type: "STRING",
                                        value: "/"
                                    }],
                                    [{
                                        type: "STRING",
                                        value: "#public/"
                                    }, {
                                        type: "STRING",
                                        value: "/"
                                    }]
                                ]
                            ]
                        }]
                    }
                })).to.deep.equal({
                    personal: [{
                        prefix: "",
                        delimiter: "/"
                    }],
                    users: [{
                        prefix: "~",
                        delimiter: "/"
                    }],
                    shared: [{
                        prefix: "#shared/",
                        delimiter: "/"
                    }, {
                        prefix: "#public/",
                        delimiter: "/"
                    }]
                });

            });
        });

        describe('#_parseSELECT', function() {
            it('should parse a complete response', function() {
                expect(br._parseSELECT({
                    code: "READ-WRITE",
                    payload: {
                        EXISTS: [{
                            nr: 123
                        }],
                        FLAGS: [{
                            attributes: [
                                [{
                                    type: "ATOM",
                                    value: "\\Answered"
                                }, {
                                    type: "ATOM",
                                    value: "\\Flagged"
                                }]
                            ]
                        }],
                        OK: [{
                            code: "PERMANENTFLAGS",
                            permanentflags: ["\\Answered", "\\Flagged"]
                        }, {
                            code: "UIDVALIDITY",
                            uidvalidity: "2"
                        }, {
                            code: "UIDNEXT",
                            uidnext: "38361"
                        }, {
                            code: "HIGHESTMODSEQ",
                            highestmodseq: "3682918"
                        }]
                    }
                })).to.deep.equal({
                    exists: 123,
                    flags: ["\\Answered", "\\Flagged"],
                    highestModseq: 3682918,
                    permanentFlags: ["\\Answered", "\\Flagged"],
                    readOnly: false,
                    uidNext: 38361,
                    uidValidity: 2
                });
            });

            it('should parse response with ne modseq', function() {
                expect(br._parseSELECT({
                    code: "READ-WRITE",
                    payload: {
                        EXISTS: [{
                            nr: 123
                        }],
                        FLAGS: [{
                            attributes: [
                                [{
                                    type: "ATOM",
                                    value: "\\Answered"
                                }, {
                                    type: "ATOM",
                                    value: "\\Flagged"
                                }]
                            ]
                        }],
                        OK: [{
                            code: "PERMANENTFLAGS",
                            permanentflags: ["\\Answered", "\\Flagged"]
                        }, {
                            code: "UIDVALIDITY",
                            uidvalidity: "2"
                        }, {
                            code: "UIDNEXT",
                            uidnext: "38361"
                        }]
                    }
                })).to.deep.equal({
                    exists: 123,
                    flags: ["\\Answered", "\\Flagged"],
                    permanentFlags: ["\\Answered", "\\Flagged"],
                    readOnly: false,
                    uidNext: 38361,
                    uidValidity: 2
                });
            });

            it('should parse response with read-only', function() {
                expect(br._parseSELECT({
                    code: "READ-ONLY",
                    payload: {
                        EXISTS: [{
                            nr: 123
                        }],
                        FLAGS: [{
                            attributes: [
                                [{
                                    type: "ATOM",
                                    value: "\\Answered"
                                }, {
                                    type: "ATOM",
                                    value: "\\Flagged"
                                }]
                            ]
                        }],
                        OK: [{
                            code: "PERMANENTFLAGS",
                            permanentflags: ["\\Answered", "\\Flagged"]
                        }, {
                            code: "UIDVALIDITY",
                            uidvalidity: "2"
                        }, {
                            code: "UIDNEXT",
                            uidnext: "38361"
                        }]
                    }
                })).to.deep.equal({
                    exists: 123,
                    flags: ["\\Answered", "\\Flagged"],
                    permanentFlags: ["\\Answered", "\\Flagged"],
                    readOnly: true,
                    uidNext: 38361,
                    uidValidity: 2
                });
            });
        });

        describe('#_buildFETCHCommand', function() {
            it('should build single ALL', function() {
                expect(br._buildFETCHCommand("1:*", "all", {})).to.deep.equal({
                    command: "FETCH",
                    attributes: [{
                        type: "SEQUENCE",
                        value: "1:*"
                    }, {
                        type: "ATOM",
                        value: "ALL"
                    }]
                });
            });

            it('should build FETCH with uid', function() {
                expect(br._buildFETCHCommand("1:*", "all", {
                    byUid: true
                })).to.deep.equal({
                    command: "UID FETCH",
                    attributes: [{
                        type: "SEQUENCE",
                        value: "1:*"
                    }, {
                        type: "ATOM",
                        value: "ALL"
                    }]
                });
            });

            it('should build FETCH with uid, envelope', function() {
                expect(br._buildFETCHCommand("1:*", ["uid", "envelope"], {})).to.deep.equal({
                    command: "FETCH",
                    attributes: [{
                            type: "SEQUENCE",
                            value: "1:*"
                        },
                        [{
                            type: "ATOM",
                            value: "UID"
                        }, {
                            type: "ATOM",
                            value: "ENVELOPE"
                        }]
                    ]
                });
            });

            it('should build FETCH with modseq', function() {
                expect(br._buildFETCHCommand("1:*", ["modseq (1234567)"], {})).to.deep.equal({
                    command: "FETCH",
                    attributes: [{
                            type: "SEQUENCE",
                            value: "1:*"
                        },
                        [{
                                type: "ATOM",
                                value: "MODSEQ"
                            },
                            [{
                                type: "ATOM",
                                value: "1234567"
                            }]
                        ]
                    ]
                });
            });

            it('should build FETCH with section', function() {
                expect(br._buildFETCHCommand("1:*", "body[text]", {})).to.deep.equal({
                    command: "FETCH",
                    attributes: [{
                        type: "SEQUENCE",
                        value: "1:*"
                    }, {
                        type: "ATOM",
                        value: "BODY",
                        section: [{
                            type: "ATOM",
                            value: "TEXT"
                        }]
                    }]
                });
            });

            it('should build FETCH with section and list', function() {
                expect(br._buildFETCHCommand("1:*", "body[header.fields (date in-reply-to)]", {})).to.deep.equal({
                    command: "FETCH",
                    attributes: [{
                        type: "SEQUENCE",
                        value: "1:*"
                    }, {
                        type: "ATOM",
                        value: "BODY",
                        section: [{
                                type: "ATOM",
                                value: "HEADER.FIELDS"
                            },
                            [{
                                type: "ATOM",
                                value: "DATE"
                            }, {
                                type: "ATOM",
                                value: "IN-REPLY-TO"
                            }]
                        ]
                    }]
                });
            });

            it('should build FETCH with ', function() {
                expect(br._buildFETCHCommand("1:*", "all", {
                    changedSince: 123456
                })).to.deep.equal({
                    command: "FETCH",
                    attributes: [{
                            type: "SEQUENCE",
                            value: "1:*"
                        }, {
                            type: "ATOM",
                            value: "ALL"
                        },
                        [{
                                type: "ATOM",
                                value: "CHANGEDSINCE"
                            },
                            123456
                        ]
                    ]
                });
            });

            it('should build FETCH with partial', function() {
                expect(br._buildFETCHCommand("1:*", "body[]", {})).to.deep.equal({
                    command: "FETCH",
                    attributes: [{
                        type: "SEQUENCE",
                        value: "1:*"
                    }, {
                        type: "ATOM",
                        value: "BODY",
                        section: []
                    }]
                });
            });
        });

        describe('#_parseBODYSTRUCTURE', function() {
            it('should parse bodystructure object', function() {
                expect(br._parseBODYSTRUCTURE(mimeTorture.source)).to.deep.equal(mimeTorture.parsed);
            });
        });

        describe('untagged updates', function() {
            it('should receive information about untagged exists', function(done) {
                br.client._connectionReady = true;
                br.onupdate = function(type, value){
                    expect(type).to.equal('exists');
                    expect(value).to.equal(123);
                    done();
                };
                br.client._addToServerQueue('* 123 EXISTS');
            });

            it('should receive information about untagged expunge', function(done) {
                br.client._connectionReady = true;
                br.onupdate = function(type, value){
                    expect(type).to.equal('expunge');
                    expect(value).to.equal(456);
                    done();
                };
                br.client._addToServerQueue('* 456 EXPUNGE');
            });

            it('should receive information about untagged fetch', function(done) {
                br.client._connectionReady = true;
                br.onupdate = function(type, value){
                    expect(type).to.equal('fetch');
                    expect(value).to.deep.equal({
                        '#': 123,
                        'flags': ['\\Seen'],
                        'modseq': 4
                    });
                    done();
                };
                br.client._addToServerQueue('* 123 FETCH (FLAGS (\\Seen) MODSEQ (4))');
            });
        });

        describe('#_buildSEARCHCommand', function() {
            it('should compose a search command', function(){
                expect(br._buildSEARCHCommand({
                    unseen: true,
                    header: ["subject", "hello world"],
                    or: {
                        unseen: true,
                        seen: true
                    },
                    not: {
                        seen: true
                    },
                    sentbefore: new Date(2011, 1, 3, 12, 0, 0),
                    since: new Date(2011, 11, 23, 12, 0, 0)
                }, {})).to.deep.equal({
                    command: "SEARCH",
                    attributes: [
                        {"type":"atom","value":"UNSEEN"},
                        {"type":"atom","value":"HEADER"},
                        {"type":"string","value":"subject"},
                        {"type":"string","value":"hello world"},
                        {"type":"atom","value":"OR"},
                        {"type":"atom","value":"UNSEEN"},
                        {"type":"atom","value":"SEEN"},
                        {"type":"atom","value":"NOT"},
                        {"type":"atom","value":"SEEN"},
                        {"type":"atom","value":"SENTBEFORE"},
                        {"type":"string","value":"3-Feb-2011"},
                        {"type":"atom","value":"SINCE"},
                        {"type":"string","value":"23-Dec-2011"}
                    ]
                });
            });
        });

        /* jshint indent:false */

    });
});