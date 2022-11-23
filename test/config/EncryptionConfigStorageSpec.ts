import {expect} from 'chai';
import {EncryptionConfigStorage, IEncryptionConfigData} from '../../src/';
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
}

Object.freeze(DEFAULT_CONFIG);

const user1 = "user1";
const password = "password";

describe('EncryptionConfigStorage', () => {

  describe('constructor', () => {
    it('Not throw with valid parameters', () => {
      const storage = new InMemoryStorage();
      new EncryptionConfigStorage(storage, user1);
    });

    it('throw if storage is not set', () => {
      expect(() => {
        new EncryptionConfigStorage(null as any as Storage, user1);
      });
    });

    it('throw if username is not set', () => {
      const storage = new InMemoryStorage();
      expect(() => {
        new EncryptionConfigStorage(storage, null as any as string);
      });
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
      new EncryptionConfigStorage(storage, user1)
        .open(password, () => DEFAULT_CONFIG);

      expect(() => {
        new EncryptionConfigStorage(storage, user1)
            .open("password2", () => DEFAULT_CONFIG);
      }).to.throw();
    });


  });

  describe('changePassword', () => {

  });
});