'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
    // parsed BODYSTRUCTURE value from Ryan Finnie's MIME Torture Test v1.0
    return {
        source: [
            [{
                    type: 'STRING',
                    value: 'TEXT'
                }, {
                    type: 'STRING',
                    value: 'PLAIN'
                },
                [{
                    type: 'STRING',
                    value: 'CHARSET'
                }, {
                    type: 'STRING',
                    value: 'US-ASCII'
                }],
                null,
                null, {
                    type: 'STRING',
                    value: '8BIT'
                }, {
                    type: 'ATOM',
                    value: '617'
                }, {
                    type: 'ATOM',
                    value: '16'
                },
                null,
                null,
                null,
                null
            ],
            [{
                    type: 'STRING',
                    value: 'MESSAGE'
                }, {
                    type: 'STRING',
                    value: 'RFC822'
                },
                null,
                null, {
                    type: 'STRING',
                    value: 'I\'ll be whatever I wanna do. --Fry'
                }, {
                    type: 'STRING',
                    value: '7BIT'
                }, {
                    type: 'ATOM',
                    value: '582'
                },
                [{
                        type: 'STRING',
                        value: '23 Oct 2003 22:25:56 -0700'
                    }, {
                        type: 'STRING',
                        value: 'plain jane message'
                    },
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [
                            null,
                            null, {
                                type: 'STRING',
                                value: 'bob'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    null,
                    null,
                    null, {
                        type: 'STRING',
                        value: '<1066973156.4264.42.camel@localhost>'
                    }
                ],
                [{
                        type: 'STRING',
                        value: 'TEXT'
                    }, {
                        type: 'STRING',
                        value: 'PLAIN'
                    },
                    [{
                        type: 'STRING',
                        value: 'CHARSET'
                    }, {
                        type: 'STRING',
                        value: 'US-ASCII'
                    }],
                    null,
                    null, {
                        type: 'STRING',
                        value: '8BIT'
                    }, {
                        type: 'ATOM',
                        value: '311'
                    }, {
                        type: 'ATOM',
                        value: '9'
                    },
                    null,
                    null,
                    null,
                    null
                ], {
                    type: 'ATOM',
                    value: '18'
                },
                null, [{
                        type: 'STRING',
                        value: 'INLINE'
                    },
                    null
                ],
                null,
                null
            ],
            [{
                    type: 'STRING',
                    value: 'MESSAGE'
                }, {
                    type: 'STRING',
                    value: 'RFC822'
                },
                null,
                null, {
                    type: 'STRING',
                    value: 'Would you kindly shut your noise-hole? --Bender'
                }, {
                    type: 'STRING',
                    value: '7BIT'
                }, {
                    type: 'ATOM',
                    value: '1460'
                },
                [{
                        type: 'STRING',
                        value: '23 Oct 2003 23:15:11 -0700'
                    }, {
                        type: 'STRING',
                        value: 'messages inside messages inside...'
                    },
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [
                            null,
                            null, {
                                type: 'STRING',
                                value: 'bob'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    null,
                    null,
                    null, {
                        type: 'STRING',
                        value: '<1066976111.4263.74.camel@localhost>'
                    }
                ],
                [
                    [{
                            type: 'STRING',
                            value: 'TEXT'
                        }, {
                            type: 'STRING',
                            value: 'PLAIN'
                        },
                        [{
                            type: 'STRING',
                            value: 'CHARSET'
                        }, {
                            type: 'STRING',
                            value: 'US-ASCII'
                        }],
                        null,
                        null, {
                            type: 'STRING',
                            value: '8BIT'
                        }, {
                            type: 'ATOM',
                            value: '193'
                        }, {
                            type: 'ATOM',
                            value: '3'
                        },
                        null,
                        null,
                        null,
                        null
                    ],
                    [{
                            type: 'STRING',
                            value: 'MESSAGE'
                        }, {
                            type: 'STRING',
                            value: 'RFC822'
                        },
                        null,
                        null, {
                            type: 'STRING',
                            value: 'At the risk of sounding negative, no. --Leela'
                        }, {
                            type: 'STRING',
                            value: '7BIT'
                        }, {
                            type: 'ATOM',
                            value: '697'
                        },
                        [{
                                type: 'STRING',
                                value: '23 Oct 2003 23:09:05 -0700'
                            }, {
                                type: 'STRING',
                                value: 'the original message'
                            },
                            [
                                [{
                                        type: 'STRING',
                                        value: 'Ryan Finnie'
                                    },
                                    null, {
                                        type: 'STRING',
                                        value: 'rfinnie'
                                    }, {
                                        type: 'STRING',
                                        value: 'domain.dom'
                                    }
                                ]
                            ],
                            [
                                [{
                                        type: 'STRING',
                                        value: 'Ryan Finnie'
                                    },
                                    null, {
                                        type: 'STRING',
                                        value: 'rfinnie'
                                    }, {
                                        type: 'STRING',
                                        value: 'domain.dom'
                                    }
                                ]
                            ],
                            [
                                [{
                                        type: 'STRING',
                                        value: 'Ryan Finnie'
                                    },
                                    null, {
                                        type: 'STRING',
                                        value: 'rfinnie'
                                    }, {
                                        type: 'STRING',
                                        value: 'domain.dom'
                                    }
                                ]
                            ],
                            [
                                [
                                    null,
                                    null, {
                                        type: 'STRING',
                                        value: 'bob'
                                    }, {
                                        type: 'STRING',
                                        value: 'domain.dom'
                                    }
                                ]
                            ],
                            null,
                            null,
                            null, {
                                type: 'STRING',
                                value: '<1066975745.4263.70.camel@localhost>'
                            }
                        ],
                        [
                            [{
                                    type: 'STRING',
                                    value: 'TEXT'
                                }, {
                                    type: 'STRING',
                                    value: 'PLAIN'
                                },
                                [{
                                    type: 'STRING',
                                    value: 'CHARSET'
                                }, {
                                    type: 'STRING',
                                    value: 'US-ASCII'
                                }],
                                null,
                                null, {
                                    type: 'STRING',
                                    value: '8BIT'
                                }, {
                                    type: 'ATOM',
                                    value: '78'
                                }, {
                                    type: 'ATOM',
                                    value: '3'
                                },
                                null,
                                null,
                                null,
                                null
                            ],
                            [{
                                    type: 'STRING',
                                    value: 'APPLICATION'
                                }, {
                                    type: 'STRING',
                                    value: 'X-GZIP'
                                },
                                [{
                                    type: 'STRING',
                                    value: 'NAME'
                                }, {
                                    type: 'STRING',
                                    value: 'foo.gz'
                                }],
                                null,
                                null, {
                                    type: 'STRING',
                                    value: 'BASE64'
                                }, {
                                    type: 'ATOM',
                                    value: '58'
                                },
                                null, [{
                                        type: 'STRING',
                                        value: 'ATTACHMENT'
                                    },
                                    [{
                                        type: 'STRING',
                                        value: 'FILENAME'
                                    }, {
                                        type: 'STRING',
                                        value: 'foo.gz'
                                    }]
                                ],
                                null,
                                null
                            ], {
                                type: 'STRING',
                                value: 'MIXED'
                            },
                            [{
                                type: 'STRING',
                                value: 'BOUNDARY'
                            }, {
                                type: 'STRING',
                                value: '=-XFYecI7w+0shpolXq8bb'
                            }],
                            null,
                            null,
                            null
                        ], {
                            type: 'ATOM',
                            value: '25'
                        },
                        null, [{
                                type: 'STRING',
                                value: 'INLINE'
                            },
                            null
                        ],
                        null,
                        null
                    ], {
                        type: 'STRING',
                        value: 'MIXED'
                    },
                    [{
                        type: 'STRING',
                        value: 'BOUNDARY'
                    }, {
                        type: 'STRING',
                        value: '=-9Brg7LoMERBrIDtMRose'
                    }],
                    null,
                    null,
                    null
                ], {
                    type: 'ATOM',
                    value: '49'
                },
                null, [{
                        type: 'STRING',
                        value: 'INLINE'
                    },
                    null
                ],
                null,
                null
            ],
            [{
                    type: 'STRING',
                    value: 'MESSAGE'
                }, {
                    type: 'STRING',
                    value: 'RFC822'
                },
                null,
                null, {
                    type: 'STRING',
                    value: 'Dirt doesn\'t need luck! --Professor'
                }, {
                    type: 'STRING',
                    value: '7BIT'
                }, {
                    type: 'ATOM',
                    value: '817'
                },
                [{
                        type: 'STRING',
                        value: '23 Oct 2003 22:40:49 -0700'
                    }, {
                        type: 'STRING',
                        value: 'this message JUST contains an attachment'
                    },
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [
                            null,
                            null, {
                                type: 'STRING',
                                value: 'bob'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    null,
                    null,
                    null, {
                        type: 'STRING',
                        value: '<1066974048.4264.62.camel@localhost>'
                    }
                ],
                [{
                        type: 'STRING',
                        value: 'APPLICATION'
                    }, {
                        type: 'STRING',
                        value: 'X-GZIP'
                    },
                    [{
                        type: 'STRING',
                        value: 'NAME'
                    }, {
                        type: 'STRING',
                        value: 'blah.gz'
                    }],
                    null, {
                        type: 'STRING',
                        value: 'Attachment has identical content to above foo.gz'
                    }, {
                        type: 'STRING',
                        value: 'BASE64'
                    }, {
                        type: 'ATOM',
                        value: '396'
                    },
                    null, [{
                            type: 'STRING',
                            value: 'ATTACHMENT'
                        },
                        [{
                            type: 'STRING',
                            value: 'FILENAME'
                        }, {
                            type: 'STRING',
                            value: 'blah.gz'
                        }]
                    ],
                    null,
                    null
                ], {
                    type: 'ATOM',
                    value: '17'
                },
                null, [{
                        type: 'STRING',
                        value: 'INLINE'
                    },
                    null
                ],
                null,
                null
            ],
            [{
                    type: 'STRING',
                    value: 'MESSAGE'
                }, {
                    type: 'STRING',
                    value: 'RFC822'
                },
                null,
                null, {
                    type: 'STRING',
                    value: 'Hold still, I don\'t have good depth perception! --Leela'
                }, {
                    type: 'STRING',
                    value: '7BIT'
                }, {
                    type: 'ATOM',
                    value: '1045'
                },
                [{
                        type: 'STRING',
                        value: '23 Oct 2003 23:09:16 -0700'
                    }, {
                        type: 'STRING',
                        value: 'Attachment filename vs. name'
                    },
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [
                            null,
                            null, {
                                type: 'STRING',
                                value: 'bob'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    null,
                    null,
                    null, {
                        type: 'STRING',
                        value: '<1066975756.4263.70.camel@localhost>'
                    }
                ],
                [
                    [{
                            type: 'STRING',
                            value: 'TEXT'
                        }, {
                            type: 'STRING',
                            value: 'PLAIN'
                        },
                        [{
                            type: 'STRING',
                            value: 'CHARSET'
                        }, {
                            type: 'STRING',
                            value: 'US-ASCII'
                        }],
                        null,
                        null, {
                            type: 'STRING',
                            value: '8BIT'
                        }, {
                            type: 'ATOM',
                            value: '377'
                        }, {
                            type: 'ATOM',
                            value: '6'
                        },
                        null,
                        null,
                        null,
                        null
                    ],
                    [{
                            type: 'STRING',
                            value: 'APPLICATION'
                        }, {
                            type: 'STRING',
                            value: 'X-GZIP'
                        },
                        [{
                            type: 'STRING',
                            value: 'NAME'
                        }, {
                            type: 'STRING',
                            value: 'blah2.gz'
                        }],
                        null, {
                            type: 'STRING',
                            value: 'filename is blah1.gz, name is blah2.gz'
                        }, {
                            type: 'STRING',
                            value: 'BASE64'
                        }, {
                            type: 'ATOM',
                            value: '58'
                        },
                        null, [{
                                type: 'STRING',
                                value: 'ATTACHMENT'
                            },
                            [{
                                type: 'STRING',
                                value: 'FILENAME'
                            }, {
                                type: 'STRING',
                                value: 'blah1.gz'
                            }]
                        ],
                        null,
                        null
                    ], {
                        type: 'STRING',
                        value: 'MIXED'
                    },
                    [{
                        type: 'STRING',
                        value: 'BOUNDARY'
                    }, {
                        type: 'STRING',
                        value: '=-1066975756jd02'
                    }],
                    null,
                    null,
                    null
                ], {
                    type: 'ATOM',
                    value: '29'
                },
                null, [{
                        type: 'STRING',
                        value: 'INLINE'
                    },
                    null
                ],
                null,
                null
            ],
            [{
                    type: 'STRING',
                    value: 'MESSAGE'
                }, {
                    type: 'STRING',
                    value: 'RFC822'
                },
                null,
                null, {
                    type: 'STRING',
                    value: 'Hello little man.  I WILL DESTROY YOU! --Moro'
                }, {
                    type: 'STRING',
                    value: '7BIT'
                }, {
                    type: 'ATOM',
                    value: '1149'
                },
                [{
                        type: 'STRING',
                        value: '23 Oct 2003 23:09:21 -0700'
                    }, {
                        type: 'STRING',
                        value: 'No filename?  No problem!'
                    },
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [
                            null,
                            null, {
                                type: 'STRING',
                                value: 'bob'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    null,
                    null,
                    null, {
                        type: 'STRING',
                        value: '<1066975761.4263.70.camel@localhost>'
                    }
                ],
                [
                    [{
                            type: 'STRING',
                            value: 'TEXT'
                        }, {
                            type: 'STRING',
                            value: 'PLAIN'
                        },
                        [{
                            type: 'STRING',
                            value: 'CHARSET'
                        }, {
                            type: 'STRING',
                            value: 'US-ASCII'
                        }],
                        null,
                        null, {
                            type: 'STRING',
                            value: '8BIT'
                        }, {
                            type: 'ATOM',
                            value: '517'
                        }, {
                            type: 'ATOM',
                            value: '10'
                        },
                        null,
                        null,
                        null,
                        null
                    ],
                    [{
                            type: 'STRING',
                            value: 'APPLICATION'
                        }, {
                            type: 'STRING',
                            value: 'X-GZIP'
                        },
                        null,
                        null, {
                            type: 'STRING',
                            value: 'I\'m getting sick of witty things to say'
                        }, {
                            type: 'STRING',
                            value: 'BASE64'
                        }, {
                            type: 'ATOM',
                            value: '58'
                        },
                        null, [{
                                type: 'STRING',
                                value: 'ATTACHMENT'
                            },
                            null
                        ],
                        null,
                        null
                    ], {
                        type: 'STRING',
                        value: 'MIXED'
                    },
                    [{
                        type: 'STRING',
                        value: 'BOUNDARY'
                    }, {
                        type: 'STRING',
                        value: '=-1066975756jd03'
                    }],
                    null,
                    null,
                    null
                ], {
                    type: 'ATOM',
                    value: '33'
                },
                null, [{
                        type: 'STRING',
                        value: 'INLINE'
                    },
                    null
                ],
                null,
                null
            ],
            [{
                    type: 'STRING',
                    value: 'MESSAGE'
                }, {
                    type: 'STRING',
                    value: 'RFC822'
                },
                null,
                null, {
                    type: 'STRING',
                    value: 'Friends! Help! A guinea pig tricked me! --Zoidberg'
                }, {
                    type: 'STRING',
                    value: '7BIT'
                }, {
                    type: 'ATOM',
                    value: '896'
                },
                [{
                        type: 'STRING',
                        value: '23 Oct 2003 22:40:45 -0700'
                    }, {
                        type: 'STRING',
                        value: 'html and text, both inline'
                    },
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [
                            null,
                            null, {
                                type: 'STRING',
                                value: 'bob'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    null,
                    null,
                    null, {
                        type: 'STRING',
                        value: '<1066974044.4264.62.camel@localhost>'
                    }
                ],
                [
                    [{
                            type: 'STRING',
                            value: 'TEXT'
                        }, {
                            type: 'STRING',
                            value: 'HTML'
                        },
                        [{
                            type: 'STRING',
                            value: 'CHARSET'
                        }, {
                            type: 'STRING',
                            value: 'utf-8'
                        }],
                        null,
                        null, {
                            type: 'STRING',
                            value: '8BIT'
                        }, {
                            type: 'ATOM',
                            value: '327'
                        }, {
                            type: 'ATOM',
                            value: '11'
                        },
                        null,
                        null,
                        null,
                        null
                    ],
                    [{
                            type: 'STRING',
                            value: 'TEXT'
                        }, {
                            type: 'STRING',
                            value: 'PLAIN'
                        },
                        [{
                            type: 'STRING',
                            value: 'CHARSET'
                        }, {
                            type: 'STRING',
                            value: 'US-ASCII'
                        }],
                        null,
                        null, {
                            type: 'STRING',
                            value: '8BIT'
                        }, {
                            type: 'ATOM',
                            value: '61'
                        }, {
                            type: 'ATOM',
                            value: '2'
                        },
                        null,
                        null,
                        null,
                        null
                    ], {
                        type: 'STRING',
                        value: 'MIXED'
                    },
                    [{
                        type: 'STRING',
                        value: 'BOUNDARY'
                    }, {
                        type: 'STRING',
                        value: '=-ZCKMfHzvHMyK1iBu4kff'
                    }],
                    null,
                    null,
                    null
                ], {
                    type: 'ATOM',
                    value: '33'
                },
                null, [{
                        type: 'STRING',
                        value: 'INLINE'
                    },
                    null
                ],
                null,
                null
            ],
            [{
                    type: 'STRING',
                    value: 'MESSAGE'
                }, {
                    type: 'STRING',
                    value: 'RFC822'
                },
                null,
                null, {
                    type: 'STRING',
                    value: 'Smeesh! --Amy'
                }, {
                    type: 'STRING',
                    value: '7BIT'
                }, {
                    type: 'ATOM',
                    value: '642'
                },
                [{
                        type: 'STRING',
                        value: '23 Oct 2003 22:41:29 -0700'
                    }, {
                        type: 'STRING',
                        value: 'text and text, both inline'
                    },
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [
                            null,
                            null, {
                                type: 'STRING',
                                value: 'bob'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    null,
                    null,
                    null, {
                        type: 'STRING',
                        value: '<1066974089.4265.64.camel@localhost>'
                    }
                ],
                [
                    [{
                            type: 'STRING',
                            value: 'TEXT'
                        }, {
                            type: 'STRING',
                            value: 'PLAIN'
                        },
                        [{
                            type: 'STRING',
                            value: 'CHARSET'
                        }, {
                            type: 'STRING',
                            value: 'US-ASCII'
                        }],
                        null,
                        null, {
                            type: 'STRING',
                            value: '8BIT'
                        }, {
                            type: 'ATOM',
                            value: '62'
                        }, {
                            type: 'ATOM',
                            value: '2'
                        },
                        null,
                        null,
                        null,
                        null
                    ],
                    [{
                            type: 'STRING',
                            value: 'TEXT'
                        }, {
                            type: 'STRING',
                            value: 'PLAIN'
                        },
                        [{
                            type: 'STRING',
                            value: 'CHARSET'
                        }, {
                            type: 'STRING',
                            value: 'US-ASCII'
                        }],
                        null,
                        null, {
                            type: 'STRING',
                            value: '8BIT'
                        }, {
                            type: 'ATOM',
                            value: '68'
                        }, {
                            type: 'ATOM',
                            value: '2'
                        },
                        null,
                        null,
                        null,
                        null
                    ], {
                        type: 'STRING',
                        value: 'MIXED'
                    },
                    [{
                        type: 'STRING',
                        value: 'BOUNDARY'
                    }, {
                        type: 'STRING',
                        value: '=-pNc4wtlOIxs8RcX7H/AK'
                    }],
                    null,
                    null,
                    null
                ], {
                    type: 'ATOM',
                    value: '24'
                },
                null, [{
                        type: 'STRING',
                        value: 'INLINE'
                    },
                    null
                ],
                null,
                null
            ],
            [{
                    type: 'STRING',
                    value: 'MESSAGE'
                }, {
                    type: 'STRING',
                    value: 'RFC822'
                },
                null,
                null, {
                    type: 'STRING',
                    value: 'That\'s not a cigar. Uh... and it\'s not mine. --Hermes'
                }, {
                    type: 'STRING',
                    value: '7BIT'
                }, {
                    type: 'ATOM',
                    value: '1515'
                },
                [{
                        type: 'STRING',
                        value: '23 Oct 2003 22:39:17 -0700'
                    }, {
                        type: 'STRING',
                        value: 'HTML and...  HTML?'
                    },
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [
                            null,
                            null, {
                                type: 'STRING',
                                value: 'bob'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    null,
                    null,
                    null, {
                        type: 'STRING',
                        value: '<1066973957.4263.59.camel@localhost>'
                    }
                ],
                [
                    [{
                            type: 'STRING',
                            value: 'TEXT'
                        }, {
                            type: 'STRING',
                            value: 'HTML'
                        },
                        [{
                            type: 'STRING',
                            value: 'CHARSET'
                        }, {
                            type: 'STRING',
                            value: 'utf-8'
                        }],
                        null,
                        null, {
                            type: 'STRING',
                            value: '8BIT'
                        }, {
                            type: 'ATOM',
                            value: '824'
                        }, {
                            type: 'ATOM',
                            value: '22'
                        },
                        null,
                        null,
                        null,
                        null
                    ],
                    [{
                            type: 'STRING',
                            value: 'TEXT'
                        }, {
                            type: 'STRING',
                            value: 'HTML'
                        },
                        [{
                            type: 'STRING',
                            value: 'NAME'
                        }, {
                            type: 'STRING',
                            value: 'htmlfile.html'
                        }, {
                            type: 'STRING',
                            value: 'CHARSET'
                        }, {
                            type: 'STRING',
                            value: 'UTF-8'
                        }],
                        null,
                        null, {
                            type: 'STRING',
                            value: '8BIT'
                        }, {
                            type: 'ATOM',
                            value: '118'
                        }, {
                            type: 'ATOM',
                            value: '6'
                        },
                        null, [{
                                type: 'STRING',
                                value: 'ATTACHMENT'
                            },
                            [{
                                type: 'STRING',
                                value: 'FILENAME'
                            }, {
                                type: 'STRING',
                                value: 'htmlfile.html'
                            }]
                        ],
                        null,
                        null
                    ], {
                        type: 'STRING',
                        value: 'MIXED'
                    },
                    [{
                        type: 'STRING',
                        value: 'BOUNDARY'
                    }, {
                        type: 'STRING',
                        value: '=-zxh/IezwzZITiphpcbJZ'
                    }],
                    null,
                    null,
                    null
                ], {
                    type: 'ATOM',
                    value: '49'
                },
                null, [{
                        type: 'STRING',
                        value: 'INLINE'
                    },
                    null
                ],
                null,
                null
            ],
            [{
                    type: 'STRING',
                    value: 'MESSAGE'
                }, {
                    type: 'STRING',
                    value: 'RFC822'
                },
                null,
                null, {
                    type: 'STRING',
                    value: 'The spirit is willing, but the flesh is spongy, and    bruised. --Zapp'
                }, {
                    type: 'STRING',
                    value: '7BIT'
                }, {
                    type: 'ATOM',
                    value: '6643'
                },
                [{
                        type: 'STRING',
                        value: '23 Oct 2003 22:23:16 -0700'
                    }, {
                        type: 'STRING',
                        value: 'smiley!'
                    },
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [
                            null,
                            null, {
                                type: 'STRING',
                                value: 'bob'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    null,
                    null,
                    null, {
                        type: 'STRING',
                        value: '<1066972996.4264.39.camel@localhost>'
                    }
                ],
                [
                    [
                        [
                            [
                                [{
                                        type: 'STRING',
                                        value: 'TEXT'
                                    }, {
                                        type: 'STRING',
                                        value: 'PLAIN'
                                    },
                                    null,
                                    null,
                                    null, {
                                        type: 'STRING',
                                        value: 'QUOTED-PRINTABLE'
                                    }, {
                                        type: 'ATOM',
                                        value: '1606'
                                    }, {
                                        type: 'ATOM',
                                        value: '42'
                                    },
                                    null,
                                    null,
                                    null,
                                    null
                                ],
                                [{
                                        type: 'STRING',
                                        value: 'TEXT'
                                    }, {
                                        type: 'STRING',
                                        value: 'HTML'
                                    },
                                    [{
                                        type: 'STRING',
                                        value: 'CHARSET'
                                    }, {
                                        type: 'STRING',
                                        value: 'utf-8'
                                    }],
                                    null,
                                    null, {
                                        type: 'STRING',
                                        value: 'QUOTED-PRINTABLE'
                                    }, {
                                        type: 'ATOM',
                                        value: '2128'
                                    }, {
                                        type: 'ATOM',
                                        value: '54'
                                    },
                                    null,
                                    null,
                                    null,
                                    null
                                ], {
                                    type: 'STRING',
                                    value: 'ALTERNATIVE'
                                },
                                [{
                                    type: 'STRING',
                                    value: 'BOUNDARY'
                                }, {
                                    type: 'STRING',
                                    value: '=-dHujWM/Xizz57x/JOmDF'
                                }],
                                null,
                                null,
                                null
                            ],
                            [{
                                    type: 'STRING',
                                    value: 'IMAGE'
                                }, {
                                    type: 'STRING',
                                    value: 'PNG'
                                },
                                [{
                                    type: 'STRING',
                                    value: 'NAME'
                                }, {
                                    type: 'STRING',
                                    value: 'smiley-3.png'
                                }], {
                                    type: 'STRING',
                                    value: '<1066971953.4232.15.camel@localhost>'
                                },
                                null, {
                                    type: 'STRING',
                                    value: 'BASE64'
                                }, {
                                    type: 'ATOM',
                                    value: '1122'
                                },
                                null, [{
                                        type: 'STRING',
                                        value: 'ATTACHMENT'
                                    },
                                    [{
                                        type: 'STRING',
                                        value: 'FILENAME'
                                    }, {
                                        type: 'STRING',
                                        value: 'smiley-3.png'
                                    }]
                                ],
                                null,
                                null
                            ], {
                                type: 'STRING',
                                value: 'RELATED'
                            },
                            [{
                                type: 'STRING',
                                value: 'TYPE'
                            }, {
                                type: 'STRING',
                                value: 'multipart/alternative'
                            }, {
                                type: 'STRING',
                                value: 'BOUNDARY'
                            }, {
                                type: 'STRING',
                                value: '=-GpwozF9CQ7NdF+fd+vMG'
                            }],
                            null,
                            null,
                            null
                        ],
                        [{
                                type: 'STRING',
                                value: 'IMAGE'
                            }, {
                                type: 'STRING',
                                value: 'GIF'
                            },
                            [{
                                type: 'STRING',
                                value: 'NAME'
                            }, {
                                type: 'STRING',
                                value: 'dot.gif'
                            }],
                            null,
                            null, {
                                type: 'STRING',
                                value: 'BASE64'
                            }, {
                                type: 'ATOM',
                                value: '96'
                            },
                            null, [{
                                    type: 'STRING',
                                    value: 'ATTACHMENT'
                                },
                                [{
                                    type: 'STRING',
                                    value: 'FILENAME'
                                }, {
                                    type: 'STRING',
                                    value: 'dot.gif'
                                }]
                            ],
                            null,
                            null
                        ], {
                            type: 'STRING',
                            value: 'MIXED'
                        },
                        [{
                            type: 'STRING',
                            value: 'BOUNDARY'
                        }, {
                            type: 'STRING',
                            value: '=-CgV5jm9HAY9VbUlAuneA'
                        }],
                        null,
                        null,
                        null
                    ],
                    [{
                            type: 'STRING',
                            value: 'APPLICATION'
                        }, {
                            type: 'STRING',
                            value: 'PGP-SIGNATURE'
                        },
                        [{
                            type: 'STRING',
                            value: 'NAME'
                        }, {
                            type: 'STRING',
                            value: 'signature.asc'
                        }],
                        null, {
                            type: 'STRING',
                            value: 'This is a digitally signed message part'
                        }, {
                            type: 'STRING',
                            value: '7BIT'
                        }, {
                            type: 'ATOM',
                            value: '196'
                        },
                        null,
                        null,
                        null,
                        null
                    ], {
                        type: 'STRING',
                        value: 'SIGNED'
                    },
                    [{
                        type: 'STRING',
                        value: 'MICALG'
                    }, {
                        type: 'STRING',
                        value: 'pgp-sha1'
                    }, {
                        type: 'STRING',
                        value: 'PROTOCOL'
                    }, {
                        type: 'STRING',
                        value: 'application/pgp-signature'
                    }, {
                        type: 'STRING',
                        value: 'BOUNDARY'
                    }, {
                        type: 'STRING',
                        value: '=-vH3FQO9a8icUn1ROCoAi'
                    }],
                    null,
                    null,
                    null
                ], {
                    type: 'ATOM',
                    value: '177'
                },
                null, [{
                        type: 'STRING',
                        value: 'INLINE'
                    },
                    null
                ],
                null,
                null
            ],
            [{
                    type: 'STRING',
                    value: 'MESSAGE'
                }, {
                    type: 'STRING',
                    value: 'RFC822'
                },
                null,
                null, {
                    type: 'STRING',
                    value: 'Kittens give Morbo gas. --Morbo'
                }, {
                    type: 'STRING',
                    value: '7BIT'
                }, {
                    type: 'ATOM',
                    value: '3088'
                },
                [{
                        type: 'STRING',
                        value: '23 Oct 2003 22:32:37 -0700'
                    }, {
                        type: 'STRING',
                        value: 'the PROPER way to do alternative/related'
                    },
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'Ryan Finnie'
                            },
                            null, {
                                type: 'STRING',
                                value: 'rfinnie'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    [
                        [
                            null,
                            null, {
                                type: 'STRING',
                                value: 'bob'
                            }, {
                                type: 'STRING',
                                value: 'domain.dom'
                            }
                        ]
                    ],
                    null,
                    null,
                    null, {
                        type: 'STRING',
                        value: '<1066973557.4265.51.camel@localhost>'
                    }
                ],
                [
                    [{
                            type: 'STRING',
                            value: 'TEXT'
                        }, {
                            type: 'STRING',
                            value: 'PLAIN'
                        },
                        [{
                            type: 'STRING',
                            value: 'CHARSET'
                        }, {
                            type: 'STRING',
                            value: 'US-ASCII'
                        }],
                        null,
                        null, {
                            type: 'STRING',
                            value: '8BIT'
                        }, {
                            type: 'ATOM',
                            value: '863'
                        }, {
                            type: 'ATOM',
                            value: '22'
                        },
                        null,
                        null,
                        null,
                        null
                    ],
                    [
                        [{
                                type: 'STRING',
                                value: 'TEXT'
                            }, {
                                type: 'STRING',
                                value: 'HTML'
                            },
                            [{
                                type: 'STRING',
                                value: 'CHARSET'
                            }, {
                                type: 'STRING',
                                value: 'utf-8'
                            }],
                            null,
                            null, {
                                type: 'STRING',
                                value: '8BIT'
                            }, {
                                type: 'ATOM',
                                value: '1258'
                            }, {
                                type: 'ATOM',
                                value: '22'
                            },
                            null,
                            null,
                            null,
                            null
                        ],
                        [{
                                type: 'STRING',
                                value: 'IMAGE'
                            }, {
                                type: 'STRING',
                                value: 'GIF'
                            },
                            null, {
                                type: 'STRING',
                                value: '<1066973340.4232.46.camel@localhost>'
                            },
                            null, {
                                type: 'STRING',
                                value: 'BASE64'
                            }, {
                                type: 'ATOM',
                                value: '116'
                            },
                            null,
                            null,
                            null,
                            null
                        ], {
                            type: 'STRING',
                            value: 'RELATED'
                        },
                        [{
                            type: 'STRING',
                            value: 'BOUNDARY'
                        }, {
                            type: 'STRING',
                            value: '=-bFkxH1S3HVGcxi+o/5jG'
                        }],
                        null,
                        null,
                        null
                    ], {
                        type: 'STRING',
                        value: 'ALTERNATIVE'
                    },
                    [{
                        type: 'STRING',
                        value: 'TYPE'
                    }, {
                        type: 'STRING',
                        value: 'multipart/alternative'
                    }, {
                        type: 'STRING',
                        value: 'BOUNDARY'
                    }, {
                        type: 'STRING',
                        value: '=-tyGlQ9JvB5uvPWzozI+y'
                    }],
                    null,
                    null,
                    null
                ], {
                    type: 'ATOM',
                    value: '79'
                },
                null, [{
                        type: 'STRING',
                        value: 'INLINE'
                    },
                    null
                ],
                null,
                null
            ], {
                type: 'STRING',
                value: 'MIXED'
            },
            [{
                type: 'STRING',
                value: 'BOUNDARY'
            }, {
                type: 'STRING',
                value: '=-qYxqvD9rbH0PNeExagh1'
            }],
            null,
            null,
            null
        ],
        parsed: {
            childNodes: [{
                part: '1',
                type: 'text/plain',
                parameters: {
                    charset: 'US-ASCII'
                },
                encoding: '8bit',
                size: 617,
                lineCount: 16
            }, {
                part: '2',
                type: 'message/rfc822',
                description: 'I\'ll be whatever I wanna do. --Fry',
                encoding: '7bit',
                size: 582,
                envelope: {
                    date: '23 Oct 2003 22:25:56 -0700',
                    subject: 'plain jane message',
                    from: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    sender: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    'reply-to': [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    to: [{
                        name: '',
                        address: 'bob@domain.dom'
                    }],
                    'message-id': '<1066973156.4264.42.camel@localhost>'
                },
                childNodes: [{
                    part: '2',
                    type: 'text/plain',
                    parameters: {
                        charset: 'US-ASCII'
                    },
                    encoding: '8bit',
                    size: 311,
                    lineCount: 9
                }],
                lineCount: 18,
                disposition: 'inline'
            }, {
                part: '3',
                type: 'message/rfc822',
                description: 'Would you kindly shut your noise-hole? --Bender',
                encoding: '7bit',
                size: 1460,
                envelope: {
                    date: '23 Oct 2003 23:15:11 -0700',
                    subject: 'messages inside messages inside...',
                    from: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    sender: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    'reply-to': [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    to: [{
                        name: '',
                        address: 'bob@domain.dom'
                    }],
                    'message-id': '<1066976111.4263.74.camel@localhost>'
                },
                childNodes: [{
                    part: '3',
                    childNodes: [{
                        part: '3.1',
                        type: 'text/plain',
                        parameters: {
                            charset: 'US-ASCII'
                        },
                        encoding: '8bit',
                        size: 193,
                        lineCount: 3
                    }, {
                        part: '3.2',
                        type: 'message/rfc822',
                        description: 'At the risk of sounding negative, no. --Leela',
                        encoding: '7bit',
                        size: 697,
                        envelope: {
                            date: '23 Oct 2003 23:09:05 -0700',
                            subject: 'the original message',
                            from: [{
                                name: 'Ryan Finnie',
                                address: 'rfinnie@domain.dom'
                            }],
                            sender: [{
                                name: 'Ryan Finnie',
                                address: 'rfinnie@domain.dom'
                            }],
                            'reply-to': [{
                                name: 'Ryan Finnie',
                                address: 'rfinnie@domain.dom'
                            }],
                            to: [{
                                name: '',
                                address: 'bob@domain.dom'
                            }],
                            'message-id': '<1066975745.4263.70.camel@localhost>'
                        },
                        childNodes: [{
                            part: '3.2',
                            childNodes: [{
                                part: '3.2.1',
                                type: 'text/plain',
                                parameters: {
                                    charset: 'US-ASCII'
                                },
                                encoding: '8bit',
                                size: 78,
                                lineCount: 3
                            }, {
                                part: '3.2.2',
                                type: 'application/x-gzip',
                                parameters: {
                                    name: 'foo.gz'
                                },
                                encoding: 'base64',
                                size: 58,
                                disposition: 'attachment',
                                dispositionParameters: {
                                    filename: 'foo.gz'
                                }
                            }],
                            type: 'multipart/mixed',
                            parameters: {
                                boundary: '=-XFYecI7w+0shpolXq8bb'
                            }
                        }],
                        lineCount: 25,
                        disposition: 'inline'
                    }],
                    type: 'multipart/mixed',
                    parameters: {
                        boundary: '=-9Brg7LoMERBrIDtMRose'
                    }
                }],
                lineCount: 49,
                disposition: 'inline'
            }, {
                part: '4',
                type: 'message/rfc822',
                description: 'Dirt doesn\'t need luck! --Professor',
                encoding: '7bit',
                size: 817,
                envelope: {
                    date: '23 Oct 2003 22:40:49 -0700',
                    subject: 'this message JUST contains an attachment',
                    from: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    sender: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    'reply-to': [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    to: [{
                        name: '',
                        address: 'bob@domain.dom'
                    }],
                    'message-id': '<1066974048.4264.62.camel@localhost>'
                },
                childNodes: [{
                    part: '4',
                    type: 'application/x-gzip',
                    parameters: {
                        name: 'blah.gz'
                    },
                    description: 'Attachment has identical content to above foo.gz',
                    encoding: 'base64',
                    size: 396,
                    disposition: 'attachment',
                    dispositionParameters: {
                        filename: 'blah.gz'
                    }
                }],
                lineCount: 17,
                disposition: 'inline'
            }, {
                part: '5',
                type: 'message/rfc822',
                description: 'Hold still, I don\'t have good depth perception! --Leela',
                encoding: '7bit',
                size: 1045,
                envelope: {
                    date: '23 Oct 2003 23:09:16 -0700',
                    subject: 'Attachment filename vs. name',
                    from: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    sender: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    'reply-to': [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    to: [{
                        name: '',
                        address: 'bob@domain.dom'
                    }],
                    'message-id': '<1066975756.4263.70.camel@localhost>'
                },
                childNodes: [{
                    part: '5',
                    childNodes: [{
                        part: '5.1',
                        type: 'text/plain',
                        parameters: {
                            charset: 'US-ASCII'
                        },
                        encoding: '8bit',
                        size: 377,
                        lineCount: 6
                    }, {
                        part: '5.2',
                        type: 'application/x-gzip',
                        parameters: {
                            name: 'blah2.gz'
                        },
                        description: 'filename is blah1.gz, name is blah2.gz',
                        encoding: 'base64',
                        size: 58,
                        disposition: 'attachment',
                        dispositionParameters: {
                            filename: 'blah1.gz'
                        }
                    }],
                    type: 'multipart/mixed',
                    parameters: {
                        boundary: '=-1066975756jd02'
                    }
                }],
                lineCount: 29,
                disposition: 'inline'
            }, {
                part: '6',
                type: 'message/rfc822',
                description: 'Hello little man.  I WILL DESTROY YOU! --Moro',
                encoding: '7bit',
                size: 1149,
                envelope: {
                    date: '23 Oct 2003 23:09:21 -0700',
                    subject: 'No filename?  No problem!',
                    from: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    sender: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    'reply-to': [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    to: [{
                        name: '',
                        address: 'bob@domain.dom'
                    }],
                    'message-id': '<1066975761.4263.70.camel@localhost>'
                },
                childNodes: [{
                    part: '6',
                    childNodes: [{
                        part: '6.1',
                        type: 'text/plain',
                        parameters: {
                            charset: 'US-ASCII'
                        },
                        encoding: '8bit',
                        size: 517,
                        lineCount: 10
                    }, {
                        part: '6.2',
                        type: 'application/x-gzip',
                        description: 'I\'m getting sick of witty things to say',
                        encoding: 'base64',
                        size: 58,
                        disposition: 'attachment'
                    }],
                    type: 'multipart/mixed',
                    parameters: {
                        boundary: '=-1066975756jd03'
                    }
                }],
                lineCount: 33,
                disposition: 'inline'
            }, {
                part: '7',
                type: 'message/rfc822',
                description: 'Friends! Help! A guinea pig tricked me! --Zoidberg',
                encoding: '7bit',
                size: 896,
                envelope: {
                    date: '23 Oct 2003 22:40:45 -0700',
                    subject: 'html and text, both inline',
                    from: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    sender: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    'reply-to': [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    to: [{
                        name: '',
                        address: 'bob@domain.dom'
                    }],
                    'message-id': '<1066974044.4264.62.camel@localhost>'
                },
                childNodes: [{
                    part: '7',
                    childNodes: [{
                        part: '7.1',
                        type: 'text/html',
                        parameters: {
                            charset: 'utf-8'
                        },
                        encoding: '8bit',
                        size: 327,
                        lineCount: 11
                    }, {
                        part: '7.2',
                        type: 'text/plain',
                        parameters: {
                            charset: 'US-ASCII'
                        },
                        encoding: '8bit',
                        size: 61,
                        lineCount: 2
                    }],
                    type: 'multipart/mixed',
                    parameters: {
                        boundary: '=-ZCKMfHzvHMyK1iBu4kff'
                    }
                }],
                lineCount: 33,
                disposition: 'inline'
            }, {
                part: '8',
                type: 'message/rfc822',
                description: 'Smeesh! --Amy',
                encoding: '7bit',
                size: 642,
                envelope: {
                    date: '23 Oct 2003 22:41:29 -0700',
                    subject: 'text and text, both inline',
                    from: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    sender: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    'reply-to': [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    to: [{
                        name: '',
                        address: 'bob@domain.dom'
                    }],
                    'message-id': '<1066974089.4265.64.camel@localhost>'
                },
                childNodes: [{
                    part: '8',
                    childNodes: [{
                        part: '8.1',
                        type: 'text/plain',
                        parameters: {
                            charset: 'US-ASCII'
                        },
                        encoding: '8bit',
                        size: 62,
                        lineCount: 2
                    }, {
                        part: '8.2',
                        type: 'text/plain',
                        parameters: {
                            charset: 'US-ASCII'
                        },
                        encoding: '8bit',
                        size: 68,
                        lineCount: 2
                    }],
                    type: 'multipart/mixed',
                    parameters: {
                        boundary: '=-pNc4wtlOIxs8RcX7H/AK'
                    }
                }],
                lineCount: 24,
                disposition: 'inline'
            }, {
                part: '9',
                type: 'message/rfc822',
                description: 'That\'s not a cigar. Uh... and it\'s not mine. --Hermes',
                encoding: '7bit',
                size: 1515,
                envelope: {
                    date: '23 Oct 2003 22:39:17 -0700',
                    subject: 'HTML and...  HTML?',
                    from: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    sender: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    'reply-to': [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    to: [{
                        name: '',
                        address: 'bob@domain.dom'
                    }],
                    'message-id': '<1066973957.4263.59.camel@localhost>'
                },
                childNodes: [{
                    part: '9',
                    childNodes: [{
                        part: '9.1',
                        type: 'text/html',
                        parameters: {
                            charset: 'utf-8'
                        },
                        encoding: '8bit',
                        size: 824,
                        lineCount: 22
                    }, {
                        part: '9.2',
                        type: 'text/html',
                        parameters: {
                            name: 'htmlfile.html',
                            charset: 'UTF-8'
                        },
                        encoding: '8bit',
                        size: 118,
                        lineCount: 6,
                        disposition: 'attachment',
                        dispositionParameters: {
                            filename: 'htmlfile.html'
                        }
                    }],
                    type: 'multipart/mixed',
                    parameters: {
                        boundary: '=-zxh/IezwzZITiphpcbJZ'
                    }
                }],
                lineCount: 49,
                disposition: 'inline'
            }, {
                part: '10',
                type: 'message/rfc822',
                description: 'The spirit is willing, but the flesh is spongy, and    bruised. --Zapp',
                encoding: '7bit',
                size: 6643,
                envelope: {
                    date: '23 Oct 2003 22:23:16 -0700',
                    subject: 'smiley!',
                    from: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    sender: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    'reply-to': [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    to: [{
                        name: '',
                        address: 'bob@domain.dom'
                    }],
                    'message-id': '<1066972996.4264.39.camel@localhost>'
                },
                childNodes: [{
                    part: '10',
                    childNodes: [{
                        part: '10.1',
                        childNodes: [{
                            part: '10.1.1',
                            childNodes: [{
                                part: '10.1.1.1',
                                childNodes: [{
                                    part: '10.1.1.1.1',
                                    type: 'text/plain',
                                    encoding: 'quoted-printable',
                                    size: 1606,
                                    lineCount: 42
                                }, {
                                    part: '10.1.1.1.2',
                                    type: 'text/html',
                                    parameters: {
                                        charset: 'utf-8'
                                    },
                                    encoding: 'quoted-printable',
                                    size: 2128,
                                    lineCount: 54
                                }],
                                type: 'multipart/alternative',
                                parameters: {
                                    boundary: '=-dHujWM/Xizz57x/JOmDF'
                                }
                            }, {
                                part: '10.1.1.2',
                                type: 'image/png',
                                parameters: {
                                    name: 'smiley-3.png'
                                },
                                id: '<1066971953.4232.15.camel@localhost>',
                                encoding: 'base64',
                                size: 1122,
                                disposition: 'attachment',
                                dispositionParameters: {
                                    filename: 'smiley-3.png'
                                }
                            }],
                            type: 'multipart/related',
                            parameters: {
                                type: 'multipart/alternative',
                                boundary: '=-GpwozF9CQ7NdF+fd+vMG'
                            }
                        }, {
                            part: '10.1.2',
                            type: 'image/gif',
                            parameters: {
                                name: 'dot.gif'
                            },
                            encoding: 'base64',
                            size: 96,
                            disposition: 'attachment',
                            dispositionParameters: {
                                filename: 'dot.gif'
                            }
                        }],
                        type: 'multipart/mixed',
                        parameters: {
                            boundary: '=-CgV5jm9HAY9VbUlAuneA'
                        }
                    }, {
                        part: '10.2',
                        type: 'application/pgp-signature',
                        parameters: {
                            name: 'signature.asc'
                        },
                        description: 'This is a digitally signed message part',
                        encoding: '7bit',
                        size: 196
                    }],
                    type: 'multipart/signed',
                    parameters: {
                        micalg: 'pgp-sha1',
                        protocol: 'application/pgp-signature',
                        boundary: '=-vH3FQO9a8icUn1ROCoAi'
                    }
                }],
                lineCount: 177,
                disposition: 'inline'
            }, {
                part: '11',
                type: 'message/rfc822',
                description: 'Kittens give Morbo gas. --Morbo',
                encoding: '7bit',
                size: 3088,
                envelope: {
                    date: '23 Oct 2003 22:32:37 -0700',
                    subject: 'the PROPER way to do alternative/related',
                    from: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    sender: [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    'reply-to': [{
                        name: 'Ryan Finnie',
                        address: 'rfinnie@domain.dom'
                    }],
                    to: [{
                        name: '',
                        address: 'bob@domain.dom'
                    }],
                    'message-id': '<1066973557.4265.51.camel@localhost>'
                },
                childNodes: [{
                    part: '11',
                    childNodes: [{
                        part: '11.1',
                        type: 'text/plain',
                        parameters: {
                            charset: 'US-ASCII'
                        },
                        encoding: '8bit',
                        size: 863,
                        lineCount: 22
                    }, {
                        part: '11.2',
                        childNodes: [{
                            part: '11.2.1',
                            type: 'text/html',
                            parameters: {
                                charset: 'utf-8'
                            },
                            encoding: '8bit',
                            size: 1258,
                            lineCount: 22
                        }, {
                            part: '11.2.2',
                            type: 'image/gif',
                            id: '<1066973340.4232.46.camel@localhost>',
                            encoding: 'base64',
                            size: 116
                        }],
                        type: 'multipart/related',
                        parameters: {
                            boundary: '=-bFkxH1S3HVGcxi+o/5jG'
                        }
                    }],
                    type: 'multipart/alternative',
                    parameters: {
                        type: 'multipart/alternative',
                        boundary: '=-tyGlQ9JvB5uvPWzozI+y'
                    }
                }],
                lineCount: 79,
                disposition: 'inline'
            }],
            type: 'multipart/mixed',
            parameters: {
                boundary: '=-qYxqvD9rbH0PNeExagh1'
            }
        }
    };
});