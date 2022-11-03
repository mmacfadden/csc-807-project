import {expect} from 'chai';
import {EncryptionConfigManager, IEncryptionConfig} from '../../src/';
import {InMemoryStorage} from "../../src/test/InMemoryStorage";

const CONFIG: IEncryptionConfig = {
  moduleId: "some module",
  moduleParams: {},
  dataSecret: "secret",
  opeKey: "a key"
}

Object.freeze(CONFIG);

describe('EncryptionConfigManager', () => {

  describe('constructor', () => {
    it('Newly constructed storage should be empty', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(configManager.configSet()).to.be.false;
    });
  });

  describe('getConfig', () => {
    it('throws if the password is not set', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.getConfig(undefined as any as string)).to.throw();
    });

    it('throws if the password is an empty string', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.getConfig("")).to.throw();
    });

    it('throws if the config is not set', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.getConfig("password")).to.throw();
    });

    it('throws if the password is incorrect', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      configManager.setConfig(CONFIG, "password");
      expect(() => configManager.getConfig("wrong")).to.throw();
    });
  });

  describe('setConfig', () => {
    it('throws if the config is not set', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.setConfig(undefined as any as IEncryptionConfig, "password")).to.throw();
    });

    it('throws if the password is not set', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.setConfig(CONFIG, undefined as any as string)).to.throw();
    });

    it('throws if the password is an empty string', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.setConfig(CONFIG,"")).to.throw();
    });
  });

  describe('changePassword', () => {
    it('throws if the currentPassword is not set', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.changePassword(undefined as any as string, "newPassword")).to.throw();
    });

    it('throws if the newPassword is not set', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      expect(() => configManager.changePassword("currentPassword", undefined as any as string)).to.throw();
    });

    it('throws if the currentPassword is incorrect', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      configManager.setConfig(CONFIG, "password");
      expect(() => configManager.changePassword("wrong", "new")).to.throw();
    });

    it('Changes the password if the currentPassword is correct.', () => {
      const storage = new InMemoryStorage();
      const configManager = new EncryptionConfigManager(storage);
      configManager.setConfig(CONFIG, "password");
      configManager.changePassword("password", "newPassword")
      const read = configManager.getConfig("newPassword");
      expect(read ).to.deep.equal(CONFIG);
    });
  });
});