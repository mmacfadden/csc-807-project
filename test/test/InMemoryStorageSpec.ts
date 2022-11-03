import {expect} from 'chai';
import {InMemoryStorage} from '../../src/test/InMemoryStorage';

const KEY = "k";
const VALUE = "value";

describe('InMemoryStorage', () => {
  describe('constructor', () => {
    it('Newly constructed storage should be empty', () => {
      const storage = new InMemoryStorage();
      expect(storage.length).to.eq(0);
    });
  });

  describe('setItem', () => {
    it('Correctly sets an key / value pair', () => {
      const storage = new InMemoryStorage();
      storage.setItem(KEY, VALUE);
      expect(storage.getItem(KEY)).to.eq(VALUE);
    });
  });

  describe('set', () => {
    it('Correctly sets an key / value pair', () => {
      const storage = new InMemoryStorage();
      storage[KEY] = VALUE;
      expect(storage.getItem(KEY)).to.eq(VALUE);
    });

    it('Set a property on the storage instead of one in the storage', () => {
      const storage = new InMemoryStorage();
      const newFunc = (key: string, value: string) => {
        return;
      };
      storage["setItem"] = newFunc;
      expect(storage["setItem"]).to.eq(newFunc);
    });
  });

  describe('getItem', () => {
    it('Correctly gets an key / value pair', () => {
      const storage = new InMemoryStorage();
      storage.setItem(KEY, VALUE);
      expect(storage.getItem(KEY)).to.eq(VALUE);
    });

    it('Returns null for a key that is not set.', () => {
      const storage = new InMemoryStorage();
      expect(storage.getItem("null")).to.be.null;
    });
  });

  describe('get', () => {
    it('Correctly gets an key / value pair', () => {
      const storage = new InMemoryStorage();
      storage.setItem(KEY, VALUE);
      expect(storage[KEY]).to.eq(VALUE);
    });

    it('Returns null for a key that is not set.', () => {
      const storage = new InMemoryStorage();
      expect(storage["null"]).to.be.null;
    });

    it('Returns a property on the storage instead of one in the storage', () => {
      const storage = new InMemoryStorage();
      expect(storage["setItem"]).to.eq(storage.setItem);
    });
  });

  describe('removeItem', () => {
    it('Correctly removes an key', () => {
      const storage = new InMemoryStorage();
      storage.setItem(KEY, VALUE);
      expect(storage[KEY]).to.eq(VALUE);

      storage.removeItem(KEY);
      expect(storage[KEY]).to.be.null;
    });

    it('Ignores removing an key it does not have', () => {
      const storage = new InMemoryStorage();
      storage.removeItem(KEY);
    });
  });

  describe('clear', () => {
    it('Removes all', () => {
      const storage = new InMemoryStorage();
      storage.setItem(KEY, VALUE);
      storage.setItem("k2", "v2");
      expect(storage.length).to.eq(2);

      storage.clear();
      expect(storage.length).to.eq(0);
    });
  });

  describe('length', () => {
    it('Newly constructed storage has zero length', () => {
      const storage = new InMemoryStorage();
      expect(storage.length).to.eq(0);
    });

    it('Returns the correct length.', () => {
      const storage = new InMemoryStorage();
      storage.setItem(KEY, VALUE);
      expect(storage.length).to.eq(1);
    });
  });

  describe('key', () => {
    it('returns a key', () => {
      const storage = new InMemoryStorage();
      storage.setItem("k1", "v");
      storage.setItem("k2", "v");
      expect(storage.key(0)).to.eq("k1");
      expect(storage.key(1)).to.eq("k2");
    });
  });
});