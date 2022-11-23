import {expect} from 'chai';
import {IObjectStoreConfigData} from "../../src";
import sinon from "sinon";
import {EIDBObjectStoreConfig} from "../../src/config/EIDBObjectStoreConfig";

function createConfig(): IObjectStoreConfigData {
  return {
    keyPath: "key",
    indices: {}
  }
}

describe('EIDBObjectStoreConfig', () => {
  describe('constructor', () => {
    it('Not throw with valid parameters', () => {
      const defaultConfig = createConfig();
      const config = new EIDBObjectStoreConfig(defaultConfig);
      expect(config.toJSON()).to.deep.eq(defaultConfig);
    });

    it('throw if the config is not provide', () => {
      expect(() => {
        new EIDBObjectStoreConfig(null as any);
      }).to.throw();
    });
  });

  describe('getKeyPath', () => {
    it('Not throw with valid parameters', () => {
      const defaultConfig = createConfig();
      const config = new EIDBObjectStoreConfig(defaultConfig);
      expect(config.getKeyPath()).to.deep.eq(defaultConfig.keyPath);
    });
  });

  describe('createIndex', () => {
    it('add an index', () => {
      const defaultConfig = createConfig();
      const config = new EIDBObjectStoreConfig(defaultConfig);
      config.createIndex("foo", "bar");
      expect(config.getIndex("foo")).to.eq("bar");
    });

    it('throw if an index already exists', () => {
      const defaultConfig = createConfig();
      const config = new EIDBObjectStoreConfig(defaultConfig);
      config.createIndex("foo", "bar");
      expect(() => {
        config.createIndex("foo", "bar");
      }).to.throw();
    });

    it('throw if index is not define', () => {
      const defaultConfig = createConfig();
      const config = new EIDBObjectStoreConfig(defaultConfig);
      expect(() => {
        config.createIndex("", "bar");
      }).to.throw();
    });

    it('throw if keyPath is not define', () => {
      const defaultConfig = createConfig();
      const config = new EIDBObjectStoreConfig(defaultConfig);
      expect(() => {
        config.createIndex("foo", "");
      }).to.throw();
    });

    it('calls updated', () => {
      const defaultConfig = createConfig();
      const update = sinon.spy();
      const config = new EIDBObjectStoreConfig(defaultConfig, update);
      config.createIndex("foo", "bar");
      expect(update.called).to.be.true;
    });
  });

  describe('getIndex', () => {
    it('throw if index is not define', () => {
      const defaultConfig = createConfig();
      const config = new EIDBObjectStoreConfig(defaultConfig);
      expect(() => {
        config.getIndex("");
      }).to.throw();
    });

    it('throw if index does not exist', () => {
      const defaultConfig = createConfig();
      const config = new EIDBObjectStoreConfig(defaultConfig);
      expect(() => {
        config.getIndex("foo");
      }).to.throw();
    });
  });

  describe('removeIndex', () => {
    it('throw if index is not define', () => {
      const defaultConfig = createConfig();
      const config = new EIDBObjectStoreConfig(defaultConfig);
      expect(() => {
        config.removeIndex("");
      }).to.throw();
    });

    it('throw if index does not exist', () => {
      const defaultConfig = createConfig();
      const config = new EIDBObjectStoreConfig(defaultConfig);
      expect(() => {
        config.removeIndex("foo");
      }).to.throw();
    });

    it('throw if index does not exist', () => {
      const defaultConfig = createConfig();
      const config = new EIDBObjectStoreConfig(defaultConfig);
      config.createIndex("foo", "bar");
      config.removeIndex("foo");
      expect(config.toJSON()).to.deep.eq(defaultConfig);
    });

    it('calls updated', () => {
      const defaultConfig = createConfig();
      const update = sinon.spy();
      const config = new EIDBObjectStoreConfig(defaultConfig, update);
      config.createIndex("foo", "bar");
      config.removeIndex("foo");
      expect(update.called).to.be.true;
    });
  });
});