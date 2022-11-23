import {expect} from 'chai';
import {assert} from '../../src/util/assert';

describe('assert', () => {
  it('true should not throw', () => {
    assert(true, "");
  });

  it('false should not throw correct error', () => {
    expect(() => assert(false, "message")).to.throw();
  });
});