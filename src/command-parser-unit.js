/* eslint-disable no-unused-expressions */
/* eslint-disable no-useless-escape */

import { parser } from 'emailjs-imap-handler'
import {
  parseAPPEND,
  parseCOPY,
  parseSEARCH,
  parseNAMESPACE,
  parseENVELOPE,
  parseSELECT,
  parseBODYSTRUCTURE,
  parseFETCH
} from './command-parser'
import { toTypedArray } from './common'
import testEnvelope from '../res/fixtures/envelope'
import mimeTorture from '../res/fixtures/mime-torture-bodystructure'

describe('parseNAMESPACE', () => {
  it('should not succeed for no namespace response', () => {
    expect(parseNAMESPACE({
      payload: {
        NAMESPACE: []
      }
    })).to.be.false
  })

  it('should return single personal namespace', () => {
    expect(parseNAMESPACE({
      payload: {
        NAMESPACE: [{
          attributes: [
            [
              [{
                type: 'STRING',
                value: 'INBOX.'
              }, {
                type: 'STRING',
                value: '.'
              }]
            ], null, null
          ]
        }]
      }
    })).to.deep.equal({
      personal: [{
        prefix: 'INBOX.',
        delimiter: '.'
      }],
      users: false,
      shared: false
    })
  })

  it('should return single personal, single users, multiple shared', () => {
    expect(parseNAMESPACE({
      payload: {
        NAMESPACE: [{
          attributes: [
            // personal
            [
              [{
                type: 'STRING',
                value: ''
              }, {
                type: 'STRING',
                value: '/'
              }]
            ],
            // users
            [
              [{
                type: 'STRING',
                value: '~'
              }, {
                type: 'STRING',
                value: '/'
              }]
            ],
            // shared
            [
              [{
                type: 'STRING',
                value: '#shared/'
              }, {
                type: 'STRING',
                value: '/'
              }],
              [{
                type: 'STRING',
                value: '#public/'
              }, {
                type: 'STRING',
                value: '/'
              }]
            ]
          ]
        }]
      }
    })).to.deep.equal({
      personal: [{
        prefix: '',
        delimiter: '/'
      }],
      users: [{
        prefix: '~',
        delimiter: '/'
      }],
      shared: [{
        prefix: '#shared/',
        delimiter: '/'
      }, {
        prefix: '#public/',
        delimiter: '/'
      }]
    })
  })

  it('should handle NIL namespace hierarchy delim', () => {
    expect(parseNAMESPACE({
      payload: {
        NAMESPACE: [
          // This specific value is returned by yahoo.co.jp's
          // imapgate version 0.7.68_11_1.61475 IMAP server
          parser(toTypedArray('* NAMESPACE (("" NIL)) NIL NIL'))
        ]
      }
    })).to.deep.equal({
      personal: [{
        prefix: '',
        delimiter: null
      }],
      users: false,
      shared: false
    })
  })
})

describe('parseSELECT', () => {
  it('should parse a complete response', () => {
    expect(parseSELECT({
      code: 'READ-WRITE',
      payload: {
        EXISTS: [{
          nr: 123
        }],
        FLAGS: [{
          attributes: [
            [{
              type: 'ATOM',
              value: '\\Answered'
            }, {
              type: 'ATOM',
              value: '\\Flagged'
            }]
          ]
        }],
        OK: [{
          code: 'PERMANENTFLAGS',
          permanentflags: ['\\Answered', '\\Flagged']
        }, {
          code: 'UIDVALIDITY',
          uidvalidity: '2'
        }, {
          code: 'UIDNEXT',
          uidnext: '38361'
        }, {
          code: 'HIGHESTMODSEQ',
          highestmodseq: '3682918'
        }]
      }
    })).to.deep.equal({
      exists: 123,
      flags: ['\\Answered', '\\Flagged'],
      highestModseq: '3682918',
      permanentFlags: ['\\Answered', '\\Flagged'],
      readOnly: false,
      uidNext: 38361,
      uidValidity: 2
    })
  })

  it('should parse response with no modseq', () => {
    expect(parseSELECT({
      code: 'READ-WRITE',
      payload: {
        EXISTS: [{
          nr: 123
        }],
        FLAGS: [{
          attributes: [
            [{
              type: 'ATOM',
              value: '\\Answered'
            }, {
              type: 'ATOM',
              value: '\\Flagged'
            }]
          ]
        }],
        OK: [{
          code: 'PERMANENTFLAGS',
          permanentflags: ['\\Answered', '\\Flagged']
        }, {
          code: 'UIDVALIDITY',
          uidvalidity: '2'
        }, {
          code: 'UIDNEXT',
          uidnext: '38361'
        }]
      }
    })).to.deep.equal({
      exists: 123,
      flags: ['\\Answered', '\\Flagged'],
      permanentFlags: ['\\Answered', '\\Flagged'],
      readOnly: false,
      uidNext: 38361,
      uidValidity: 2
    })
  })

  it('should parse response with read-only', () => {
    expect(parseSELECT({
      code: 'READ-ONLY',
      payload: {
        EXISTS: [{
          nr: 123
        }],
        FLAGS: [{
          attributes: [
            [{
              type: 'ATOM',
              value: '\\Answered'
            }, {
              type: 'ATOM',
              value: '\\Flagged'
            }]
          ]
        }],
        OK: [{
          code: 'PERMANENTFLAGS',
          permanentflags: ['\\Answered', '\\Flagged']
        }, {
          code: 'UIDVALIDITY',
          uidvalidity: '2'
        }, {
          code: 'UIDNEXT',
          uidnext: '38361'
        }]
      }
    })).to.deep.equal({
      exists: 123,
      flags: ['\\Answered', '\\Flagged'],
      permanentFlags: ['\\Answered', '\\Flagged'],
      readOnly: true,
      uidNext: 38361,
      uidValidity: 2
    })
  })

  it('should parse response with NOMODSEQ flag', () => {
    expect(parseSELECT({
      code: 'READ-WRITE',
      payload: {
        EXISTS: [{
          nr: 123
        }],
        FLAGS: [{
          attributes: [
            [{
              type: 'ATOM',
              value: '\\Answered'
            }, {
              type: 'ATOM',
              value: '\\Flagged'
            }]
          ]
        }],
        OK: [{
          code: 'PERMANENTFLAGS',
          permanentflags: ['\\Answered', '\\Flagged']
        }, {
          code: 'UIDVALIDITY',
          uidvalidity: '2'
        }, {
          code: 'UIDNEXT',
          uidnext: '38361'
        }, {
          code: 'NOMODSEQ'
        }]
      }
    })).to.deep.equal({
      exists: 123,
      flags: ['\\Answered', '\\Flagged'],
      permanentFlags: ['\\Answered', '\\Flagged'],
      readOnly: false,
      uidNext: 38361,
      uidValidity: 2,
      noModseq: true
    })
  })
})

describe('parseENVELOPE', () => {
  it('should parsed envelope object', () => {
    expect(parseENVELOPE(testEnvelope.source)).to.deep.equal(testEnvelope.parsed)
  })
})

describe('parseBODYSTRUCTURE', () => {
  it('should parse bodystructure object', () => {
    expect(parseBODYSTRUCTURE(mimeTorture.source)).to.deep.equal(mimeTorture.parsed)
  })

  it('should parse bodystructure with unicode filename', () => {
    var input = [
      [
        { type: 'STRING', value: 'APPLICATION' },
        { type: 'STRING', value: 'OCTET-STREAM' },
        null,
        null,
        null,
        { type: 'STRING', value: 'BASE64' },
        { type: 'ATOM', value: '40' },
        null,
        [
          { type: 'STRING', value: 'ATTACHMENT' },
          [
            { type: 'STRING', value: 'FILENAME' },
            { type: 'STRING', value: '=?ISO-8859-1?Q?BBR_Handel,_Gewerbe,_B=FCrobetriebe,?= =?ISO-8859-1?Q?_private_Bildungseinrichtungen.txt?=' }
          ]
        ],
        null
      ],
      { type: 'STRING', value: 'MIXED' },
      [
        { type: 'STRING', value: 'BOUNDARY' },
        { type: 'STRING', value: '----sinikael-?=_1-14105085265110.49903922458179295' }
      ],
      null,
      null
    ]

    var expected = {
      childNodes: [{
        part: '1',
        type: 'application/octet-stream',
        encoding: 'base64',
        size: 40,
        disposition: 'attachment',
        dispositionParameters: {
          filename: 'BBR Handel, Gewerbe, Bürobetriebe, private Bildungseinrichtungen.txt'
        }
      }],
      type: 'multipart/mixed',
      parameters: {
        boundary: '----sinikael-?=_1-14105085265110.49903922458179295'
      }
    }

    expect(parseBODYSTRUCTURE(input)).to.deep.equal(expected)
  })
})

describe('parseFETCH', () => {
  it('should return values lowercase keys', () => {
    expect(parseFETCH({
      payload: {
        FETCH: [{
          nr: 123,
          attributes: [
            [{
              type: 'ATOM',
              value: 'BODY',
              section: [{
                type: 'ATOM',
                value: 'HEADER'
              },
              [{
                type: 'ATOM',
                value: 'DATE'
              }, {
                type: 'ATOM',
                value: 'SUBJECT'
              }]
              ],
              partial: [0, 123]
            }, {
              type: 'ATOM',
              value: 'abc'
            }]
          ]
        }]
      }
    })).to.deep.equal([{
      '#': 123,
      'body[header (date subject)]<0.123>': 'abc'
    }])
  })

  it('should merge multiple responses based on sequence number', () => {
    expect(parseFETCH({
      payload: {
        FETCH: [{
          nr: 123,
          attributes: [
            [{
              type: 'ATOM',
              value: 'UID'
            }, {
              type: 'ATOM',
              value: 789
            }]
          ]
        }, {
          nr: 124,
          attributes: [
            [{
              type: 'ATOM',
              value: 'UID'
            }, {
              type: 'ATOM',
              value: 790
            }]
          ]
        }, {
          nr: 123,
          attributes: [
            [{
              type: 'ATOM',
              value: 'MODSEQ'
            }, {
              type: 'ATOM',
              value: '127'
            }]
          ]
        }]
      }
    })).to.deep.equal([{
      '#': 123,
      uid: 789,
      modseq: '127'
    }, {
      '#': 124,
      uid: 790
    }])
  })
})

describe('parseSEARCH', () => {
  it('should parse SEARCH response', () => {
    expect(parseSEARCH({
      payload: {
        SEARCH: [{
          attributes: [{
            value: 5
          }, {
            value: 7
          }]
        }, {
          attributes: [{
            value: 6
          }]
        }]
      }
    })).to.deep.equal([5, 6, 7])
  })

  it('should parse empty SEARCH response', () => {
    expect(parseSEARCH({
      payload: {
        SEARCH: [{
          command: 'SEARCH',
          tag: '*'
        }]
      }
    })).to.deep.equal([])
  })
})

describe('parseCOPY', () => {
  it('should parse COPY response', () => {
    expect(parseCOPY({
      copyuid: ['1', '1:3', '3,4,2']
    })).to.deep.equal({
      srcSeqSet: '1:3',
      destSeqSet: '3,4,2'
    })
  })

  it('should return undefined when response does not contain copyuid', () => {
    expect(parseCOPY({})).to.equal(undefined)
  })

  it('should return undefined when response is not defined', () => {
    expect(parseCOPY()).to.equal(undefined)
  })
})

describe('parseAPPEND', () => {
  it('should parse APPEND response', () => {
    expect(parseAPPEND({
      appenduid: ['1', '3']
    })).to.equal('3')
  })

  it('should return undefined when response does not contain copyuid', () => {
    expect(parseAPPEND({})).to.equal(undefined)
  })

  it('should return undefined when response is not defined', () => {
    expect(parseAPPEND()).to.equal(undefined)
  })
})
