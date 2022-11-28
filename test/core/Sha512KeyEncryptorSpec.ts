import {expect} from 'chai';
import "fake-indexeddb/auto";
import {Sha512KeyEncryptor} from "../../src/core/Sha512KeyEncryptor";

describe('Sha512KeyEncryptor', () => {
  describe('encryptSingleKey', () => {
    it('hashes the key', () => {
      const p = new Sha512KeyEncryptor();
      const key = "a key";
      const encrypted = p.encryptSingleKey(key);
      expect(encrypted).to.not.eq(key);
      expect(encrypted instanceof Uint8Array).to.be.true;
      expect(encrypted.byteLength).to.eq(64);
    });
  });
});