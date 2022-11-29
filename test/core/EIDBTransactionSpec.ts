import {expect} from 'chai';
import sinon from "sinon";
import "fake-indexeddb/auto";
import {EncryptionConfig, EncryptionModule} from "../../src";
import {EIDBValueMapper, ValueMapper} from "../../src/core/EIDBValueMapper";
import {EIDBKeyEncryptor} from "../../src/core/EIDBKeyEncryptor";
import {EIDBTransaction} from "../../src/core/EIDBTransaction";
import {IDBTransaction} from "fake-indexeddb";

function createMockTransaction(delegate: IDBTransaction) {
  const config = {} as EncryptionConfig;
  const module = {} as EncryptionModule;
  const encryptor = {} as EIDBKeyEncryptor;
  const valueMapper = new EIDBValueMapper(config, module, encryptor);

  return new EIDBTransaction(delegate, valueMapper);
}

describe('EIDBTransaction', () => {

  describe('constructor', () => {
    it( "set the correct values", () => {

      const delegate = {
        durability: "relaxed",
        mode: "readwrite",
        error: null,
        objectStoreNames: ["store"] as any as DOMStringList
      } as IDBTransaction;
      const tx = createMockTransaction(delegate)

      expect(tx.durability).to.eq(delegate.durability);
      expect(tx.mode).to.eq(delegate.mode);
      expect(tx.error).to.eq(delegate.error);
      expect(tx.objectStoreNames).to.eq(delegate.objectStoreNames);
    });
  });

  describe('abort', () => {
    it( "calls abort on the delegate", () => {
      const delegate = {
        abort: sinon.spy(),
      } as any as IDBTransaction;
      const tx = createMockTransaction(delegate)

      tx.abort();

      expect((delegate.abort as sinon.SinonSpy).called).to.be.true;
    })
  });

  describe('commit', () => {
    it( "calls abort on the delegate", () => {
      const delegate = {
        commit: sinon.spy(),
      } as any as IDBTransaction;
      const tx = createMockTransaction(delegate)

      tx.commit();

      expect((delegate.commit as sinon.SinonSpy).called).to.be.true;
    })
  });
});