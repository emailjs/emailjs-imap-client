/* eslint-disable no-unused-expressions */
/* eslint-disable no-useless-escape */

import {
  parseNAMESPACE,
  parseSELECT
} from './command-parser'
import { parser } from 'emailjs-imap-handler'
import { toTypedArray } from './common'

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
