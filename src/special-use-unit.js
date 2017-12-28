/* eslint-disable no-unused-expressions */
/* eslint-disable no-useless-escape */

import { checkSpecialUse } from './special-use'

describe('checkSpecialUse', () => {
  it('should return a matching special use flag', () => {
    expect(checkSpecialUse({
      flags: ['test', '\\All']
    })).to.equal('\\All')
  })

  it('should fail for non-existent flag', () => {
    expect(checkSpecialUse({})).to.be.false
  })

  it('should fail for invalid flag', () => {
    expect(checkSpecialUse({
      flags: ['test']
    })).to.be.false
  })

  it('should return special use flag if a matching name is found', () => {
    expect(checkSpecialUse({
      name: 'test'
    })).to.be.false
    expect(checkSpecialUse({
      name: 'Praht'
    })).to.equal('\\Trash')
    expect(checkSpecialUse({
      flags: ['\HasChildren'], // not a special use flag
      name: 'Praht'
    })).to.equal('\\Trash')
  })

  it('should prefer matching special use flag over a matching name', () => {
    expect(checkSpecialUse({
      flags: ['\\All'],
      name: 'Praht'
    })).to.equal('\\All')
  })
})
