'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
    'use strict';

    return {
        source: [{
                value: '17-Jul-1996 02:44:25 -0700'
            }, {
                value: '=?utf-8?b?w7XDpMO2w7w=?='
            },
            [
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 1'
                    },
                    null, {
                        value: 'from.1'
                    }, {
                        value: 'host'
                    }
                ],
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 2'
                    },
                    null, {
                        value: 'from.2'
                    }, {
                        value: 'host'
                    }
                ]
            ],
            [
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 1'
                    },
                    null, {
                        value: 'sender.1'
                    }, {
                        value: 'host'
                    }
                ],
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 2'
                    },
                    null, {
                        value: 'sender.2'
                    }, {
                        value: 'host'
                    }
                ]
            ],
            [
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 1'
                    },
                    null, {
                        value: 'reply.to.1'
                    }, {
                        value: 'host'
                    }
                ],
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 2'
                    },
                    null, {
                        value: 'reply.to.2'
                    }, {
                        value: 'host'
                    }
                ],
                [{
                        value: ''
                    },
                    null, {
                        value: '"evil@attacker.com"'
                    }, {
                        value: 'victim.com'
                    }
                ],
                [{
                        value: 'Last, First'
                    },
                    null, {
                        value: 'first.last'
                    }, {
                        value: 'example.com'
                    }
                ]
            ],
            [
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 1'
                    },
                    null, {
                        value: 'to.1'
                    }, {
                        value: 'host'
                    }
                ],
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 2'
                    },
                    null, {
                        value: 'to.2'
                    }, {
                        value: 'host'
                    }
                ]
            ],
            [
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 1'
                    },
                    null, {
                        value: 'cc.1'
                    }, {
                        value: 'host'
                    }
                ],
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 2'
                    },
                    null, {
                        value: 'cc.2'
                    }, {
                        value: 'host'
                    }
                ]
            ],
            [
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 1'
                    },
                    null, {
                        value: 'bcc.1'
                    }, {
                        value: 'host'
                    }
                ],
                [{
                        value: '=?utf-8?b?w7XDpMO2w7w=?= 2'
                    },
                    null, {
                        value: 'bcc.2'
                    }, {
                        value: 'host'
                    }
                ]
            ], {
                value: 'replyid'
            }, {
                value: 'msgid'
            }
        ],
        parsed: {
            date: '17-Jul-1996 02:44:25 -0700',
            subject: 'õäöü',
            from: [{
                name: 'õäöü 1',
                address: 'from.1@host'
            }, {
                name: 'õäöü 2',
                address: 'from.2@host'
            }],
            sender: [{
                name: 'õäöü 1',
                address: 'sender.1@host'
            }, {
                name: 'õäöü 2',
                address: 'sender.2@host'
            }],
            'reply-to': [{
                name: 'õäöü 1',
                address: 'reply.to.1@host'
            }, {
                name: 'õäöü 2',
                address: 'reply.to.2@host'
            }, {
                name: '@victim.com',
                address: 'evil@attacker.com'
            }, {
                name: 'Last, First',
                address: 'first.last@example.com'
            }],
            to: [{
                name: 'õäöü 1',
                address: 'to.1@host'
            }, {
                name: 'õäöü 2',
                address: 'to.2@host'
            }],
            cc: [{
                name: 'õäöü 1',
                address: 'cc.1@host'
            }, {
                name: 'õäöü 2',
                address: 'cc.2@host'
            }],
            bcc: [{
                name: 'õäöü 1',
                address: 'bcc.1@host'
            }, {
                name: 'õäöü 2',
                address: 'bcc.2@host'
            }],
            'in-reply-to': 'replyid',
            'message-id': 'msgid'
        }
    };
});