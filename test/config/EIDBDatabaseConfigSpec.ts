import {expect} from 'chai';
import {EIDBDatabaseConfig} from "../../src/config/EIDBDatabaseConfig";
import {IDatabaseConfigData} from "../../src";
import sinon from "sinon";

function createConfig(): IDatabaseConfigData {
  return {
    objectStores: {
      "store": {
        keyPath: "key",
        indices: {}
      }
    }
  }
}

describe('EIDBDatabaseConfig', () => {
  describe('constructor', () => {
    it('Not throw with valid parameters', () => {
      const defaultConfig = createConfig();
      const config = new EIDBDatabaseConfig(defaultConfig);
      expect(config.toJSON()).to.deep.eq(defaultConfig);
    });

    it('throw if the config is not provide', () => {
      expect(() => {
        new EIDBDatabaseConfig(null as any);
      }).to.throw()
    });
  });

  describe('addObjectStoreConfig', () => {
    it('Adds an object to the config', () => {
      const defaultConfig = createConfig();
      const config = new EIDBDatabaseConfig(defaultConfig);
      config.addObjectStoreConfig("store2", "key2");
      const expected = createConfig();
      expected.objectStores["store2"] = {
        keyPath: "key2",
        indices: {}
      }
      expect(config.toJSON()).to.deep.eq(expected);
    });

    it('throw if object store name is not defined', () => {
      const defaultConfig = createConfig();
      const config = new EIDBDatabaseConfig(defaultConfig);
      expect(() => {
        config.addObjectStoreConfig("", "key2");
      }).to.throw();
    });

    it('throw if object store name already exists', () => {
      const defaultConfig = createConfig();
      const config = new EIDBDatabaseConfig(defaultConfig);
      expect(() => {
        config.addObjectStoreConfig("store", "key2");
      }).to.throw();
    });

    it('calls updated', () => {
      const defaultConfig = createConfig();
      const update = sinon.spy();
      const config = new EIDBDatabaseConfig(defaultConfig, update);
      config.addObjectStoreConfig("store2", "key2");
      expect(update.called).to.be.true
    });
  });

  describe('deleteObjectStoreConfig', () => {
    it('deletes an existing object to the config', () => {
      const defaultConfig = createConfig();
      const config = new EIDBDatabaseConfig(defaultConfig);
      config.deleteObjectStoreConfig("store");
      const expected = createConfig();
      delete expected.objectStores["store"];
      expect(config.toJSON()).to.deep.eq(expected);
    });

    it('throw if object store name is not defined', () => {
      const defaultConfig = createConfig();
      const config = new EIDBDatabaseConfig(defaultConfig);
      expect(() => {
        config.deleteObjectStoreConfig("");
      }).to.throw();
    });

    it('throw if object store name does not exist', () => {
      const defaultConfig = createConfig();
      const config = new EIDBDatabaseConfig(defaultConfig);
      expect(() => {
        config.deleteObjectStoreConfig("store2");
      }).to.throw();
    });

    it('calls updated', () => {
      const defaultConfig = createConfig();
      const update = sinon.spy();
      const config = new EIDBDatabaseConfig(defaultConfig, update);
      config.deleteObjectStoreConfig("store");
      expect(update.called).to.be.true
    });
  });

  describe('getObjectStoreConfig', () => {
    it('gets the correct config', () => {
      const defaultConfig = createConfig();
      const config = new EIDBDatabaseConfig(defaultConfig);
      const read = config.getObjectStoreConfig("store");
      expect(read.toJSON()).to.deep.eq(defaultConfig.objectStores["store"]);
    });

    it('throw if object store name is not defined', () => {
      const defaultConfig = createConfig();
      const config = new EIDBDatabaseConfig(defaultConfig);
      expect(() => {
        config.getObjectStoreConfig("");
      }).to.throw();
    });

    it('throw if the config does not exist', () => {
      const defaultConfig = createConfig();
      const config = new EIDBDatabaseConfig(defaultConfig);
      expect(() => {
        config.getObjectStoreConfig("foo");
      }).to.throw();
    });
  });

  describe('getObjectStoreConfig', () => {
    it('throws in the name is not defined', () => {
      const defaultConfig = createConfig();
      const config = new EIDBDatabaseConfig(defaultConfig);
      expect(() => {
        config.getObjectStoreConfig("");
      }).to.throw();
    });
  });
});