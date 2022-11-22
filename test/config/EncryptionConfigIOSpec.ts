import {expect} from 'chai';
import {EncryptionConfigIO, IEncryptionConfig} from '../../src/';
import {InMemoryStorage} from "../../src/test/InMemoryStorage";
import * as CryptoJS from "crypto-js";

const CONFIG: IEncryptionConfig = {
  moduleId: "some module",
  moduleParams: {},
  dataSecret: "secret",
  opeKey: "a key",
  userDbPrefix: "prefix"
}

Object.freeze(CONFIG);

const user1 = "user1";
const prefix = "prefix";
const password = "password";
const salt = "salt";

const keyAsWordArray = CryptoJS.PBKDF2(password, salt, {keySize: 256 / 32});
const key = CryptoJS.enc.Base64.stringify(keyAsWordArray);

describe('EncryptionConfigIO', () => {

  describe('configSetForUser', () => {
    it('returns false when the config is not set', () => {
      const storage = new InMemoryStorage();
      expect(EncryptionConfigIO.configSetForUser(storage, prefix, user1)).to.be.false;
    });

    it('returns true when the config is not set', () => {
      const storage = new InMemoryStorage();
      const io = new EncryptionConfigIO(storage, prefix, user1, key);
      io.setConfig(CONFIG);
      expect(EncryptionConfigIO.configSetForUser(storage, prefix, user1)).to.be.true;
    });
  });

  describe('constructor', () => {
    it('throws if the storage is not set', () => {
      expect(() => {
        new EncryptionConfigIO(null as any as Storage, prefix, user1, key);
      }).to.throw();
    });

    it('throws if the prefix is not set', () => {
      const storage = new InMemoryStorage();
      expect(() => {
        new EncryptionConfigIO(storage, "", user1, key);
      }).to.throw();
    });

    it('throws if the username is not set', () => {
      const storage = new InMemoryStorage();
      expect(() => {
        new EncryptionConfigIO(storage, prefix, "", key);
      }).to.throw();
    });

    it('throws if the key is not set', () => {
      const storage = new InMemoryStorage();
      expect(() => {
        new EncryptionConfigIO(storage, prefix, user1, "");
      }).to.throw();
    });
  });

  describe('getConfig', () => {
    it('throws if the key is not correct', () => {
      const storage = new InMemoryStorage();
      new EncryptionConfigIO(storage, prefix, user1, key).setConfig(CONFIG);
      const io = new EncryptionConfigIO(storage, prefix, user1, "bad key");
      expect(() => io.getConfig()).to.throw();
    });

    it('throws if the config is not set', () => {
      const storage = new InMemoryStorage();
      const io = new EncryptionConfigIO(storage, prefix, user1, key);
      expect(() => io.getConfig()).to.throw();
    });
  });

  describe('setConfig', () => {
    it('throws if the config is not set', () => {
      const storage = new InMemoryStorage();
      const io = new EncryptionConfigIO(storage, prefix, user1, key);
      expect(() => io.setConfig(undefined as any as IEncryptionConfig)).to.throw();
    });

    it('returns true when the config is not set', () => {
      const storage = new InMemoryStorage();
      const io = new EncryptionConfigIO(storage, prefix, user1, key);
      io.setConfig(CONFIG);
      const read = io.getConfig();

      expect(read).to.deep.equal(CONFIG);
    });
  });

  describe('configSet', () => {
    it('returns false when the config is not set', () => {
      const storage = new InMemoryStorage();
      const io = new EncryptionConfigIO(storage, prefix, user1, key);
      expect(io.configSet()).to.be.false;
    });

    it('returns true when the config is not set', () => {
      const storage = new InMemoryStorage();
      const io = new EncryptionConfigIO(storage, prefix, user1, key);
      io.setConfig(CONFIG);
      expect(io.configSet()).to.be.true;
    });
  });

  describe('validate', () => {
    it('does not throw if the config is not set', () => {
      const storage = new InMemoryStorage();
      const io = new EncryptionConfigIO(storage, prefix, user1, key);
      io.validate();
    });

    it('throws if the config is set with another key', () => {
      const storage = new InMemoryStorage();
      new EncryptionConfigIO(storage, prefix, user1, key).setConfig(CONFIG);
      const io = new EncryptionConfigIO(storage, prefix, user1, "bad key");
      expect(() => io.validate()).to.throw();
    });
  });
});