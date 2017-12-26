import {
  buildFETCHCommand
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
