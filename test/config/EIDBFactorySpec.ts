import {expect} from 'chai';
import {EIDBFactory, EncryptionConfig, ModuleClearText, RequestUtils} from '../../src/';
import "fake-indexeddb/auto";
import {IDBFactory} from "fake-indexeddb";


function createConfig(overrides?: any) {
  let config = {
    moduleId: ModuleClearText.MODULE_ID,
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

  if (overrides) {
    config = {...config, ...overrides};
  }
  return new EncryptionConfig(config)
}

const dbName = "testdb";

describe('EIDBFactory', () => {

  describe('constructor', () => {
    it('Not throw with valid parameters', () => {
      new EIDBFactory(new IDBFactory(), createConfig());
    });

    it('throws if delegate is not set', () => {
      expect(() => {
        new EIDBFactory(null as any, createConfig());
      }).to.throw();
    });

    it('throws if config is not set', () => {
      expect(() => {
        new EIDBFactory(new IDBFactory(), null as any);
      }).to.throw();
    });

    it('throws if the module id is not valid.', () => {
      expect(() => {
        const config = createConfig({moduleId: "none"});
        new EIDBFactory(new IDBFactory(), config);
      }).to.throw();
    });
  });

  describe('encryptionModuleId', () => {
    it('returns the correct module id', () => {
      const db = new EIDBFactory(new IDBFactory(), createConfig());
      expect(db.encryptionModuleId()).to.eq(ModuleClearText.MODULE_ID);
    });
  });

  describe('databases', () => {
    it('resolves an empty array after construction.', () => {
      const db = new EIDBFactory(new IDBFactory(), createConfig());
      return db.databases().then((dbs: IDBDatabaseInfo[]) => {
        expect(dbs).to.be.empty;
      });
    });

    it('resolves with the correct databases.', async () => {
      const dbf = new EIDBFactory(new IDBFactory(), createConfig());
      await RequestUtils.toPromise(dbf.open(dbName, 1));
      const dbs = await dbf.databases();
      expect(dbs.length).to.eq(1);
      expect(dbs[0].name).to.eq(dbName);

    });
  });

  describe('open', () => {
    it('opens a valid database.', () => {
      const db = new EIDBFactory(new IDBFactory(), createConfig());
      return RequestUtils.toPromise(db.open(dbName, 1));
    });

    it('rejects an invalid version.', () => {
      const db = new EIDBFactory(new IDBFactory(), createConfig());
      expect(() => db.open(dbName, 0)).to.throw();
    });
  });

  describe('deleteDatabase', () => {
    it('deletes an existing database.', async () => {
      const dbf = new EIDBFactory(new IDBFactory(), createConfig());
      const db = await RequestUtils.toPromise(dbf.open(dbName, 1));
      db.close();

      await RequestUtils.toPromise(dbf.deleteDatabase(dbName));
      const dbs = await dbf.databases();
      expect(dbs).to.be.empty;
    });
  });
});