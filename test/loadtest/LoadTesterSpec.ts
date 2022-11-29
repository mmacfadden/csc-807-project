import {expect} from 'chai';
import chai from 'chai';
import chaiAsPromised from "chai-as-promised";
import "fake-indexeddb/auto";
import {
  IEncryptionConfigData,
  ILoadTestConfig,
  ILoadTesterHooks,
  ILoadTestResult, IObjectStoreConfig,
  LoadTester,
  ModuleClearText
} from "../../src";
import sinon from "sinon";
import {IDBFactory} from "fake-indexeddb";

chai.should();
chai.use(chaiAsPromised);

function createEncryptionConfig(): IEncryptionConfigData {
  return {
    moduleId: ModuleClearText.MODULE_ID,
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

function makeObjectStoreConfig(): IObjectStoreConfig {
  return {
    name: "store",

    schema: {
      "id": {
        "chance": "guid"
      }
    },

    keyPath: "id"
  };
}

function makeConfig(): ILoadTestConfig {
  return {
    encryptionConfig: createEncryptionConfig(),
    objectStoreConfig: makeObjectStoreConfig(),
    operationCount: 2
  }
}

describe('LoadTester', () => {
  describe('constructor', () => {
    it( "constructs with valid parameters", () => {
      new LoadTester(makeConfig(), new IDBFactory());
    });

    it( "throws if config is not set", () => {
      expect(() => new LoadTester(null as any as ILoadTestConfig, new IDBFactory())).to.throw();
    });

    it( "throws if indexedDb is not set", () => {
      const config = makeConfig();
      expect(() => new LoadTester(config, null as any as IDBFactory)).to.throw();
    });

    it( "throws if config.operationCount <= 0", () => {
      const config = makeConfig();
      config.operationCount = 0;
      expect(() => new LoadTester(config, new IDBFactory())).to.throw();
    });

    it( "throws if config.objectStoreConfig is not set", () => {
      const config = makeConfig();
      delete (config as any)["objectStoreConfig"];
      expect(() => new LoadTester(config, new IDBFactory())).to.throw();
    });

    it( "throws if config.objectStoreConfig.schema is not set", () => {
      const config = makeConfig();
      delete (config.objectStoreConfig as any)["schema"];
      expect(() => new LoadTester(config, new IDBFactory())).to.throw();
    });

    it( "throws if config.objectStoreConfig.keyPath is not set", () => {
      const config = makeConfig();
      delete (config.objectStoreConfig as any)["keyPath"];
      expect(() => new LoadTester(config, new IDBFactory())).to.throw();
    });
  });

  describe('loadTest', () => {
    it("run the correct number of tests", () => {
      const config = makeConfig()
      const lt = new LoadTester(config, new IDBFactory());
      const result = lt.loadTest();
      return result.then(r => r.operationCount)
          .should.eventually.eq(config.operationCount);
    });

    it("call proper hooks", async () => {
      const config = makeConfig();
      const testingStarted = sinon.spy();
      const testStarted = sinon.spy();
      const objectCompleted = sinon.spy();
      const testFinished = sinon.spy();
      const testingFinished = sinon.spy();

      const hooks: ILoadTesterHooks = {
        testingStarted,
        testStarted,
        objectCompleted,
        testFinished,
        testingFinished
      }
      const lt = new LoadTester(config, new IDBFactory());
      await lt.loadTest(hooks);

      expect(testingStarted.called).to.be.false;
      expect(testStarted.called).to.be.true;
      expect(testFinished.called).to.be.true;
      expect(testingFinished.called).to.be.false;
      expect(objectCompleted.callCount).to.eq(2);
    });
  });

  describe('testEncryptionConfigs', () => {
    it("run the correct number of tests", async () => {
      const testingStarted = sinon.spy();
      const testStarted = sinon.spy();
      const objectCompleted = sinon.spy();
      const testFinished = sinon.spy();
      const testingFinished = sinon.spy();

      const hooks: ILoadTesterHooks = {
        testingStarted,
        testStarted,
        objectCompleted,
        testFinished,
        testingFinished
      }

      const objectStoreConfig = makeObjectStoreConfig();
      const encryptionConfig = createEncryptionConfig();
      const results = await LoadTester.testEncryptionConfigs(
          [encryptionConfig],
          [objectStoreConfig],
          2,
          new IDBFactory(),
          hooks
      );

      expect(results.length).to.eq(1);

      expect(results[0].operationCount).to.eq(2);
      expect(results[0].moduleId).to.eq(encryptionConfig.moduleId);
      expect(results[0].schemaName).to.eq(objectStoreConfig.name);

      expect(testingStarted.called).to.be.true;
      expect(testStarted.called).to.be.true;
      expect(testFinished.called).to.be.true;
      expect(testingFinished.called).to.be.true;
      expect(objectCompleted.callCount).to.eq(2);

    });
  });
});