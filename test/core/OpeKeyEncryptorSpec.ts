import {expect} from 'chai';
import "fake-indexeddb/auto";
import {OpeKeyEncryptor} from "../../src/core/OpeKeyEncryptor";
import {OpeEncryptor} from "../../src/ope/OpeEncryptor";

const KEY = "an ope key";

describe('OpeKeyEncryptor', () => {

  describe('constructor', () => {
    it( "does not throw", () => {
     const ope = new OpeEncryptor(KEY);
     const ke = new OpeKeyEncryptor(ope);
    });
  });


  describe('encryptSingleKey', () => {
    it( "encrypts a string", () => {
      const ope = new OpeEncryptor(KEY);
      const p = new OpeKeyEncryptor(ope);
      const value = "a string";
      const encrypted = p.encryptSingleKey(value);
      expect(encrypted).to.not.eq(value);
      expect(encrypted instanceof Uint8Array).to.be.true;
    });

    it( "encrypts a number", () => {
      const ope = new OpeEncryptor(KEY);
      const p = new OpeKeyEncryptor(ope);
      const value = 10;
      const encrypted = p.encryptSingleKey(value);
      expect(encrypted).to.not.eq(value);
      expect(encrypted instanceof Uint8Array).to.be.true;
    });

    it( "encrypts a date", () => {
      const ope = new OpeEncryptor(KEY);
      const p = new OpeKeyEncryptor(ope);
      const value = new Date();
      const encrypted = p.encryptSingleKey(value);
      expect(encrypted).to.not.eq(value);
      expect(encrypted instanceof Uint8Array).to.be.true;
    });

    it( "encrypts a buffer", () => {
      const ope = new OpeEncryptor(KEY);
      const p = new OpeKeyEncryptor(ope);
      const value = Uint8Array.of(1, 2, 3)
      const encrypted = p.encryptSingleKey(value.buffer);
      expect(encrypted).to.not.deep.eq(value);
      expect(encrypted instanceof Uint8Array).to.be.true;
    });

    it( "encrypts a buffer source", () => {
      const ope = new OpeEncryptor(KEY);
      const p = new OpeKeyEncryptor(ope);
      const value = Uint8Array.of(1, 2, 3)
      const encrypted = p.encryptSingleKey(value);
      expect(encrypted).to.not.deep.eq(value);
      expect(encrypted instanceof Uint8Array).to.be.true;
    });

    it( "throws for an unknown key type", () => {
      const ope = new OpeEncryptor(KEY);
      const p = new OpeKeyEncryptor(ope);

      expect (() => p.encryptSingleKey(false as any as number)).to.throw();
    });
  });
});