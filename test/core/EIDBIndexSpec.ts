import "fake-indexeddb/auto";
import {EIDBDatabase, EIDBFactory, EncryptionConfigStorage, ModuleClearText, RequestUtils} from "../../src";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";

chai.should();
chai.use(chaiAsPromised);

const OBJECT_STORE_NAME = "store";
const INDEX_NAME = "name_index";
const INDEX_KEY = "name";

const VALUE_1 = {id: "id1", name: "John"};
const VALUE_2 = {id: "id2", name: "Tim"};
const VALUE_3 = {id: "id3", name: "Jennifer"};
const VALUE_4 = {id: "id4", name: "Amanda"};

async function addValues(tx: IDBTransaction, store: IDBObjectStore) {
  await RequestUtils.toPromise(store.add(VALUE_1));
  await RequestUtils.toPromise(store.add(VALUE_2));
  await RequestUtils.toPromise(store.add(VALUE_3));
  await RequestUtils.toPromise(store.add(VALUE_4));
}

async function createDatabase(indexConstructor?: (store: IDBObjectStore) => void): Promise<IDBDatabase> {
  const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
  const factory = new EIDBFactory(new IDBFactory(), config);
  const req = factory.open("name", 1);

  req.onupgradeneeded = () => {
    const db = req.result;
    const store = db.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id"});
    if (indexConstructor) {
      indexConstructor(store);
    } else {
      store.createIndex(INDEX_NAME, INDEX_KEY);
    }
  };

  return new Promise(resolve => {
    req.onsuccess = () => {
      const db = req.result;
      resolve(db);
    };
  })
}

describe('EIDBIndex', () => {
  describe('constructed', () => {
    it("has the appropriate defaults", async () => {
      const db = await createDatabase();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const index = store.index(INDEX_NAME);
      expect(index.unique).to.be.false;
      expect(index.multiEntry).to.be.false;
    });

    it("accepts the correct options", async () => {
      const db = await createDatabase(store => {
        store.createIndex(INDEX_NAME, INDEX_KEY, {unique: true, multiEntry: true});
      });
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);
      await addValues(tx, store);

      const index = store.index(INDEX_NAME);
      expect(index.unique).to.be.true;
      expect(index.multiEntry).to.be.true;
    });
  });

  describe('name', () => {
    it("returns the index name", async () => {
      const db = await createDatabase();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const index = store.index(INDEX_NAME);
      expect(index.name).to.eq(INDEX_NAME);
    });
  });

  describe('store', () => {
    it("returns the owning Object Store", async () => {
      const db = await createDatabase();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const index = store.index(INDEX_NAME);
      expect(index.objectStore).to.eq(store);
    });
  });

  describe('keyPath', () => {
    it("returns the key path", async () => {
      const db = await createDatabase();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const index = store.index(INDEX_NAME);
      expect(index.keyPath).to.eq(INDEX_KEY);
    });
  });

  // TODO add test that test the functionality with data.
  describe('get()', () => {
    it("returns undefined if an element does not exist", async () => {
      const db = await createDatabase();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const index = store.index(INDEX_NAME);
      const value = await RequestUtils.toPromise(index.get(VALUE_1.id));
      expect(value).to.be.undefined;
    });
  });

  describe('getAll()', () => {
    it("returns undefined if an element does not exist", async () => {
      const db = await createDatabase();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const index = store.index(INDEX_NAME);
      const value = await RequestUtils.toPromise(index.getAll());
      expect(value).to.deep.eq([]);
    });
  });

  describe('getKey()', () => {
    it("returns undefined if an element does not exist", async () => {
      const db = await createDatabase();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const index = store.index(INDEX_NAME);
      const value = await RequestUtils.toPromise(index.getKey(VALUE_1.id));
      expect(value).to.be.undefined;
    });
  });

  describe('getAllKeys()', () => {
    it("returns undefined if an element does not exist", async () => {
      const db = await createDatabase();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const index = store.index(INDEX_NAME);
      const value = await RequestUtils.toPromise(index.getAllKeys());
      expect(value).to.deep.eq([]);
    });
  });

  describe('count', () => {
    it("returns zero with no objects added to the store", async () => {
      const db = await createDatabase();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      const index = store.index(INDEX_NAME);
      const value = await RequestUtils.toPromise(index.count());
      expect(value).to.eq(0);
    });
  });
});