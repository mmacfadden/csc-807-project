import {expect} from 'chai';
import {EncryptionConfigStorage, IEncryptionConfigData, ModuleClearText} from '../../src/';
import {InMemoryStorage} from "../../src/test/InMemoryStorage";

const DEFAULT_CONFIG: IEncryptionConfigData = {
  moduleId: "some module",
  moduleParams: {},
  dataSecret: "secret",
  opeKey: "a key",
  userDbPrefix: "prefix",
  databases: {
    "dbName": {
      objectStores: {
        "store": {
          keyPath: "key",
          indices: {}
        }
      }
    }
  }
};

Object.freeze(DEFAULT_CONFIG);

const user1 = "user1";
const password = "password";

describe('EncryptionConfigStorage', () => {
  describe('constructor', () => {
    it('Not throw with valid parameters', () => {
      const storage = new InMemoryStorage();
      new EncryptionConfigStorage(storage, user1);
    });

    it('throws if storage is not set', () => {
      expect(() => {
        new EncryptionConfigStorage(null as any as Storage, user1);
      }).to.throw();
    });

    it('throws if username is not set', () => {
      const storage = new InMemoryStorage();
      expect(() => {
        new EncryptionConfigStorage(storage, null as any as string);
      }).to.throw();
    });
  });

  describe('open', () => {
    it('successfully open with the default config, if not set.', () => {
      const storage = new InMemoryStorage();
      const configStorage = new EncryptionConfigStorage(storage, user1);
      configStorage.open(password, () => DEFAULT_CONFIG);
      const config = configStorage.getConfig();
      expect(config.toJSON()).to.deep.eq(DEFAULT_CONFIG);
    });

    it('reads the existing config, if it exists.', () => {
      const storage = new InMemoryStorage();
      const configStorage = new EncryptionConfigStorage(storage, user1);
      configStorage.open(password, () => DEFAULT_CONFIG);
      const config = configStorage.getConfig();
      config.addDatabaseConfig("test");
      configStorage.close();

      const readConfigStorage = new EncryptionConfigStorage(storage, user1);
      readConfigStorage.open(password, () => DEFAULT_CONFIG);
      const readConfig = readConfigStorage.getConfig();

      expect(config.toJSON()).to.deep.eq(readConfig.toJSON());
    });

    it('throws if the wrong password is wrong', () => {
      const storage = new InMemoryStorage();
      const cs = new EncryptionConfigStorage(storage, user1);
      cs.open(password, () => DEFAULT_CONFIG);
      cs.close();

      expect(() => {
        new EncryptionConfigStorage(storage, user1)
            .open("password2", () => DEFAULT_CONFIG);
      }).to.throw();
    });

    it('throws if the password is not set', () => {
      const storage = new InMemoryStorage();
      expect(() => {
        new EncryptionConfigStorage(storage, user1)
            .open("", () => DEFAULT_CONFIG);
      }).to.throw();
    });
  });

  describe('getConfig', () => {
    it('throws if not open', () => {
      const storage = new InMemoryStorage();
      expect(() => {
        new EncryptionConfigStorage(storage, user1).getConfig();
      }).to.throw();
    });
  });

  describe('username', () => {
    it('returns the correct username', () => {
      const storage = new InMemoryStorage();
      const cs = new EncryptionConfigStorage(storage, user1);
      expect(cs.username()).to.eq(user1);
    });
  });

  describe('close', () => {
    it('throws if not open', () => {
      const storage = new InMemoryStorage();
      const cs = new EncryptionConfigStorage(storage, user1);

      expect(() => {
        cs.close();
      }).to.throw();
    });

    it('closes if open', () => {
      const storage = new InMemoryStorage();
      const cs = new EncryptionConfigStorage(storage, user1);
      cs.open(password, () => DEFAULT_CONFIG);
      expect(cs.isOpen()).to.be.true;
      cs.close();
      expect(cs.isOpen()).to.be.false;
    });
  });

  describe('changePassword', () => {
    it('throws if the new password is not set', () => {
      const storage = new InMemoryStorage();
      const cs = new EncryptionConfigStorage(storage, user1);
      cs.open(password, () => DEFAULT_CONFIG);

      expect(() => {
        cs.changePassword(password, "");
      }).to.throw();
    });

    it('throws if the current password is not set', () => {
      const storage = new InMemoryStorage();
      const cs = new EncryptionConfigStorage(storage, user1);
      cs.open(password, () => DEFAULT_CONFIG);

      expect(() => {
        cs.changePassword("", "newPassword");
      }).to.throw();
    });

    it('throws if the current password is incorrect', () => {
      const storage = new InMemoryStorage();
      const cs = new EncryptionConfigStorage(storage, user1);
      cs.open(password, () => DEFAULT_CONFIG);

      expect(() => {
        cs.changePassword("wrong", "new");
      }).to.throw();
    });

    it('change the password if the current password is correct', () => {
      const storage = new InMemoryStorage();
      const cs = new EncryptionConfigStorage(storage, user1);
      cs.open(password, () => DEFAULT_CONFIG);
      cs.changePassword(password, "newPassword");

      new EncryptionConfigStorage(storage, user1)
          .open("newPassword", () => DEFAULT_CONFIG);
    });
  });

  describe('generateDefaultConfig', () => {
    it('generate a config with the correct module id', () => {
      const data = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      expect(data.moduleId).to.eq(ModuleClearText.MODULE_ID);
    });

    it('generate a valid config', () => {
      const data = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      expect(data.moduleId).to.eq(ModuleClearText.MODULE_ID);
      expect(data.dataSecret).to.be.a("string");
      expect(data.opeKey).to.be.a("string");
      expect(data.userDbPrefix).to.be.a("string");
      expect(data.databases).to.be.a("object");
      expect(data.moduleParams).to.be.undefined;
    });

    it('generate a config with module params if passed', () => {
      const params = {"key": "value"};
      const data = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID, params);
      expect(data.moduleParams).to.deep.eq(params);
    });

    it('throw for an invalid module id', () => {
      expect(() => {
        EncryptionConfigStorage.generateDefaultConfig("none");
      }).to.throw();
    });
  });

  describe('sessionStorage', () => {
    it('not throw with session storage passed in.', () => {
      const localStorage = new InMemoryStorage();
      const sessionStorage = new InMemoryStorage();
      const cs = new EncryptionConfigStorage(localStorage, user1, sessionStorage);
      expect(cs.username()).to.eq(user1);
    });

    it('Save and restore config from session', () => {
      const localStorage = new InMemoryStorage();
      const sessionStorage = new InMemoryStorage();
      const cs = new EncryptionConfigStorage(localStorage, user1, sessionStorage);

      cs.open("password", () => DEFAULT_CONFIG);
      const config = cs.getConfig();

      const restored = EncryptionConfigStorage.restoreFromSession(localStorage, sessionStorage);

      expect(restored?.getConfig().toJSON()).to.deep.eq(config.toJSON());
    });

    it('Save and restore config from session with a prefix set', () => {
      const localStorage = new InMemoryStorage();
      const sessionStorage = new InMemoryStorage();
      const cs = new EncryptionConfigStorage(localStorage, user1, sessionStorage, "prefix");

      cs.open("password", () => DEFAULT_CONFIG);
      const config = cs.getConfig();

      const restored = EncryptionConfigStorage.restoreFromSession(localStorage, sessionStorage, "prefix");

      expect(restored?.getConfig().toJSON()).to.deep.eq(config.toJSON());
    });

    it('return null if no session data exists', () => {
      const localStorage = new InMemoryStorage();
      const sessionStorage = new InMemoryStorage();
      const restored = EncryptionConfigStorage.restoreFromSession(localStorage, sessionStorage);
      expect(restored).to.be.null;
    });
  });

  it('close removes session', () => {
    const localStorage = new InMemoryStorage();
    const sessionStorage = new InMemoryStorage();
    const cs = new EncryptionConfigStorage(localStorage, user1, sessionStorage);

    cs.open("password", () => DEFAULT_CONFIG);
    const config = cs.getConfig();

    cs.close();

    expect(EncryptionConfigStorage.restoreFromSession(localStorage, sessionStorage)).to.be.null;
  });
});