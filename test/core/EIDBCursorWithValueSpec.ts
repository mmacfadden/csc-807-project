import "fake-indexeddb/auto";
import {EIDBDatabase, EIDBFactory, EncryptionConfigStorage, ModuleClearText, RequestUtils} from "../../src";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";

chai.should();
chai.use(chaiAsPromised);

const OBJECT_STORE_NAME = "store";

async function createDbAndStore(): Promise<EIDBDatabase> {
  const config = EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID);
  const factory = new EIDBFactory(new IDBFactory(), config);
  const req = factory.open("name", 1);

  req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
    req.result.createObjectStore(OBJECT_STORE_NAME, {keyPath: "id"});
  };

  return await RequestUtils.toPromise(req);
}

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

describe('EIDBCursor', () => {
  describe('open', () => {
    it("starts with the first value if the direction is next", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      const cursor = await RequestUtils.toPromise(store.openCursor());
      expect(cursor!.source).to.eq(store);
      expect(cursor!.direction).to.eq("next");
      expect(cursor!.primaryKey).to.deep.eq(VALUE_1.id);
      expect(cursor!.key).to.deep.eq(VALUE_1.id);
      expect(cursor!.value).to.deep.eq(VALUE_1);

      db.close();
    });

    it("starts with the last value if the direction is prev", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      const cursor = await RequestUtils.toPromise(store.openCursor(null, "prev"));
      expect(cursor!.source).to.eq(store);
      expect(cursor!.direction).to.eq("prev");
      expect(cursor!.primaryKey).to.deep.eq(VALUE_4.id);
      expect(cursor!.key).to.deep.eq(VALUE_4.id);
      expect(cursor!.value).to.deep.eq(VALUE_4);

      db.close();
    });
  });

  describe('continue', () => {
    it("goes to the next value if the next direction is specified", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      return new Promise((resolve, reject) => {
        const req = store.openCursor(null, "next");
        let count = 0;
        req.onsuccess = () => {
          if (req.result && count === 0) {
            expect(req.result.value).to.deep.eq(VALUE_1);
            count++;
            req.result.continue();
          } else if (req.result && count === 1) {
            expect(req.result.value).to.deep.eq(VALUE_2);
            resolve(null);
          }
        }
      }).then(() => db.close());
    });

    it("goes to the prev value if the prev direction is specified", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      return new Promise((resolve, reject) => {
        const req = store.openCursor(null, "prev");
        let count = 0;
        req.onsuccess = () => {
          if (req.result && count === 0) {
            expect(req.result.value).to.deep.eq(VALUE_4);
            count++;
            req.result.continue();
          } else if (req.result && count === 1) {
            expect(req.result.value).to.deep.eq(VALUE_3);
            resolve(null);
          }
        }
      }).then(() => db.close());
    });

    it("goes to the specified key", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      return new Promise((resolve, reject) => {
        const req = store.openCursor(null, "next");
        let count = 0;
        req.onsuccess = () => {
          if (req.result && count === 0) {
            expect(req.result.value).to.deep.eq(VALUE_1);
            count++;
            req.result.continue(VALUE_3.id);
          } else if (req.result && count === 1) {
            expect(req.result.value).to.deep.eq(VALUE_3);
            resolve(null);
          }
        }
      }).then(() => db.close());
    });

  });

  describe('advance', () => {
    it("goes to the next value if the next direction is specified", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      return new Promise((resolve, reject) => {
        const req = store.openCursor(null, "next");
        let count = 0;
        req.onsuccess = () => {
          if (req.result && count === 0) {
            expect(req.result.value).to.deep.eq(VALUE_1);
            count++;
            req.result.advance(2);
          } else if (req.result && count === 1) {
            expect(req.result.value).to.deep.eq(VALUE_3);
            resolve(null);
          }
        }
      }).then(() => db.close());
    });

    it("goes to the prev value if the prev direction is specified", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      return new Promise((resolve, reject) => {
        const req = store.openCursor(null, "prev");
        let count = 0;
        req.onsuccess = () => {
          if (req.result && count === 0) {
            expect(req.result.value).to.deep.eq(VALUE_4);
            count++;
            req.result.advance(2);
          } else if (req.result && count === 1) {
            expect(req.result.value).to.deep.eq(VALUE_2);
            resolve(null);
          }
        }
      }).then(() => db.close());
    });
  });

  describe('continuePrimaryKey', () => {
    // TODO add tests for and Index.
    it("throws for an object store", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      return new Promise((resolve, reject) => {
        const req = store.openCursor(null, "next");
        req.onsuccess = () => {
          if (req.result) {
            expect(() => req.result!.continuePrimaryKey("3", "3")).to.throw()
            resolve(null);
          }
        }
      }).then(() => db.close());
    });
  });

  describe('delete', () => {
    it("deletes the current object", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      const cursor = await RequestUtils.toPromise(store.openCursor());
      expect(cursor!.primaryKey).to.deep.eq(VALUE_1.id);
      await RequestUtils.toPromise(cursor!.delete());

      const result = await RequestUtils.toPromise(store.get(VALUE_1.id));
      expect(result).to.be.undefined;

      db.close();
    });
  });

  describe('update', () => {
    it("updates the current object", async () => {
      const db = await createDbAndStore();
      const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(OBJECT_STORE_NAME);

      await addValues(tx, store);

      const cursor = await RequestUtils.toPromise(store.openCursor());
      expect(cursor!.primaryKey).to.deep.eq(VALUE_1.id);
      const updateData = cursor!.value;
      updateData.name = "new name";

      await RequestUtils.toPromise(cursor!.update(updateData));

      const result = await RequestUtils.toPromise(store.get(VALUE_1.id));
      expect(result).to.deep.eq(updateData);

      db.close();
    });
  });
});