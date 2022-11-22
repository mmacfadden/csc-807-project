import {expect} from 'chai';
import {EncryptionConfigManager, IEncryptionConfig} from '../../src/';
import {InMemoryStorage} from "../../src/test/InMemoryStorage";

const CONFIG: IEncryptionConfig = {
  moduleId: "some module",
  moduleParams: {},
  dataSecret: "secret",
  opeKey: "a key",
  userDbPrefix: "prefix"
}

Object.freeze(CONFIG);

const user1 = "user1";

describe('EncryptionConfigManager', () => {

  describe('constructor', () => {
    it('Newly constructed storage should be empty', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(configManager.configSet(user1)).to.be.false;
    });
  });

  describe('openConfig', () => {
    it('throws if the username is not set', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.openConfig(undefined as any as string, "password")).to.throw();
    });

    it('throws if the username is an empty string', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.openConfig("", "password")).to.throw();
    });

    it('throws if the password is not set', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.openConfig(user1, undefined as any as string)).to.throw();
    });

    it('throws if the password is an empty string', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.openConfig(user1, "")).to.throw();
    });

    it('throws if the password is incorrect', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      configManager
          .openConfig(user1, "password")
          .setConfig(CONFIG);
      expect(() => configManager.openConfig(user1, "wrong")).to.throw();
    });
  });

  describe('changePassword', () => {
    it('throws if the username is not set', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.changePassword(undefined as any as string, "currentPassword", "newPassword")).to.throw();
    });

    it('throws if the currentPassword is not set', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.changePassword(user1, undefined as any as string, "newPassword")).to.throw();
    });

    it('throws if the newPassword is not set', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.changePassword(user1,"currentPassword", undefined as any as string)).to.throw();
    });

    it('throws if the currentPassword is incorrect', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      configManager
          .openConfig(user1, "password")
          .setConfig(CONFIG);
      expect(() => configManager.changePassword(user1,"wrong", "new")).to.throw();
    });

    it('Changes the password if the currentPassword is correct.', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      configManager
          .openConfig(user1, "password")
          .setConfig(CONFIG);
      configManager.changePassword(user1,"password", "newPassword")
      const read = configManager
          .openConfig(user1, "newPassword")
          .getConfig();
      expect(read).to.deep.equal(CONFIG);
    });
  });
});