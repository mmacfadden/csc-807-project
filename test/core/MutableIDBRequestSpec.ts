import {expect} from 'chai';
import sinon from "sinon";

import {MutableIDBRequest} from "../../src/core/MutableIDBRequest";
import "fake-indexeddb/auto";
import {IDBObjectStore, IDBTransaction} from "fake-indexeddb";

describe('MutableIDBRequest', () => {

  describe('constructor', () => {
    it( "set the correct values", () => {
      const source = {} as any as IDBObjectStore;
      const tx = {} as any as IDBTransaction;

      const request = new MutableIDBRequest(source, tx);
      expect(request.source).to.eq(source);
      expect(request.transaction).to.eq(tx);
      expect(request.readyState).to.eq("pending");
      expect(request.result).to.be.undefined;
      expect(request.error).to.be.null;
    });
  });

  describe('fail', () => {
    it( "set the correct values", () => {
      const source = {} as any as IDBObjectStore;
      const tx = {} as any as IDBTransaction;

      const onFail = sinon.spy();
      const onSuccess = sinon.spy();

      const request = new MutableIDBRequest(source, tx);
      request.onerror = onFail;
      request.onsuccess = onSuccess;

      const error = new DOMException("fail");
      request.fail(error);
      expect(onFail.calledOnce).to.be.true;
      expect(onSuccess.called).to.be.false;
      expect(request.readyState).to.eq("done");
      expect(request.error).to.eq(error);
      expect(request.result).to.be.undefined;
    });
  });

  describe('succeed', () => {
    it( "set the correct values", () => {
      const source = {} as any as IDBObjectStore;
      const tx = {} as any as IDBTransaction;

      const onFail = sinon.spy();
      const onSuccess = sinon.spy();

      const request = new MutableIDBRequest(source, tx);
      request.onerror = onFail;
      request.onsuccess = onSuccess;

      const result = "result";
      request.succeed(result);
      expect(onSuccess.calledOnce).to.be.true;
      expect(onFail.called).to.be.false;
      expect(request.readyState).to.eq("done");
      expect(request.result).to.eq(result);
      expect(request.error).to.be.null;
    });
  });
});