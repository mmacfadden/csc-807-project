import {NoOpKeyEncryptor} from "../../src/core/NoOpKeyEncryptor";
import {expect} from "chai";
import "fake-indexeddb/auto";
import {IDBKeyRange} from "fake-indexeddb";

describe('MutableIDBRequest', () => {

  describe('constructor', () => {
    it( "Does not throw", () => {
      new NoOpKeyEncryptor();
    });
  });

  describe('encryptKey', () => {
    it( 'Handles a single element', () => {
      const enc = new NoOpKeyEncryptor();
      const key = "string";
      const encrypted = enc.encryptKey(key);
      expect(encrypted).to.eq(key);
    });

    it( 'Handles an array key', () => {
      const enc = new NoOpKeyEncryptor();
      const key = ["string1", "string2"];
      const encrypted = enc.encryptKey(key);
      expect(encrypted).to.deep.eq(key);
    });
  });

  describe('encryptSingleKey', () => {
    it( "correctly encrypts a single value", () => {
      const enc = new NoOpKeyEncryptor();
      const key = "string";
      const encrypted = enc.encryptSingleKey(key);
      expect(encrypted).to.eq(key);
    });
  });

  describe('encryptKeyOrRange', () => {
    it( 'Handles a single element', () => {
      const enc = new NoOpKeyEncryptor();
      const key = "string";
      const encrypted = enc.encryptKeyOrRange(key);
      expect(encrypted).to.eq(key);
    });

    it( 'Handles an array key', () => {
      const enc = new NoOpKeyEncryptor();
      const key = ["string1", "string2"];
      const encrypted = enc.encryptKeyOrRange(key);
      expect(encrypted).to.deep.eq(key);
    });

    it( 'Handles an null key', () => {
      const enc = new NoOpKeyEncryptor();
      const encrypted = enc.encryptKeyOrRange(null);
      expect(encrypted).to.be.undefined;
    });

    it( 'Handles an undefined key', () => {
      const enc = new NoOpKeyEncryptor();
      const encrypted = enc.encryptKeyOrRange(undefined);
      expect(encrypted).to.be.undefined;
    });

    it( 'Handles a range', () => {
      const enc = new NoOpKeyEncryptor();
      const range = IDBKeyRange.only("key");
      const encrypted = enc.encryptKeyOrRange(range) as IDBKeyRange;
      expect(encrypted.lower).to.eq(range.lower);
      expect(encrypted.upper).to.eq(range.upper);
      expect(encrypted.lowerOpen).to.eq(range.lowerOpen);
      expect(encrypted.upperOpen).to.eq(range.upperOpen);
    });
  });

  describe('encryptKeyOrRange', () => {
    it( 'throws on empty range', () => {
      const enc = new NoOpKeyEncryptor();
      const range = new IDBKeyRange();
      expect (() => enc.encryptKeyOrRange(range)).to.throw();
    });

    it( 'handle only ranges', () => {
      const enc = new NoOpKeyEncryptor();
      const range = IDBKeyRange.only("key");
      const encrypted = enc.encryptKeyOrRange(range) as IDBKeyRange;
      expect(encrypted.lower).to.eq(range.lower);
      expect(encrypted.upper).to.eq(range.upper);
      expect(encrypted.lowerOpen).to.eq(range.lowerOpen);
      expect(encrypted.upperOpen).to.eq(range.upperOpen);
    });

    it( 'handle lower ranges', () => {
      const enc = new NoOpKeyEncryptor();
      const range = IDBKeyRange.lowerBound("key", true);
      const encrypted = enc.encryptKeyOrRange(range) as IDBKeyRange;
      expect(encrypted.lower).to.eq(range.lower);
      expect(encrypted.upper).to.be.undefined
      expect(encrypted.lowerOpen).to.eq(range.lowerOpen);
      expect(encrypted.upperOpen).to.eq(range.upperOpen);
    });

    it( 'handle upper ranges', () => {
      const enc = new NoOpKeyEncryptor();
      const range = IDBKeyRange.upperBound("key", true);
      const encrypted = enc.encryptKeyOrRange(range) as IDBKeyRange;
      expect(encrypted.upper).to.eq(range.upper);
      expect(encrypted.lower).to.be.undefined
      expect(encrypted.upperOpen).to.eq(range.upperOpen);
      expect(encrypted.lowerOpen).to.eq(range.lowerOpen);
    });

  });

});