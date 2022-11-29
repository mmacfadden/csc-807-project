import "fake-indexeddb/auto";
import {
  EIDBDatabase,
  EIDBFactory,
  EIDBIndex,
  EIDBObjectStore,
  EncryptionConfigStorage,
  ModuleClearText,
  RequestUtils
} from "../../src";
import chai, {expect} from "chai";
chai.should();
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

const OBJECT_STORE_NAME = "store";
const INDEX_NAME = "age_index";
const INDEX_KEY_PATH = "age";

function createFactory() {
  return new EIDBFactory(
      new IDBFactory(),
      EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID)
  );
}

async function getStoreAndIndex(options?: IDBIndexParameters): Promise<{
  db: EIDBDatabase,
  store: EIDBObjectStore,
  index: EIDBIndex
}> {
  const factory = createFactory();
  const req = factory.open("name", 1);
  let store;
  let index;
  req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
    store = req.result.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id"});
    index = store.createIndex(INDEX_NAME, INDEX_KEY_PATH, options);
  };
  const db = await RequestUtils.toPromise(req);

  if (!store || !index) {
    throw new Error("could not create store and index");
  }
  return {db, store, index};
}

describe('EIDBIndex', () => {
  describe('name', () => {
    it("returns the index name", async () => {
      const {index} = await getStoreAndIndex();
      expect(index.name).to.eq(INDEX_NAME);
    });
  });

  describe('keyPath', () => {
    it("returns the keyPath", async () => {
      const {index} = await getStoreAndIndex();
      expect(index.keyPath).to.eq(INDEX_KEY_PATH);
    });
  });

  describe('objectStore', () => {
    it("returns the correct ObjectStore", async () => {
      const {store, index} = await getStoreAndIndex();
      expect(index.objectStore).to.eq(store);
    });
  });

  describe('multiEntry', () => {
    it("returns false by default", async () => {
      const {index} = await getStoreAndIndex();
      expect(index.multiEntry).to.be.false;
    });

    it("returns true if set in options", async () => {
      const {index} = await getStoreAndIndex({multiEntry: true});
      expect(index.multiEntry).to.be.true;
    });
  });

  describe('unique', () => {
    it("returns false by default", async () => {
      const {index} = await getStoreAndIndex();
      expect(index.unique).to.be.false;
    });

    it("returns true if set in options", async () => {
      const {index} = await getStoreAndIndex({unique: true});
      expect(index.unique).to.be.true;
    });
  });

  describe('count', () => {
    it("returns zero with no objects added to the store", async () => {
      const {db} = await getStoreAndIndex();
      const tx = db.transaction(OBJECT_STORE_NAME, "readonly");
      const store = tx.objectStore(OBJECT_STORE_NAME);
      const index = store.index(INDEX_NAME);
      db.close();
      return RequestUtils.toPromise(index.count()).should.eventually.eq(0);
    });
  });
});