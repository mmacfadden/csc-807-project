import "fake-indexeddb/auto";
import {
  EIDBDatabase,
  EIDBFactory,
  EIDBObjectStore,
  EncryptionConfigStorage,
  ModuleClearText,
  RequestUtils
} from "../../src";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {Done} from "mocha";

chai.should();
chai.use(chaiAsPromised);

const OBJECT_STORE_NAME = "store";

async function createDbAndStore(autoIncrement: boolean = false): Promise<EIDBDatabase> {
  const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
  const factory = new EIDBFactory(new IDBFactory(), config);
  const req = factory.open("name", 1);

  req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
    req.result.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id", autoIncrement});
  };

  return await RequestUtils.toPromise(req);
}

const VALUE_1 = {id: "id1", name: "John"};
const VALUE_2 = {id: "id2", name: "Tim"};
const VALUE_3 = {id: "id3", name: "Jennifer"};
const VALUE_4 = {id: "id4", name: "Amanda"};
const ALL_VALUES = [VALUE_1, VALUE_2, VALUE_3, VALUE_4];
ALL_VALUES.forEach(v => Object.freeze(v));
Object.freeze(ALL_VALUES);

async function addValues(tx: IDBTransaction, store: IDBObjectStore) {
  await RequestUtils.toPromise(store.add(VALUE_1));
  await RequestUtils.toPromise(store.add(VALUE_2));
  await RequestUtils.toPromise(store.add(VALUE_3));
  await RequestUtils.toPromise(store.add(VALUE_4));
}

describe('EIDBObjectStore', () => {

  describe('autoIncrement', () => {
    it("returns false if not set explicitly", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      expect(store.autoIncrement).to.be.false;
      db.close();
    });

    it("returns true if not set", async () => {
      const db = await createDbAndStore(true);
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      expect(store.autoIncrement).to.be.true;
      db.close();
    });
  });

  describe('keyPath', () => {
    it("returns the correct key path", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      expect(store.keyPath).to.eq("id");
      db.close();
    });
  });

  describe('name', () => {
    it("returns the correct name", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      expect(store.name).to.eq(OBJECT_STORE_NAME);
      db.close();
    });
  });

  describe('add', () => {
    it("adds a value that doesn't exist", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const key = await RequestUtils.toPromise(store.add(VALUE_1));
      expect(key).to.deep.eq(VALUE_1.id);
      const result = await RequestUtils.toPromise(store.get(VALUE_1.id));

      expect(result).to.deep.eq(VALUE_1);

      db.close();
    });

    it("fails to add a duplicate", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      setTimeout(() => db.close(), 0);

      return RequestUtils.toPromise(store.add(VALUE_1)).should.eventually.rejectedWith();
    });
  });

  describe('put', () => {
    it("updates a value that exists", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);
      const updated = {...VALUE_1, name: "Paul"};
      const key = await RequestUtils.toPromise(store.put(updated));
      expect(key).to.deep.eq(VALUE_1.id);
      const result = await RequestUtils.toPromise(store.get(VALUE_1.id));

      expect(result).to.deep.eq(updated);

      db.close();
    });

    it("puts a value that doesn't exist", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const key = await RequestUtils.toPromise(store.put(VALUE_1));
      expect(key).to.deep.eq(VALUE_1.id);
      const result = await RequestUtils.toPromise(store.get(VALUE_1.id));

      expect(result).to.deep.eq(VALUE_1);
    });
  });

  describe('get', () => {
    it("returns the correct value", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      const result = await RequestUtils.toPromise(store.get(VALUE_1.id));

      expect(result).to.deep.eq(VALUE_1);

      db.close();
    });

    it("returns undefined if the key does not exist", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      const result = await RequestUtils.toPromise(store.get("none"));
      expect(result).to.be.undefined;

      db.close();
    });
  });

  describe('clear', () => {
    it("deletes all data", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      await RequestUtils.toPromise(store.clear());

      const data = await RequestUtils.toPromise(store.getAll());
      expect(data).to.be.empty;

      db.close();
    });
  });

  describe('delete', () => {
    it("delete the correct object", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      await RequestUtils.toPromise(store.delete(VALUE_2.id));

      const data = await RequestUtils.toPromise(store.getAll());
      expect(data).to.deep.eq([VALUE_1, VALUE_3, VALUE_4]);

      db.close();
    });
  });

  describe('getAll', () => {
    it("gets the correct keys with no query", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      const data = await RequestUtils.toPromise(store.getAll());

      expect(data).to.deep.eq([VALUE_1, VALUE_2, VALUE_3, VALUE_4]);

      db.close();
    });

    it("gets the correct keys with a query", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);
      const query = IDBKeyRange.bound(VALUE_2.id, VALUE_3.id);
      const data = await RequestUtils.toPromise(store.getAll(query));

      expect(data).to.deep.eq([VALUE_2, VALUE_3]);

      db.close();
    });

    it("returns an empty array with no data", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const data = await RequestUtils.toPromise(store.getAll());
      expect(data).to.be.empty;

      db.close();
    });
  });

  describe('getAllKeys', () => {
    it("gets the correct keys with no query", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      const keys = await RequestUtils.toPromise(store.getAllKeys());

      expect(keys).to.deep.eq([VALUE_1.id, VALUE_2.id, VALUE_3.id, VALUE_4.id]);

      db.close();
    });

    it("gets the correct keys with a query", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);
      const query = IDBKeyRange.bound(VALUE_2.id, VALUE_3.id);
      const keys = await RequestUtils.toPromise(store.getAllKeys(query));

      expect(keys).to.deep.eq([VALUE_2.id, VALUE_3.id]);

      db.close();
    });

    it("returns an empty array with no data", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const keys = await RequestUtils.toPromise(store.getAllKeys());

      expect(keys).to.be.empty;

      db.close();
    });
  });

  describe('getKey', () => {
    it("gets the correct keys", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      const range: IDBKeyRange = IDBKeyRange.lowerBound(VALUE_2.id);
      const key = await RequestUtils.toPromise(store.getKey(range));

      expect(key).to.eq(VALUE_2.id);

      db.close();
    });

    it("returns an empty array with no data", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const range: IDBKeyRange = IDBKeyRange.lowerBound(VALUE_2.id);
      const key = await RequestUtils.toPromise(store.getKey(range));

      expect(key).to.be.undefined;

      db.close();
    });
  });

  describe('count', () => {
    it("gets the correct count", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      const count = await RequestUtils.toPromise(store.count());
      expect(count).to.eq(4);
      db.close();
    });

    it("returns 0 with no data", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const count = await RequestUtils.toPromise(store.count());
      expect(count).to.eq(0);

      db.close();
    });
  });

  describe('openCursor', () => {
    it("result is null when there is not data", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);
      const cursor = await RequestUtils.toPromise(store.openCursor());
      expect(cursor).to.be.null;
    });

    it("starts at the beginning with next direction", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);
      await addValues(tx, store);
      const cursor = await RequestUtils.toPromise(store.openCursor());
      expect(cursor!.value).to.deep.eq(VALUE_1);
    });

    it("starts at the beginning of a range next direction", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);
      await addValues(tx, store);
      const query = IDBKeyRange.bound(VALUE_2.id, VALUE_3.id)
      const cursor = await RequestUtils.toPromise(store.openCursor(query));
      expect(cursor!.value).to.deep.eq(VALUE_2);
    });

    it("starts at the end with next direction", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);
      await addValues(tx, store);
      const cursor = await RequestUtils.toPromise(store.openCursor(null, "prev"));
      expect(cursor!.value).to.deep.eq(VALUE_4);
    });
  });

  describe('openKeyCursor', () => {
    it("result is null when there is not data", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);
      const cursor = await RequestUtils.toPromise(store.openKeyCursor());
      expect(cursor).to.be.null;
    });

    it("Has correct default values", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);
      await addValues(tx, store);
      const cursor = await RequestUtils.toPromise(store.openKeyCursor());
      expect(cursor!.source).to.eq(store);
      expect(cursor!.direction).to.eq("next");
      expect(cursor!.direction).to.eq("next");
    });

    it("starts at the beginning with next direction", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);
      await addValues(tx, store);
      const cursor = await RequestUtils.toPromise(store.openKeyCursor());
      expect(cursor!.key).to.eq(VALUE_1.id);
      expect(cursor!.primaryKey).to.eq(VALUE_1.id);
    });

    it("starts at the beginning of a range next direction", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);
      await addValues(tx, store);
      const query = IDBKeyRange.bound(VALUE_2.id, VALUE_3.id)
      const cursor = await RequestUtils.toPromise(store.openKeyCursor(query));
      expect(cursor!.key).to.eq(VALUE_2.id);
      expect(cursor!.primaryKey).to.eq(VALUE_2.id);
    });

    it("starts at the end with next direction", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);
      await addValues(tx, store);
      const cursor = await RequestUtils.toPromise(store.openKeyCursor(null, "prev"));
      expect(cursor!.key).to.eq(VALUE_4.id);
      expect(cursor!.primaryKey).to.eq(VALUE_4.id);
    });
  });

  describe('createIndex', () => {
    it("creates a new index",  (done: Done) => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      const req = factory.open("name", 1);

      req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
        try {
          const db = req.result;
          const store = db.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id"});
          const index = store.createIndex("age", "age");
          expect(index).to.not.be.undefined;
          expect(index.name).to.eq("age");
          done();
        } catch (e) {
          done(e);
        }
      };
    });

    it("does not allow duplicates",  (done: Done) => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      const req = factory.open("name", 1);

      req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
        try {
          const db = req.result;
          const store = db.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id"});
          store.createIndex("age", "age");
          expect(() => store.createIndex("age", "age")).to.throw();
          done();
        } catch (e) {
          done(e);
        }
      };
    });
  });

  describe('indexNames', () => {
    it("gets the correct index names",  (done: Done) => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      const req = factory.open("name", 1);

      req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
        try {
          const db = req.result;
          const store = db.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id"});
          store.createIndex("age", "age");

          expect(store.indexNames.length).to.eq(1);
          expect(store.indexNames.item(0)).to.eq("age");
          done();
        } catch (e) {
          done(e);
        }
      };
    });

    it("returns an empty list if no indices exist.",  (done: Done) => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      const req = factory.open("name", 1);

      req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
        try {
          const db = req.result;
          const store = db.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id"});
          expect(store.indexNames.length).to.eq(0);
          done();
        } catch (e) {
          done(e);
        }
      };
    });

    describe('deleteIndex', () => {
      it("deletes an existing index",  (done: Done) => {
        const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
        const factory = new EIDBFactory(new IDBFactory(), config);
        const req = factory.open("name", 1);

        req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
          try {
            const db = req.result;
            const store = db.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id"});
            const index = store.createIndex("age", "age");
            expect(index.name).to.eq("age");
            store.deleteIndex("age");
            expect(store.indexNames.length).to.eq(0);
            done();
          } catch (e) {
            done(e);
          }
        };
      });

      it("throws if the index does not exist.",  (done: Done) => {
        const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
        const factory = new EIDBFactory(new IDBFactory(), config);
        const req = factory.open("name", 1);

        req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
          try {
            const db = req.result;
            const store = db.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id"});
            expect(() => store.deleteIndex("age")).to.throw();
            done();
          } catch (e) {
            done(e);
          }
        };
      });
    });
  });

  describe('index', () => {
    it("gets the correct index if it exists",  (done: Done) => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      const req = factory.open("name", 1);

      req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
        try {
          const db = req.result;
          const store = db.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id"});
          store.createIndex("age", "age");
          const index = store.index("age");
          expect(index.name).to.eq("age");
          done();
        } catch (e) {
          done(e);
        }
      };
    });

    it("throws if the index does not exists.",  (done: Done) => {
      const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
      const factory = new EIDBFactory(new IDBFactory(), config);
      const req = factory.open("name", 1);

      req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
        try {
          const db = req.result;
          const store = db.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id"});
          expect(() => store.index("age")).to.throw();
          done();
        } catch (e) {
          done(e);
        }
      };
    });
  });
});