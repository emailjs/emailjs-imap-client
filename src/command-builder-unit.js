import {
  buildSTORECommand,
  buildFETCHCommand,
  buildXOAuth2Token,
  buildSEARCHCommand
} from './command-builder'

describe('buildFETCHCommand', () => {
  it('should build single ALL', () => {
    expect(buildFETCHCommand('1:*', ['all'], {})).to.deep.equal({
      command: 'FETCH',
      attributes: [{
        type: 'SEQUENCE',
        value: '1:*'
      }, {
        type: 'ATOM',
        value: 'ALL'
      }]
    })
  })

  it('should build FETCH with uid', () => {
    expect(buildFETCHCommand('1:*', ['all'], {
      byUid: true
    })).to.deep.equal({
      command: 'UID FETCH',
      attributes: [{
        type: 'SEQUENCE',
        value: '1:*'
      }, {
        type: 'ATOM',
        value: 'ALL'
      }]
    })
  })

  it('should build FETCH with uid, envelope', () => {
    expect(buildFETCHCommand('1:*', ['uid', 'envelope'], {})).to.deep.equal({
      command: 'FETCH',
      attributes: [{
        type: 'SEQUENCE',
        value: '1:*'
      },
      [{
        type: 'ATOM',
        value: 'UID'
      }, {
        type: 'ATOM',
        value: 'ENVELOPE'
      }]
      ]
    })
  })

  it('should build FETCH with modseq', () => {
    expect(buildFETCHCommand('1:*', ['modseq (1234567)'], {})).to.deep.equal({
      command: 'FETCH',
      attributes: [{
        type: 'SEQUENCE',
        value: '1:*'
      },
      [{
        type: 'ATOM',
        value: 'MODSEQ'
      },
      [{
        type: 'ATOM',
        value: '1234567'
      }]
      ]
      ]
    })
  })

  it('should build FETCH with section', () => {
    expect(buildFETCHCommand('1:*', ['body[text]'], {})).to.deep.equal({
      command: 'FETCH',
      attributes: [{
        type: 'SEQUENCE',
        value: '1:*'
      }, {
        type: 'ATOM',
        value: 'BODY',
        section: [{
          type: 'ATOM',
          value: 'TEXT'
        }]
      }]
    })
  })

  it('should build FETCH with section and list', () => {
    expect(buildFETCHCommand('1:*', ['body[header.fields (date in-reply-to)]'], {})).to.deep.equal({
      command: 'FETCH',
      attributes: [{
        type: 'SEQUENCE',
        value: '1:*'
      }, {
        type: 'ATOM',
        value: 'BODY',
        section: [{
          type: 'ATOM',
          value: 'HEADER.FIELDS'
        },
        [{
          type: 'ATOM',
          value: 'DATE'
        }, {
          type: 'ATOM',
          value: 'IN-REPLY-TO'
        }]
        ]
      }]
    })
  })

  it('should build FETCH with ', () => {
    expect(buildFETCHCommand('1:*', ['all'], {
      changedSince: '123456'
    })).to.deep.equal({
      command: 'FETCH',
      attributes: [{
        type: 'SEQUENCE',
        value: '1:*'
      }, {
        type: 'ATOM',
        value: 'ALL'
      },
      [{
        type: 'ATOM',
        value: 'CHANGEDSINCE'
      }, {
        type: 'ATOM',
        value: '123456'
      }]
      ]
    })
  })

  it('should build FETCH with partial', () => {
    expect(buildFETCHCommand('1:*', ['body[]'], {})).to.deep.equal({
      command: 'FETCH',
      attributes: [{
        type: 'SEQUENCE',
        value: '1:*'
      }, {
        type: 'ATOM',
        value: 'BODY',
        section: []
      }]
    })
  })

  it('should build FETCH with the valueAsString option', () => {
    expect(buildFETCHCommand('1:*', ['body[]'], { valueAsString: false })).to.deep.equal({
      command: 'FETCH',
      attributes: [{
        type: 'SEQUENCE',
        value: '1:*'
      }, {
        type: 'ATOM',
        value: 'BODY',
        section: []
      }],
      valueAsString: false
    })
  })
})

describe('#_buildXOAuth2Token', () => {
  it('should return base64 encoded XOAUTH2 token', () => {
    expect(buildXOAuth2Token('user@host', 'abcde')).to.equal('dXNlcj11c2VyQGhvc3QBYXV0aD1CZWFyZXIgYWJjZGUBAQ==')
  })
})

describe('buildSEARCHCommand', () => {
  it('should compose a search command', () => {
    expect(buildSEARCHCommand({
      unseen: true,
      header: ['subject', 'hello world'],
      or: {
        unseen: true,
        seen: true
      },
      not: {
        seen: true
      },
      sentbefore: new Date(2011, 1, 3, 12, 0, 0),
      since: new Date(2011, 11, 23, 12, 0, 0),
      uid: '1:*',
      'X-GM-MSGID': '1499257647490662970',
      'X-GM-THRID': '1499257647490662971'
    }, {})).to.deep.equal({
      command: 'SEARCH',
      attributes: [{
        type: 'atom',
        value: 'UNSEEN'
      }, {
        type: 'atom',
        value: 'HEADER'
      }, {
        type: 'string',
        value: 'subject'
      }, {
        type: 'string',
        value: 'hello world'
      }, {
        type: 'atom',
        value: 'OR'
      }, {
        type: 'atom',
        value: 'UNSEEN'
      }, {
        type: 'atom',
        value: 'SEEN'
      }, {
        type: 'atom',
        value: 'NOT'
      }, {
        type: 'atom',
        value: 'SEEN'
      }, {
        type: 'atom',
        value: 'SENTBEFORE'
      }, {
        type: 'atom',
        value: '3-Feb-2011'
      }, {
        type: 'atom',
        value: 'SINCE'
      }, {
        type: 'atom',
        value: '23-Dec-2011'
      }, {
        type: 'atom',
        value: 'UID'
      }, {
        type: 'sequence',
        value: '1:*'
      }, {
        type: 'atom',
        value: 'X-GM-MSGID'
      }, {
        type: 'number',
        value: '1499257647490662970'
      }, {
        type: 'atom',
        value: 'X-GM-THRID'
      }, {
        type: 'number',
        value: '1499257647490662971'
      }]
    })
  })

  it('should compose an unicode search command', () => {
    expect(buildSEARCHCommand({
      body: 'jõgeva'
    }, {})).to.deep.equal({
      command: 'SEARCH',
      attributes: [{
        type: 'atom',
        value: 'CHARSET'
      }, {
        type: 'atom',
        value: 'UTF-8'
      }, {
        type: 'atom',
        value: 'BODY'
      }, {
        type: 'literal',
        value: 'jÃµgeva'
      }]
    })
  })
})

describe('#_buildSTORECommand', () => {
  it('should compose a store command from an array', () => {
    expect(buildSTORECommand('1,2,3', 'FLAGS', ['a', 'b'], {})).to.deep.equal({
      command: 'STORE',
      attributes: [{
        type: 'sequence',
        value: '1,2,3'
      }, {
        type: 'atom',
        value: 'FLAGS'
      },
      [{
        type: 'atom',
        value: 'a'
      }, {
        type: 'atom',
        value: 'b'
      }]
      ]
    })
  })

  it('should compose a store set flags command', () => {
    expect(buildSTORECommand('1,2,3', 'FLAGS', ['a', 'b'], {})).to.deep.equal({
      command: 'STORE',
      attributes: [{
        type: 'sequence',
        value: '1,2,3'
      }, {
        type: 'atom',
        value: 'FLAGS'
      },
      [{
        type: 'atom',
        value: 'a'
      }, {
        type: 'atom',
        value: 'b'
      }]
      ]
    })
  })

  it('should compose a store add flags command', () => {
    expect(buildSTORECommand('1,2,3', '+FLAGS', ['a', 'b'], {})).to.deep.equal({
      command: 'STORE',
      attributes: [{
        type: 'sequence',
        value: '1,2,3'
      }, {
        type: 'atom',
        value: '+FLAGS'
      },
      [{
        type: 'atom',
        value: 'a'
      }, {
        type: 'atom',
        value: 'b'
      }]
      ]
    })
  })

  it('should compose a store remove flags command', () => {
    expect(buildSTORECommand('1,2,3', '-FLAGS', ['a', 'b'], {})).to.deep.equal({
      command: 'STORE',
      attributes: [{
        type: 'sequence',
        value: '1,2,3'
      }, {
        type: 'atom',
        value: '-FLAGS'
      },
      [{
        type: 'atom',
        value: 'a'
      }, {
        type: 'atom',
        value: 'b'
      }]
      ]
    })
  })

  it('should compose a store remove silent flags command', () => {
    expect(buildSTORECommand('1,2,3', '-FLAGS', ['a', 'b'], {
      silent: true
    })).to.deep.equal({
      command: 'STORE',
      attributes: [{
        type: 'sequence',
        value: '1,2,3'
      }, {
        type: 'atom',
        value: '-FLAGS.SILENT'
      },
      [{
        type: 'atom',
        value: 'a'
      }, {
        type: 'atom',
        value: 'b'
      }]
      ]
    })
  })

  it('should compose a uid store flags command', () => {
    expect(buildSTORECommand('1,2,3', 'FLAGS', ['a', 'b'], {
      byUid: true
    })).to.deep.equal({
      command: 'UID STORE',
      attributes: [{
        type: 'sequence',
        value: '1,2,3'
      }, {
        type: 'atom',
        value: 'FLAGS'
      },
      [{
        type: 'atom',
        value: 'a'
      }, {
        type: 'atom',
        value: 'b'
      }]
      ]
    })
  })
})
