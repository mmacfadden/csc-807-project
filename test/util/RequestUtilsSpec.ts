import chai from 'chai';
import chaiAsPromised from "chai-as-promised";
import "fake-indexeddb/auto";
import {IDBRequest} from "fake-indexeddb";
import {RequestUtils} from "../../src";

chai.should();
chai.use(chaiAsPromised);

describe('RequestUtils', () => {
  describe('toPromise', () => {
    it('resolves on success', () => {
      const req = {result: 5} as IDBRequest;
      const p = RequestUtils.toPromise(req);
      req.onsuccess!(new Event("success"));
      return p.should.eventually.eq(req.result);
    });

    it('rejects on failure', () => {
      const req = {error: new DOMException("error")} as IDBRequest;
      const p = RequestUtils.toPromise(req);
      req.onerror!(new Event("failure"));
      return p.should.eventually.be.rejectedWith(req.error!);
    });
  });
});