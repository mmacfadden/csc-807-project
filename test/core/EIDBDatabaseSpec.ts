import {expect} from 'chai';
import "fake-indexeddb/auto";
import {EIDBDatabase, EIDBFactory, EncryptionConfigStorage, ModuleClearText, RequestUtils} from "../../src";


function createFactory() {
  return new EIDBFactory(
      new IDBFactory(),
      EncryptionConfigStorage.generateDefaultConfig(ModuleClearText.MODULE_ID)
  );
}

describe('EIDBDatabase', () => {

  describe('constructor', () => {
    it("set the correct values", async () => {
      const factory = createFactory();
      const db = await RequestUtils.toPromise(factory.open("name", 1));

      expect(db.name).to.eq("name");
      expect(db.version).to.eq(1);
      expect(db.objectStoreNames.length).to.eq(0);
    });
  });

  describe('close', () => {
    it("close the database and call on close", async () => {
      const factory = createFactory();
      const db = await RequestUtils.toPromise(factory.open("name", 1));
      db.close();
      expect(() => db.transaction("name")).to.throw();
    });
  });

  describe('createObjectStore()', () => {
    it("close the database and call on close", async () => {
      const factory = createFactory();
      const req = factory.open("name", 1);

      req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
        const store = req.result.createObjectStore("store1", {keyPath: "id"});
        expect(store.keyPath).to.eq("id");
        expect(store.name).to.eq("store1");
      };
      await RequestUtils.toPromise(req);

      expect(req.result.objectStoreNames.length).to.eq(1);
      expect(req.result.objectStoreNames.item(0)).to.eq("store1");
    });
  });

  describe('deleteObjectStore()', () => {
    it("deletes an existing object store", async () => {
      const factory = createFactory();
      const req = factory.open("name", 1);

      req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
        const store = req.result.createObjectStore("store1", {keyPath: "id"});
        req.result.deleteObjectStore(store.name);
      };
      await RequestUtils.toPromise(req);

      expect(req.result.objectStoreNames.length).to.eq(0);
    });
  });

  describe('transaction', () => {
    it("gets an existing store", async () => {
      const factory = createFactory();
      const req = factory.open("name", 1);

      req.onupgradeneeded = (_: IDBVersionChangeEvent) => {
        req.result.createObjectStore("store", {keyPath: "id"});
      };
      await RequestUtils.toPromise(req);
      const tx = req.result.transaction("store");
      expect(tx.objectStoreNames.length).to.eq(1);
      expect(tx.objectStoreNames.item(0)).to.eq("store");
    });
  });
});