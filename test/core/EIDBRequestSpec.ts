import {expect} from 'chai';
import sinon from "sinon";
import "fake-indexeddb/auto";
import {EIDBRequest, EncryptionConfig, EncryptionModule} from "../../src";
import {EIDBValueMapper, ValueMapper} from "../../src/core/EIDBValueMapper";
import {EIDBKeyEncryptor} from "../../src/core/EIDBKeyEncryptor";


function doneRequest() {
  return {
    readyState: "done",
    error: null,
    result: 10
  }  as IDBRequest;
}

function mockIDBRequest(): IDBRequest {
  const result = new EventTarget() as any;
  result.readyState = "pending";
  result.error = null;
  return result as IDBRequest;
}

function createMockRequest(originalRequest: IDBRequest, resultMapper?: ValueMapper<any, any>) {
  const config = {} as EncryptionConfig;
  const module = {} as EncryptionModule;
  const encryptor = {} as EIDBKeyEncryptor;
  const valueMapper = new EIDBValueMapper(config, module, encryptor);

  return new EIDBRequest(originalRequest, valueMapper, resultMapper);
}

describe('EIDBRequest', () => {

  describe('constructor', () => {
    it( "set the correct values", () => {
      const originalRequest = doneRequest();
      const request = createMockRequest(originalRequest)

      expect(request.readyState).to.eq(originalRequest.readyState);
      expect(request.error).to.eq(originalRequest.error);
      expect(request.result).to.eq(originalRequest.result);
    });
  });

  describe('result', () => {
    it( "uses mapper if supplied", () => {
      const originalRequest = doneRequest();
      const resultMapper = (source: any) => source + 1;
      const request = createMockRequest(originalRequest, resultMapper)

      expect(request.readyState).to.eq(originalRequest.readyState);
      expect(request.error).to.eq(originalRequest.error);
      expect(request.result).to.eq(resultMapper(originalRequest.result));
    });
  });

  describe('success', () => {
    it( "original method calls new wrapping method", () => {
      const originalRequest = doneRequest();
      const resultMapper = (source: any) => source + 1;
      const request = createMockRequest(originalRequest, resultMapper);

      const onSuccess = sinon.spy();
      request.onsuccess = onSuccess;

      originalRequest.onsuccess!(new Event("success"));

      expect(onSuccess.calledOnce).to.be.true;
    });
  });

  describe('error', () => {
    it( "original method calls new wrapping method", () => {
      const originalRequest = doneRequest();
      const resultMapper = (source: any) => source + 1;
      const request = createMockRequest(originalRequest, resultMapper);

      const onError = sinon.spy();
      request.onerror = onError;

      originalRequest.onerror!(new Event("error"));

      expect(onError.calledOnce).to.be.true;
    });
  });

  describe('addEventListener', () => {
    it( "calls the event listener", () => {
      const originalRequest = mockIDBRequest();
      const resultMapper = (source: any) => source + 1;
      const request = createMockRequest(originalRequest, resultMapper);

      const callback = sinon.spy();
      request.addEventListener("success", callback);
      request.dispatchEvent(new Event("success"));
      expect(callback.called).to.be.true;
    });
  });

  describe('removeEventListener', () => {
    it( "calls the event listener", () => {
      const originalRequest = mockIDBRequest();
      const resultMapper = (source: any) => source + 1;
      const request = createMockRequest(originalRequest, resultMapper);

      const callback = sinon.spy();
      request.addEventListener("success", callback);
      request.removeEventListener("success", callback);
      request.dispatchEvent(new Event("success"));
      expect(callback.called).to.be.false;
    });
  });
});