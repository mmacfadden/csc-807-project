import "fake-indexeddb/auto";

import {expect} from "chai";
import {EncryptionModule, ModuleClearText} from "../../src";
import {EIDBEncryptor} from "../../src/core/EIDBEncryptor";
import {NoOpKeyEncryptor} from "../../src/core/NoOpKeyEncryptor";
import {EIDBKeyEncryptor} from "../../src/core/EIDBKeyEncryptor";



const MODULE = new ModuleClearText();
const KEY_PATH = "id";
const ENCRYPTOR = new NoOpKeyEncryptor();

function mockObject() {
  return {
    id: "1",
    name: "jim",
    age: 35
  }
}

describe('EIDBEncryptor', () => {
  describe('constructed', () => {
    it("constructs", () => {
     new EIDBEncryptor(MODULE, KEY_PATH, ENCRYPTOR);
    });

    it("throws if the encryptionModule is not defined", () => {
      expect(() => new EIDBEncryptor(undefined as any as EncryptionModule, KEY_PATH, ENCRYPTOR)).to.throw();
    });

    it("throws if the keyEncryptor is not defined", () => {
      expect(() => new EIDBEncryptor(MODULE, KEY_PATH, undefined as any as EIDBKeyEncryptor)).to.throw();
    });
  });

  describe('encrypt', () => {
    it("encrypts with a keyPath", () => {
      const encryptor = new EIDBEncryptor(MODULE, KEY_PATH, ENCRYPTOR);
      const value = mockObject();
      const encrypted = encryptor.encrypt(value);
      expect(encrypted).to.not.be.undefined;
      expect(encrypted).to.not.deep.eq(value);
      expect(encrypted.value).to.deep.eq(value);
      expect(encrypted.keys).to.deep.eq({k0: value.id});
    });

    it("encrypts with a null keyPath", () => {
      const encryptor = new EIDBEncryptor(MODULE, null, ENCRYPTOR);
      const value = mockObject();
      const encrypted = encryptor.encrypt(value);
      expect(encrypted).to.not.be.undefined;
      expect(encrypted).to.not.deep.eq(value);
      expect(encrypted.value).to.deep.eq(value);
      expect(encrypted.keys).to.deep.eq({})
    });

    it("throws if the keypath is not found", () => {
      const encryptor = new EIDBEncryptor(MODULE, "bar", ENCRYPTOR);
      const value = mockObject();
      expect(() => encryptor.encrypt(value)).to.throw();
    });
  });

  describe('decrypt', () => {
    it("decrypts an encrypted document", () => {
      const encryptor = new EIDBEncryptor(MODULE, KEY_PATH, ENCRYPTOR);
      const value = mockObject();
      const encrypted = encryptor.encrypt(value);
      const decrypted = encryptor.decrypt(encrypted)

      expect(decrypted).to.deep.eq(value);
    });
  });
});