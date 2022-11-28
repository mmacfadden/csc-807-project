import {expect} from 'chai';
import {DocumentGenerator} from "../../src";

describe('DocumentGenerator', () => {
  describe('constructor', () => {
    it( "generates an empty document", () => {
      const doc = DocumentGenerator.generateDocument({});
      expect(doc).to.deep.eq({});
    });

    it( "generates document with a schema", () => {
      const doc = DocumentGenerator.generateDocument({
        "id": {
          "chance": "guid"
        }
      });
      expect(doc.id).to.be.a("string");
    });
  });
});