import {expect} from 'chai';
import {ObjectSizeCalculator} from "../../src";

describe('ObjectSizeCalculator', () => {

  describe('sizeOf', () => {
    it( "null returns zero", () => {
      expect(ObjectSizeCalculator.sizeOf(null)).to.eq(0);
    });

    it( "undefined returns zero", () => {
      expect(ObjectSizeCalculator.sizeOf(undefined)).to.eq(0);
    });

    it( "Date returns zero", () => {
      expect(ObjectSizeCalculator.sizeOf(new Date())).to.eq(8);
    });

    it( "Number returns zero", () => {
      expect(ObjectSizeCalculator.sizeOf(10)).to.eq(8);
    });

    it( "String returns length * 2", () => {
      expect(ObjectSizeCalculator.sizeOf("1234")).to.eq(8);
    });

    it( "Boolean returns 4", () => {
      expect(ObjectSizeCalculator.sizeOf(false)).to.eq(4);
    });

    it( "Array returns sum of elements", () => {
      expect(ObjectSizeCalculator.sizeOf([10, "1234"])).to.eq(16);
    });

    it( "Array returns sum of fields and keys", () => {
      expect(ObjectSizeCalculator.sizeOf({num: 10, str: "1234"})).to.eq(28);
    });

    it( "throws on unhandled type", () => {
      expect(() => ObjectSizeCalculator.sizeOf( Buffer.alloc(10))).to.throw();
    });
  });
});