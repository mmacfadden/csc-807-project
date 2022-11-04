import {expect} from 'chai';
import {RandomStringGenerator} from '../../src/';

describe('RandomStringGenerator', () => {
  describe('generate', () => {
    it('Generates a string of the correct length', () => {
      expect(RandomStringGenerator.generate(10).length).to.eq(10);
    });

    it('Generates unique strings', () => {
      const str1 = RandomStringGenerator.generate(10);
      const str2 = RandomStringGenerator.generate(10);
      expect(str1).to.not.eq(str2);
    });

    it('Must not accept 0 length', () => {
      expect(() => RandomStringGenerator.generate(0)).to.throw();
    });

    it('Must not accept negative length', () => {
      expect(() => RandomStringGenerator.generate(-1)).to.throw();
    });
  });
});