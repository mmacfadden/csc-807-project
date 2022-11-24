import {expect} from 'chai';
import {NamespacedStorage} from "../../src/config/NamespacedStorage";
import {InMemoryStorage} from "../../src/test/InMemoryStorage";
import * as CryptoJS from "crypto-js";


describe('InMemoryStorage', () => {

  describe('constructor', () => {
    it('Not throw with valid parameters', () => {
      const rawStorage = new InMemoryStorage();
      new NamespacedStorage(rawStorage, "prefix", null);
    });

    it('throw if storage is not defined', () => {
      expect(() => {
        new NamespacedStorage(null as any as Storage, "prefix", null);
      }).to.throw();
    });

    it('throw if prefix is not defined', () => {
      const rawStorage = new InMemoryStorage();
      expect(() => {
        new NamespacedStorage(rawStorage, "", null);
      }).to.throw();
    });
  });

  describe('setItem', () => {
    it('Set the correct item.', () => {
      const rawStorage = new InMemoryStorage();
      const storage = new NamespacedStorage(rawStorage, "prefix", null);

      expect(storage.getItem("key")).to.be.null;

      storage.setItem("key", "value");
      const read = storage.getItem("key");

      expect(read).to.eq("value");
      expect(storage.getItem("none")).to.be.null;
    });

    it('throw if key is not defined', () => {
      const rawStorage = new InMemoryStorage();
      const storage = new NamespacedStorage(rawStorage, "prefix", null);
      expect(() => {
        storage.setItem(null as any as string, "value");
      }).to.throw();
    });

    it('throw if value is not defined', () => {
      const rawStorage = new InMemoryStorage();
      const storage = new NamespacedStorage(rawStorage, "prefix", null);
      expect(() => {
        storage.setItem("key", null as any as string);
      }).to.throw();
    });

    it('not conflict between prefixes', () => {
      const rawStorage = new InMemoryStorage();
      const storage1 = new NamespacedStorage(rawStorage, "prefix1", null);
      const storage2 = new NamespacedStorage(rawStorage, "prefix2", null);

      storage1.setItem("key", "value");
      expect(storage1.getItem("key")).to.eq("value");
      expect(storage2.getItem("key")).to.be.null;
    });

    it('not conflict between usernames', () => {
      const rawStorage = new InMemoryStorage();
      const storage1 = new NamespacedStorage(rawStorage, "prefix", "user1");
      const storage2 = new NamespacedStorage(rawStorage, "prefix", "user2");

      storage1.setItem("key", "value");
      expect(storage1.getItem("key")).to.eq("value");
      expect(storage2.getItem("key")).to.be.null;
    });

    it('not conflict between usernames and prefixes', () => {
      const username = "user1"
      const hash = CryptoJS.enc.Base64.stringify(CryptoJS.SHA512(username));

      const rawStorage = new InMemoryStorage();
      const storage1 = new NamespacedStorage(rawStorage, `prefix_${hash}`, null);
      const storage2 = new NamespacedStorage(rawStorage, "prefix", username);

      storage1.setItem("key", "value");
      expect(storage1.getItem("key")).to.eq("value");
      expect(storage2.getItem("key")).to.be.null;
    });
  });

  describe('getItem', () => {
    it('throw if key is not defined', () => {
      const rawStorage = new InMemoryStorage();
      const storage = new NamespacedStorage(rawStorage, "prefix", null);
      expect(() => {
        storage.getItem(null as any as string);
      }).to.throw();
    });

    it('return null for a key that does not exist', () => {
      const rawStorage = new InMemoryStorage();
      const storage = new NamespacedStorage(rawStorage, "prefix", null);
      expect(storage.getItem("key")).to.be.null;
    });
  });

  describe('hasItem', () => {
    it('throw if key is not defined', () => {
      const rawStorage = new InMemoryStorage();
      const storage = new NamespacedStorage(rawStorage, "prefix", null);
      expect(() => {
        storage.hasItem(null as any as string);
      }).to.throw();
    });

    it('return false for a key that does not exist', () => {
      const rawStorage = new InMemoryStorage();
      const storage = new NamespacedStorage(rawStorage, "prefix", null);
      expect(storage.hasItem("key")).to.be.false;
    });

    it('return true for a key that is set', () => {
      const rawStorage = new InMemoryStorage();
      const storage = new NamespacedStorage(rawStorage, "prefix", null);
      storage.setItem("key", "value");
      expect(storage.hasItem("key")).to.be.true;
    });
  });

  describe('removeItem', () => {
    it('throw if key is not defined', () => {
      const rawStorage = new InMemoryStorage();
      const storage = new NamespacedStorage(rawStorage, "prefix", null);
      expect(() => {
        storage.removeItem(null as any as string);
      }).to.throw();
    });

    it('remove an item that exists', () => {
      const rawStorage = new InMemoryStorage();
      const storage = new NamespacedStorage(rawStorage, "prefix", null);

      expect(storage.hasItem("key")).to.be.false;

      storage.setItem("key", "value");
      expect(storage.hasItem("key")).to.be.true;

      storage.removeItem("key");
      expect(storage.hasItem("key")).to.be.false;
    });

    it('silently do nothing for a value that does not exist', () => {
      const rawStorage = new InMemoryStorage();
      const storage = new NamespacedStorage(rawStorage, "prefix", null);
      storage.removeItem("key");
    });
  });
});