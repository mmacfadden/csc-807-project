import {expect} from 'chai';
import {EncryptionConfig, IEncryptionConfigData} from "../../src";
import sinon from "sinon";


function createConfig(): IEncryptionConfigData {
  return {
    moduleId: "some module",
    moduleParams: {"test": "value"},
    dataSecret: "secret",
    opeKey: "a key",
    userDbPrefix: "prefix",
    keyEncryption: "none",
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
}

describe('EncryptionConfig', () => {
  describe('constructor', () => {
    it('Not throw with valid parameters', () => {
      const defaultConfig = createConfig();
      const config = new EncryptionConfig(defaultConfig);

      expect(config.moduleId()).to.eq(defaultConfig.moduleId);
      expect(config.dataSecret()).to.eq(defaultConfig.dataSecret);
      expect(config.opeKey()).to.eq(defaultConfig.opeKey);
      expect(config.userDbPrefix()).to.eq(defaultConfig.userDbPrefix);
      expect(config.moduleParams()).to.deep.eq(defaultConfig.moduleParams);

      expect(config.toJSON()).to.deep.eq(defaultConfig);
    });

    it('throw if the config is not provide', () => {
      expect(() => {
        new EncryptionConfig(null as any);
      }).to.throw()
    });
  });

  describe('addDatabaseConfig', () => {
    it('Not throw with valid parameters', () => {
      const defaultConfig = createConfig();
      const update = sinon.spy();
      const config = new EncryptionConfig(defaultConfig, update);

      config.addDatabaseConfig("db2");
      expect(config.getDatabaseConfig("db2")).to.not.be.null;
      expect(update.called).to.be.true;
    });

    it('throw if the config already exists', () => {
      const defaultConfig = createConfig();
      const config = new EncryptionConfig(defaultConfig);

      expect(() => {
        config.addDatabaseConfig("dbName");
      }).to.throw()
    });
  });

  describe('getDatabaseConfig', () => {
    it('Not throw with valid parameters', () => {
      const defaultConfig = createConfig();

      const config = new EncryptionConfig(defaultConfig);
      const dbConfig = config.getDatabaseConfig("dbName");
      expect(dbConfig.toJSON()).to.deep.eq(defaultConfig.databases["dbName"]);
    });

    it('throw if the config does not exists', () => {
      const defaultConfig = createConfig();
      const config = new EncryptionConfig(defaultConfig);

      expect(() => {
        config.getDatabaseConfig("none");
      }).to.throw()
    });
  });

  describe('databaseConfigExists', () => {
    it('return true if a database config exists', () => {
      const defaultConfig = createConfig();
      const config = new EncryptionConfig(defaultConfig);
      expect(config.databaseConfigExists("dbName")).to.be.true;
    });

    it('return false if a database config exists', () => {
      const defaultConfig = createConfig();
      const config = new EncryptionConfig(defaultConfig);
      expect(config.databaseConfigExists("none")).to.be.false;
    });
  });

  describe('removeDatabaseConfig', () => {
    it('remove the database', () => {
      const defaultConfig = createConfig();
      const update = sinon.spy();
      const config = new EncryptionConfig(defaultConfig, update);
      config.removeDatabaseConfig("dbName");
      expect(config.toJSON().databases).to.deep.eq({});
      expect(update.called).to.be.true;
    });

    it('throw if the config does not exists', () => {
      const defaultConfig = createConfig();
      const config = new EncryptionConfig(defaultConfig);

      expect(() => {
        config.removeDatabaseConfig("none");
      }).to.throw()
    });
  });
});