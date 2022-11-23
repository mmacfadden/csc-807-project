import {expect} from 'chai';
import {ValueRange} from "../../src/ope/ValueRange";

describe('ValueRange', () => {
  describe('constructor', () => {
    it('Throw if start > end', () => {
      expect(() => {
        new ValueRange(10, 5);
      }).to.throw();
    });

    it('Correctly set start', () => {
      const vr = new ValueRange(10, 20);
      expect(vr.start).to.eq(10);
    });

    it('Correctly set end', () => {
      const vr = new ValueRange(10, 20);
      expect(vr.end).to.eq(20);
    });
  });

  describe('toString', () => {
    it('returns a string with correct values', () => {
      const vr = new ValueRange(10, 20);
      const str = vr.toString();
      expect(str.indexOf("ValueRange") >= 0).to.be.true;
      expect(str.indexOf("10") >= 0).to.be.true;
      expect(str.indexOf("20") >= 0).to.be.true;
    });
  });

  describe('toJSON', () => {
    it('returns a correct JSON Object', () => {
      const vr = new ValueRange(10, 20);
      expect(vr.toJSON()).to.deep.eq({start: 10, end: 20});
    });
  });

  describe('equals', () => {
    it('returns true for an equal ranges', () => {
      const vr1 = new ValueRange(10, 20);
      const vr2 = new ValueRange(10, 20);

      expect(vr1.equals(vr2)).to.be.true;
    });

    it('returns false for an unequal ends', () => {
      const vr1 = new ValueRange(10, 20);
      const vr2 = new ValueRange(10, 21);

      expect(vr1.equals(vr2)).to.be.false;
    });

    it('returns false for an unequal starts', () => {
      const vr1 = new ValueRange(10, 20);
      const vr2 = new ValueRange(11, 20);

      expect(vr1.equals(vr2)).to.be.false;
    });

  });

  describe('size', () => {
    it('returns the correct sie', () => {
      const vr = new ValueRange(10, 20);
      expect(vr.size()).to.eq(11);
    });
  });

  describe('set start', () => {
    it('properly updates the start', () => {
      const vr = new ValueRange(10, 20);
      vr.start = 11;
      expect(vr.start).to.eq(11);
    });

    it('throws if start is not a number', () => {
      const vr = new ValueRange(10, 20);
      expect(() => vr.start = null as any as number).to.throw();
    });
  });

  describe('set end', () => {
    it('properly updates the end', () => {
      const vr = new ValueRange(10, 20);
      vr.end = 11;
      expect(vr.end).to.eq(11);
    });

    it('throws if end is not a number', () => {
      const vr = new ValueRange(10, 20);
      expect(() => vr.end = null as any as number).to.throw();
    });
  });

  describe('rangeBitSize', () => {
    it('properly updates the end', () => {
      const vr = new ValueRange(1, 16);
      expect(vr.rangeBitSize()).to.eq(4);
    });
  });

  describe('copy', () => {
    it('creates a copy with the correct values', () => {
      const vr = new ValueRange(1, 16);
      const copy = vr.copy();
      expect(copy.start).to.eq(vr.start);
      expect(copy.end).to.eq(vr.end);
    });
  });
});