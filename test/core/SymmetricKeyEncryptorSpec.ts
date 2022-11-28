import {expect} from 'chai';
import "fake-indexeddb/auto";
import {Sha512KeyEncryptor} from "../../src/core/Sha512KeyEncryptor";
import {SymmetricKeyEncryptor} from "../../src/core/SymmetricKeyEncryptor";

describe('SymmetricKeyEncryptor', () => {
  describe('constructor', () => {
    it('throws if a config is not supplied', () => {
      expect(() => new SymmetricKeyEncryptor("")).to.throw();
    });

    it('hashes the key', () => {
      const config = SymmetricKeyEncryptor.generateConfig();
      const p = new SymmetricKeyEncryptor(config);
      const key = "a key";
      const encrypted = p.encryptSingleKey(key);
      expect(encrypted).to.not.eq(key);
      expect(encrypted instanceof Uint8Array).to.be.true;
    });
  });

  describe('generateConfig', () => {
    it('produces a string', () => {
      const config = SymmetricKeyEncryptor.generateConfig();
      expect(config).to.be.a("string");
    });
  });
});