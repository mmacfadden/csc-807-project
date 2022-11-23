import {expect} from 'chai';
import {KeyPathUtil} from '../../src/';

describe('KeyPathUtil', () => {
  describe('getKey', () => {
    it('returns a string for >= 0.', () => {
      expect(KeyPathUtil.getKey(0)).to.be.a("string");
    });

    it('throws for a negative key index.', () => {
      expect(() => KeyPathUtil.getKey(-1)).to.throw();
    });
  });

  describe('mapKeyPath', () => {
    it('properly map a string', () => {
      const keyPath = "test";
      const mapped = KeyPathUtil.mapKeyPath(keyPath);
      expect(mapped).to.be.a("string");
    });

    it('properly map an array', () => {
      const keyPath = ["a", "b"];
      const mapped = KeyPathUtil.mapKeyPath(keyPath);
      expect(Array.isArray(mapped)).to.be.true;
      expect(mapped?.length).to.eq(2);
    });

    it('properly map null', () => {
      const keyPath = null;
      const mapped = KeyPathUtil.mapKeyPath(keyPath);
      expect(mapped).to.be.null;
    });

    it('throw on an invalid type', () => {
      const keyPath = 10;

      expect(() => KeyPathUtil.mapKeyPath(keyPath as any as string)).to.throw();
    });
  });
});